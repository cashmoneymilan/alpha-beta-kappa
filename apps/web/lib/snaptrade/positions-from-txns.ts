// Compute positions from transaction history as a fallback
// when SnapTrade's holdings/positions endpoints return empty arrays

export interface ComputedPosition {
  symbol: string;
  units: number;
  avgCostPerUnit: number;
  totalCostBasis: number;
  estimatedMarketValue: number | null;
  estimatedCurrentPrice: number | null;
  unrealizedPl: number | null;
  unrealizedPlPct: number | null;
  accountId: string;
  accountName: string;
  source: 'transactions';
  transactionCount: number;
  lastTransactionDate: string | null;
}

interface Transaction {
  id: string;
  account: string | { id: string; [key: string]: any };
  symbol: string | { symbol: string; id?: string; [key: string]: any } | null;
  units: number;
  price: number;
  amount: number;
  fee: number;
  trade_date: string;
  type: string;
}

function getAccountId(account: Transaction['account']): string {
  return typeof account === 'string' ? account : account.id;
}

function getSymbolTicker(symbol: Transaction['symbol']): string | null {
  if (!symbol) return null;
  if (typeof symbol === 'string') return symbol;
  return symbol.symbol || null;
}

/**
 * Derive current positions from transaction history using weighted average cost basis.
 *
 * Logic:
 * - BUY / REI / TRANSFER_IN: add units, update weighted avg cost
 * - SELL / TRANSFER_OUT: remove units, reduce cost basis proportionally
 * - SPLIT: add units without changing total cost basis (per-unit cost decreases)
 * - Filter to symbols with units > 0
 *
 * @param transactions Raw transaction array from SnapTrade getActivities()
 * @param accountId Filter to this account
 * @param accountName Human-readable account name for the response
 * @param options.estimatedPositionsValue If provided, distribute this value proportionally by cost basis to estimate market values
 */
export function computePositionsFromTransactions(
  transactions: Transaction[],
  accountId: string,
  accountName: string,
  options?: { estimatedPositionsValue?: number }
): ComputedPosition[] {
  // Filter to this account and sort by trade date ascending
  const accountTxns = transactions
    .filter((t) => getAccountId(t.account) === accountId && getSymbolTicker(t.symbol) !== null)
    .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

  // Accumulate per symbol
  const symbols = new Map<
    string,
    {
      units: number;
      totalCost: number;
      txnCount: number;
      lastDate: string | null;
    }
  >();

  for (const txn of accountTxns) {
    const sym = getSymbolTicker(txn.symbol)!;
    if (!symbols.has(sym)) {
      symbols.set(sym, { units: 0, totalCost: 0, txnCount: 0, lastDate: null });
    }
    const pos = symbols.get(sym)!;
    pos.txnCount++;
    pos.lastDate = txn.trade_date;

    const type = txn.type.toUpperCase();
    const units = Math.abs(txn.units);
    const price = Math.abs(txn.price);

    if (['BUY', 'REI', 'REINVESTMENT', 'TRANSFER_IN'].includes(type)) {
      // Add to position with weighted average cost
      pos.totalCost += units * price;
      pos.units += units;
    } else if (['SELL', 'TRANSFER_OUT'].includes(type)) {
      // Remove from position proportionally
      if (pos.units > 0) {
        const fraction = Math.min(units / pos.units, 1);
        pos.totalCost *= 1 - fraction;
      }
      pos.units -= units;
    } else if (type === 'SPLIT') {
      // Add units without changing total cost
      pos.units += units;
    }
    // Ignore DIVIDEND, FEE, INTEREST, etc. — they don't affect share count
  }

  // Filter to symbols with remaining units
  const activePositions: ComputedPosition[] = [];
  let totalCostBasisAll = 0;

  for (const [sym, data] of symbols) {
    if (data.units > 0.0001) {
      totalCostBasisAll += data.totalCost;
      activePositions.push({
        symbol: sym,
        units: +data.units.toFixed(6),
        avgCostPerUnit: data.units > 0 ? +(data.totalCost / data.units).toFixed(4) : 0,
        totalCostBasis: +data.totalCost.toFixed(2),
        estimatedMarketValue: null,
        estimatedCurrentPrice: null,
        unrealizedPl: null,
        unrealizedPlPct: null,
        accountId,
        accountName,
        source: 'transactions',
        transactionCount: data.txnCount,
        lastTransactionDate: data.lastDate,
      });
    }
  }

  // If we have an estimated total positions value, distribute proportionally
  if (options?.estimatedPositionsValue && totalCostBasisAll > 0) {
    const totalMV = options.estimatedPositionsValue;
    for (const pos of activePositions) {
      const weight = pos.totalCostBasis / totalCostBasisAll;
      pos.estimatedMarketValue = +(totalMV * weight).toFixed(2);
      pos.estimatedCurrentPrice =
        pos.units > 0 ? +(pos.estimatedMarketValue / pos.units).toFixed(4) : null;
      if (pos.estimatedMarketValue !== null) {
        pos.unrealizedPl = +(pos.estimatedMarketValue - pos.totalCostBasis).toFixed(2);
        pos.unrealizedPlPct =
          pos.totalCostBasis > 0
            ? +((pos.unrealizedPl / pos.totalCostBasis) * 100).toFixed(2)
            : null;
      }
    }
  }

  return activePositions;
}
