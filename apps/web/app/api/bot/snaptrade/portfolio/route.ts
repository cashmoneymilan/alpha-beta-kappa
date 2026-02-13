import { NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getTotalPortfolioValue, getAllPositions, getAccounts, getAllHoldings, getActivities, getAuthorizations, refreshConnection } from '@/lib/snaptrade/client';
import { computePositionsFromTransactions } from '@/lib/snaptrade/positions-from-txns';

// Module-level cooldown for refresh — avoid hammering the brokerage
let lastRefreshTimestamp = 0;
const REFRESH_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/bot/snaptrade/portfolio
 * Bot-friendly summary: total value, all positions with P&L, account list.
 * Designed for quick agent consumption in a single call.
 *
 * Falls back to transaction-derived positions when holdings are empty.
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

    // Compute account-level total from the accounts endpoint (more reliable for scraping integrations)
    const accountsList = accounts as any[];
    let accountsTotalValue = 0;
    for (const a of accountsList) {
      accountsTotalValue += a.balance?.total?.amount || 0;
    }

    // Use the better total: account-level if holdings-derived is 0
    const totalValue = portfolio.total > 0 ? portfolio.total : accountsTotalValue;
    const hasGap = positions.length === 0 && totalValue > 0;
    let meta: any = undefined;
    let finalPositions: any[];

    if (!hasGap) {
      // Normal path — positions available from SnapTrade
      finalPositions = positions.map((p: any) => ({
        symbol: p.symbol.symbol,
        units: p.units,
        currentPrice: p.price,
        avgEntryPrice: p.average_purchase_price || p.price,
        marketValue: +(p.price * p.units).toFixed(2),
        unrealizedPl: +(p.open_pnl || 0).toFixed(2),
        accountId: p.accountId,
        accountName: p.accountName,
      }));
    } else {
      // Fallback: compute from transactions
      let refreshTriggered = false;
      const now = Date.now();
      if (now - lastRefreshTimestamp > REFRESH_COOLDOWN_MS) {
        try {
          const auths = await getAuthorizations(creds.userId, creds.userSecret) as any[];
          for (const auth of auths) {
            await refreshConnection(creds.userId, creds.userSecret, auth.id);
          }
          lastRefreshTimestamp = now;
          refreshTriggered = true;
        } catch {
          // Refresh is best-effort
        }
      }

      finalPositions = [];
      try {
        const [transactions, holdings] = await Promise.all([
          getActivities(creds.userId, creds.userSecret) as Promise<any[]>,
          getAllHoldings(creds.userId, creds.userSecret) as Promise<any[]>,
        ]);

        // Build account balance lookup
        const accountBalanceMap = new Map<string, number>();
        for (const a of accountsList) {
          accountBalanceMap.set(a.id, a.balance?.total?.amount || 0);
        }

        for (const h of holdings) {
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

          for (const cp of computed) {
            finalPositions.push({
              symbol: cp.symbol,
              units: cp.units,
              currentPrice: cp.estimatedCurrentPrice,
              avgEntryPrice: cp.avgCostPerUnit,
              marketValue: cp.estimatedMarketValue,
              unrealizedPl: cp.unrealizedPl,
              accountId: cp.accountId,
              accountName: cp.accountName,
            });
          }
        }

        meta = {
          source: 'transactions',
          refreshTriggered,
          warning: 'Positions derived from transaction history. Market values are estimates. A brokerage refresh has been triggered — positions should sync within a few minutes.',
        };
      } catch {
        meta = {
          source: 'unavailable',
          refreshTriggered,
          warning: 'Positions empty and transaction history could not be fetched.',
        };
      }
    }

    const response: any = {
      totalValue: +totalValue.toFixed(2),
      currency: portfolio.currency,
      accountCount: accountsList.length,
      accounts: accountsList.map((a: any) => ({
        id: a.id,
        name: a.name,
        institutionName: a.institution_name,
      })),
      positions: finalPositions,
    };

    if (meta) {
      response._meta = meta;
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
