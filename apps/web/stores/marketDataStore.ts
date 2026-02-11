import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { Quote, Trade, Bar } from '@/types/trading';

// Stable empty arrays to prevent infinite re-renders in selectors
const EMPTY_TRADES: Trade[] = [];
const EMPTY_BARS: Bar[] = [];

interface MarketDataState {
  // Data
  quotes: Record<string, Quote>;
  trades: Record<string, Trade[]>;
  bars: Record<string, Bar[]>;

  // Subscriptions
  subscribedSymbols: Set<string>;

  // Connection status
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';

  // Actions
  updateQuote: (quote: Quote) => void;
  addTrade: (trade: Trade) => void;
  addBar: (bar: Bar) => void;
  setBars: (symbol: string, bars: Bar[]) => void;
  batchUpdateQuotes: (quotes: Quote[]) => void;
  batchAddTrades: (trades: Trade[]) => void;
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setConnectionStatus: (status: MarketDataState['connectionStatus']) => void;
  clearSymbolData: (symbol: string) => void;
}

const MAX_TRADES_PER_SYMBOL = 1000;
const MAX_BARS_PER_SYMBOL = 500;

export const useMarketDataStore = create<MarketDataState>()(
  subscribeWithSelector((set, get) => ({
    quotes: {},
    trades: {},
    bars: {},
    subscribedSymbols: new Set(),
    connectionStatus: 'disconnected',

    updateQuote: (quote) =>
      set((state) => ({
        quotes: { ...state.quotes, [quote.symbol]: quote },
      })),

    addTrade: (trade) =>
      set((state) => {
        const existing = state.trades[trade.symbol] || [];
        const updated = [...existing.slice(-MAX_TRADES_PER_SYMBOL + 1), trade];
        return { trades: { ...state.trades, [trade.symbol]: updated } };
      }),

    addBar: (bar) =>
      set((state) => {
        const existing = state.bars[bar.symbol] || [];
        // Check if this is an update to the last bar or a new bar
        const lastBar = existing[existing.length - 1];
        if (lastBar && lastBar.timestamp === bar.timestamp) {
          // Update existing bar
          const updated = [...existing.slice(0, -1), bar];
          return { bars: { ...state.bars, [bar.symbol]: updated } };
        } else {
          // Add new bar
          const updated = [...existing.slice(-MAX_BARS_PER_SYMBOL + 1), bar];
          return { bars: { ...state.bars, [bar.symbol]: updated } };
        }
      }),

    setBars: (symbol, bars) =>
      set((state) => ({
        bars: { ...state.bars, [symbol]: bars.slice(-MAX_BARS_PER_SYMBOL) },
      })),

    batchUpdateQuotes: (quotes) =>
      set((state) => {
        const newQuotes = { ...state.quotes };
        for (const quote of quotes) {
          newQuotes[quote.symbol] = quote;
        }
        return { quotes: newQuotes };
      }),

    batchAddTrades: (trades) =>
      set((state) => {
        const newTrades = { ...state.trades };
        for (const trade of trades) {
          const existing = newTrades[trade.symbol] || [];
          newTrades[trade.symbol] = [...existing.slice(-MAX_TRADES_PER_SYMBOL + 1), trade];
        }
        return { trades: newTrades };
      }),

    addSymbol: (symbol) =>
      set((state) => {
        const newSet = new Set(state.subscribedSymbols);
        newSet.add(symbol.toUpperCase());
        return { subscribedSymbols: newSet };
      }),

    removeSymbol: (symbol) =>
      set((state) => {
        const newSet = new Set(state.subscribedSymbols);
        newSet.delete(symbol.toUpperCase());
        return { subscribedSymbols: newSet };
      }),

    setConnectionStatus: (connectionStatus) => set({ connectionStatus }),

    clearSymbolData: (symbol) =>
      set((state) => {
        const { [symbol]: _quote, ...quotes } = state.quotes;
        const { [symbol]: _trades, ...trades } = state.trades;
        const { [symbol]: _bars, ...bars } = state.bars;
        return { quotes, trades, bars };
      }),
  }))
);

// Non-reactive getter for R3F useFrame loops
// CRITICAL: Use this in useFrame to avoid React re-renders
export const getMarketDataState = () => useMarketDataStore.getState();

// Selectors for common data access patterns
export const selectQuote = (symbol: string) => (state: MarketDataState) =>
  state.quotes[symbol];

export const selectTrades = (symbol: string) => (state: MarketDataState) =>
  state.trades[symbol] ?? EMPTY_TRADES;

export const selectBars = (symbol: string) => (state: MarketDataState) =>
  state.bars[symbol] ?? EMPTY_BARS;

export const selectLatestPrice = (symbol: string) => (state: MarketDataState) => {
  const quote = state.quotes[symbol];
  if (quote) {
    return (quote.bid + quote.ask) / 2;
  }
  const bars = state.bars[symbol];
  if (bars && bars.length > 0) {
    const lastBar = bars[bars.length - 1];
    if (lastBar) return lastBar.close;
  }
  return null;
};
