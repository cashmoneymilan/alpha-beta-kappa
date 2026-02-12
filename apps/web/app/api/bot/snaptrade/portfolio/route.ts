import { NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getTotalPortfolioValue, getAllPositions, getAccounts } from '@/lib/snaptrade/client';

/**
 * GET /api/bot/snaptrade/portfolio
 * Bot-friendly summary: total value, all positions with P&L, account list.
 * Designed for quick agent consumption in a single call.
 */
export async function GET(req: Request) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const [portfolio, positions, accounts] = await Promise.all([
      getTotalPortfolioValue(creds.userId, creds.userSecret),
      getAllPositions(creds.userId, creds.userSecret),
      getAccounts(creds.userId, creds.userSecret),
    ]);

    return NextResponse.json({
      totalValue: +portfolio.total.toFixed(2),
      currency: portfolio.currency,
      accountCount: (accounts as any[]).length,
      accounts: (accounts as any[]).map((a: any) => ({
        id: a.id,
        name: a.name,
        institutionName: a.institution_name,
      })),
      positions: positions.map((p: any) => ({
        symbol: p.symbol.symbol,
        units: p.units,
        currentPrice: p.price,
        avgEntryPrice: p.average_purchase_price || p.price,
        marketValue: +(p.price * p.units).toFixed(2),
        unrealizedPl: +(p.open_pnl || 0).toFixed(2),
        accountId: p.accountId,
        accountName: p.accountName,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
