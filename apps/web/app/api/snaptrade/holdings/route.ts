import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getAllHoldings, getAccountHoldings } from '@/lib/snaptrade/client';
import type { Position } from '@/types/trading';
import type { UserBrokerPartial } from '@/lib/snaptrade/db-types';

/**
 * GET /api/snaptrade/holdings
 * Get holdings for all connected accounts or a specific account
 *
 * Query params:
 * - accountId: (optional) specific account to get holdings for
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('accountId');

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's SnapTrade credentials
    const { data: userBroker } = await supabase
      .from('user_brokers' as any)
      .select('snaptrade_user_id, snaptrade_user_secret')
      .eq('user_id', user.id)
      .single() as { data: UserBrokerPartial | null };

    if (!userBroker?.snaptrade_user_id || !userBroker?.snaptrade_user_secret) {
      return NextResponse.json({
        holdings: [],
        totalValue: 0,
        message: 'No brokerage connected',
      });
    }

    // Fetch holdings
    let holdings;
    if (accountId) {
      const accountHoldings = await getAccountHoldings(
        userBroker.snaptrade_user_id,
        userBroker.snaptrade_user_secret,
        accountId
      );
      holdings = [accountHoldings];
    } else {
      holdings = await getAllHoldings(
        userBroker.snaptrade_user_id,
        userBroker.snaptrade_user_secret
      );
    }

    // Transform to our standard format
    let totalValue = 0;
    const allPositions: Array<Position & { accountId: string; accountName: string; brokerage: string }> = [];
    const balancesByAccount: Record<string, { cash: number; buyingPower: number | null; currency: string }> = {};

    for (const holding of holdings) {
      const accountValue = holding.total_value?.amount || 0;
      totalValue += accountValue;

      // Process balances
      for (const balance of holding.balances) {
        balancesByAccount[holding.account.id] = {
          cash: balance.cash,
          buyingPower: balance.buying_power,
          currency: balance.currency.code,
        };
      }

      // Process positions
      for (const position of holding.positions) {
        // Calculate unrealized P&L
        const currentValue = position.price * position.units;
        const avgPrice = position.average_purchase_price || position.price;
        const costBasis = avgPrice * position.units;
        const unrealizedPl = currentValue - costBasis;
        const unrealizedPlPercent = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0;

        allPositions.push({
          // Standard position fields
          assetId: position.symbol.id,
          symbol: position.symbol.symbol,
          exchange: position.symbol.exchange?.code || '',
          assetClass: position.symbol.type?.code || 'equity',
          avgEntryPrice: avgPrice,
          qty: position.units,
          side: position.units >= 0 ? 'long' : 'short',
          marketValue: currentValue,
          costBasis,
          unrealizedPl,
          unrealizedPlPercent,
          unrealizedIntradayPl: 0, // Not available from SnapTrade
          unrealizedIntradayPlPercent: 0,
          currentPrice: position.price,
          lastdayPrice: position.price, // Not available
          changeToday: 0,

          // Extra fields
          accountId: holding.account.id,
          accountName: holding.account.name,
          brokerage: holding.account.institution_name,
        });
      }
    }

    // Update last sync time (table type not generated yet)
    await (supabase as any)
      .from('user_brokers')
      .update({ last_sync: new Date().toISOString() })
      .eq('user_id', user.id);

    return NextResponse.json({
      holdings: allPositions,
      totalValue,
      currency: holdings[0]?.total_value?.currency || 'USD',
      balances: balancesByAccount,
      accountCount: holdings.length,
    });
  } catch (error) {
    console.error('SnapTrade holdings error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}
