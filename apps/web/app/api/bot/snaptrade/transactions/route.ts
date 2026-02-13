import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getActivities, getAllHoldings, getAccounts } from '@/lib/snaptrade/client';
import { computePositionsFromTransactions } from '@/lib/snaptrade/positions-from-txns';

/**
 * GET /api/bot/snaptrade/transactions
 * Query params:
 *   - accountId: filter to a specific account
 *   - startDate: YYYY-MM-DD
 *   - endDate: YYYY-MM-DD
 *   - type: transaction type filter (BUY, SELL, DIVIDEND, etc.)
 *   - computed: "true" to return derived positions instead of raw transactions
 */
export async function GET(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const params = req.nextUrl.searchParams;
    const accountId = params.get('accountId') || undefined;
    const startDate = params.get('startDate') || undefined;
    const endDate = params.get('endDate') || undefined;
    const type = params.get('type') || undefined;
    const computedMode = params.get('computed') === 'true';

    const transactions = await getActivities(creds.userId, creds.userSecret, {
      accountId,
      startDate,
      endDate,
      type,
    }) as any[];

    if (!computedMode) {
      return NextResponse.json({
        transactions: transactions.map((t: any) => ({
          id: t.id,
          accountId: typeof t.account === 'string' ? t.account : t.account?.id || null,
          symbol: typeof t.symbol === 'string' ? t.symbol : t.symbol?.symbol || null,
          type: t.type,
          units: t.units,
          price: t.price,
          amount: t.amount,
          fee: t.fee,
          currency: typeof t.currency === 'string' ? t.currency : t.currency?.code || null,
          tradeDate: t.trade_date,
          settlementDate: t.settlement_date,
          description: t.description,
        })),
        count: transactions.length,
      });
    }

    // Computed mode: derive positions from transactions
    const [holdings, accounts] = await Promise.all([
      getAllHoldings(creds.userId, creds.userSecret) as Promise<any[]>,
      getAccounts(creds.userId, creds.userSecret) as Promise<any[]>,
    ]);

    // Build account balance lookup from accounts endpoint (more reliable)
    const accountBalanceMap = new Map<string, number>();
    for (const a of accounts) {
      accountBalanceMap.set(a.id, a.balance?.total?.amount || 0);
    }

    const allPositions: any[] = [];

    for (const h of holdings) {
      if (accountId && h.account.id !== accountId) continue;

      const acctTotal = accountBalanceMap.get(h.account.id) || 0;
      const cashBalance = h.balances?.[0]?.cash || 0;
      const accountPositionsValue = acctTotal - cashBalance;

      if (accountPositionsValue <= 0) continue;

      const computed = computePositionsFromTransactions(
        transactions,
        h.account.id,
        h.account.name,
        { estimatedPositionsValue: accountPositionsValue }
      );

      allPositions.push(...computed);
    }

    return NextResponse.json({
      positions: allPositions,
      transactionCount: transactions.length,
      _meta: {
        source: 'transactions',
        warning: 'Positions derived from transaction history. Market values are estimates based on account balance minus cash.',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
