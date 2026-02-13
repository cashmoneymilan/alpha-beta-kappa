import { NextRequest, NextResponse } from 'next/server';
import { checkAuth, getSnapTradeCredentials, missingCredsResponse } from '@/app/api/snaptrade/helpers';
import { getAllHoldings, getAccountHoldings, getAccounts, getActivities, getAuthorizations, refreshConnection } from '@/lib/snaptrade/client';
import { computePositionsFromTransactions } from '@/lib/snaptrade/positions-from-txns';

// Module-level cooldown for refresh — avoid hammering the brokerage
let lastRefreshTimestamp = 0;
const REFRESH_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

/**
 * GET /api/bot/snaptrade/holdings
 * Bot-friendly endpoint — returns positions, balances, total value.
 * Query: ?accountId=xxx (optional, defaults to all accounts)
 *
 * If positions are empty but account has value, falls back to
 * transaction-derived positions and triggers a brokerage refresh.
 */
export async function GET(req: NextRequest) {
  const denied = checkAuth(req);
  if (denied) return denied;

  const creds = getSnapTradeCredentials();
  if (!creds) return missingCredsResponse();

  try {
    const accountId = req.nextUrl.searchParams.get('accountId');

    // Fetch holdings and account-level balances in parallel
    // Account-level balance.total is the source of truth for Wealthsimple scraping integrations
    // where holdings total_value may return 0
    const [holdingsResult, accountsResult] = await Promise.all([
      accountId
        ? getAccountHoldings(creds.userId, creds.userSecret, accountId).then((s) => [s])
        : getAllHoldings(creds.userId, creds.userSecret),
      getAccounts(creds.userId, creds.userSecret),
    ]);

    const holdings = holdingsResult as any[];
    const accounts = accountsResult as any[];

    // Build account balance lookup from the accounts endpoint (more reliable)
    const accountBalanceMap = new Map<string, number>();
    for (const a of accounts) {
      accountBalanceMap.set(a.id, a.balance?.total?.amount || 0);
    }

    let holdingsTotalValue = 0;
    let accountsTotalValue = 0;
    let totalCash = 0;
    const positions: any[] = [];
    const balances: Record<string, { cash: number; buyingPower: number | null; currency: string }> = {};

    for (const h of holdings) {
      holdingsTotalValue += h.total_value?.amount || 0;
      accountsTotalValue += accountBalanceMap.get(h.account.id) || 0;

      for (const b of h.balances) {
        balances[h.account.id] = {
          cash: b.cash,
          buyingPower: b.buying_power,
          currency: b.currency.code,
        };
        totalCash += b.cash || 0;
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

    // Use the better total value: account-level balance if holdings total is 0
    const totalValue = holdingsTotalValue > 0 ? holdingsTotalValue : accountsTotalValue;

    // Detect gap: positions empty but accounts have value beyond cash
    const estimatedPositionsValue = totalValue - totalCash;
    const hasGap = positions.length === 0 && estimatedPositionsValue > 1;
    let meta: any = undefined;

    if (hasGap) {
      // Trigger brokerage refresh (with cooldown)
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
          // Refresh is best-effort — don't fail the request
        }
      }

      // Compute positions from transaction history
      try {
        const transactions = await getActivities(creds.userId, creds.userSecret) as any[];

        for (const h of holdings) {
          const acctTotal = accountBalanceMap.get(h.account.id) || 0;
          const acctCash = balances[h.account.id]?.cash || 0;
          const acctPositionsValue = acctTotal - acctCash;

          if (acctPositionsValue <= 0) continue;

          const computed = computePositionsFromTransactions(
            transactions,
            h.account.id,
            h.account.name,
            { estimatedPositionsValue: acctPositionsValue }
          );

          for (const cp of computed) {
            positions.push({
              symbol: cp.symbol,
              units: cp.units,
              currentPrice: cp.estimatedCurrentPrice,
              avgEntryPrice: cp.avgCostPerUnit,
              marketValue: cp.estimatedMarketValue,
              costBasis: cp.totalCostBasis,
              unrealizedPl: cp.unrealizedPl,
              unrealizedPlPct: cp.unrealizedPlPct,
              assetType: 'equity',
              exchange: '',
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
      currency: holdings[0]?.total_value?.currency || 'USD',
      accountCount: holdings.length,
      balances,
      positions,
    };

    if (meta) {
      response._meta = meta;
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}
