import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getAllHoldings, getAccountHoldings } from '@/lib/snaptrade/client';

/**
 * GET /api/bot/snaptrade/holdings
 * Bot-friendly endpoint — returns positions, balances, total value.
 * Query: ?accountId=xxx (optional, defaults to all accounts)
 */
export async function GET(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const accountId = req.nextUrl.searchParams.get('accountId');

    let holdings: any[];
    if (accountId) {
      const single = await getAccountHoldings(creds.userId, creds.userSecret, accountId);
      holdings = [single];
    } else {
      holdings = await getAllHoldings(creds.userId, creds.userSecret) as any[];
    }

    let totalValue = 0;
    const positions: any[] = [];
    const balances: Record<string, { cash: number; buyingPower: number | null; currency: string }> = {};

    for (const h of holdings) {
      totalValue += h.total_value?.amount || 0;

      for (const b of h.balances) {
        balances[h.account.id] = {
          cash: b.cash,
          buyingPower: b.buying_power,
          currency: b.currency.code,
        };
      }

      for (const p of h.positions) {
        const currentValue = p.price * p.units;
        const avgPrice = p.average_purchase_price || p.price;
        const costBasis = avgPrice * p.units;
        const unrealizedPl = currentValue - costBasis;
        const unrealizedPlPct = costBasis > 0 ? (unrealizedPl / costBasis) * 100 : 0;

        positions.push({
          symbol: p.symbol.symbol,
          units: p.units,
          currentPrice: p.price,
          avgEntryPrice: avgPrice,
          marketValue: currentValue,
          costBasis,
          unrealizedPl: +unrealizedPl.toFixed(2),
          unrealizedPlPct: +unrealizedPlPct.toFixed(2),
          assetType: p.symbol.type?.code || 'equity',
          exchange: p.symbol.exchange?.code || '',
          accountId: h.account.id,
          accountName: h.account.name,
        });
      }
    }

    return NextResponse.json({
      totalValue: +totalValue.toFixed(2),
      currency: holdings[0]?.total_value?.currency || 'USD',
      accountCount: holdings.length,
      balances,
      positions,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}
