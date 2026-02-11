import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { PriceLevel } from '@/types/trading';
import { ORDER_BOOK_CONFIG } from '@/config/constants';

interface OrderBookState {
  // Current symbol
  symbol: string | null;

  // Order book data
  bids: PriceLevel[];
  asks: PriceLevel[];

  // Metadata
  lastUpdateTime: number;
  spread: number;
  midPrice: number;

  // Display settings
  aggregation: number;
  maxLevels: number;

  // Statistics
  bidTotal: number;
  askTotal: number;
  imbalance: number; // Positive = more bids, negative = more asks

  // Actions
  setSymbol: (symbol: string) => void;
  updateOrderBook: (bids: PriceLevel[], asks: PriceLevel[]) => void;
  setAggregation: (level: number) => void;
  setMaxLevels: (levels: number) => void;
  clear: () => void;
}

function calculateStats(bids: PriceLevel[], asks: PriceLevel[]) {
  const bidTotal = bids.reduce((sum, level) => sum + level.size, 0);
  const askTotal = asks.reduce((sum, level) => sum + level.size, 0);
  const total = bidTotal + askTotal;

  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const midPrice = (bestBid + bestAsk) / 2;

  const imbalance = total > 0 ? (bidTotal - askTotal) / total : 0;

  return { bidTotal, askTotal, spread, midPrice, imbalance };
}

export const useOrderBookStore = create<OrderBookState>()(
  subscribeWithSelector((set) => ({
    symbol: null,
    bids: [],
    asks: [],
    lastUpdateTime: 0,
    spread: 0,
    midPrice: 0,
    aggregation: ORDER_BOOK_CONFIG.DEFAULT_AGGREGATION,
    maxLevels: ORDER_BOOK_CONFIG.MAX_LEVELS,
    bidTotal: 0,
    askTotal: 0,
    imbalance: 0,

    setSymbol: (symbol) =>
      set({
        symbol,
        bids: [],
        asks: [],
        lastUpdateTime: 0,
        spread: 0,
        midPrice: 0,
        bidTotal: 0,
        askTotal: 0,
        imbalance: 0,
      }),

    updateOrderBook: (bids, asks) => {
      const stats = calculateStats(bids, asks);
      set({
        bids,
        asks,
        lastUpdateTime: Date.now(),
        ...stats,
      });
    },

    setAggregation: (aggregation) => set({ aggregation }),

    setMaxLevels: (maxLevels) => set({ maxLevels }),

    clear: () =>
      set({
        symbol: null,
        bids: [],
        asks: [],
        lastUpdateTime: 0,
        spread: 0,
        midPrice: 0,
        bidTotal: 0,
        askTotal: 0,
        imbalance: 0,
      }),
  }))
);

// Non-reactive getter for R3F useFrame loops
// CRITICAL: Use this in useFrame to avoid React re-renders
export const getOrderBookState = () => useOrderBookStore.getState();

// Selectors
export const selectBids = (state: OrderBookState) => state.bids;
export const selectAsks = (state: OrderBookState) => state.asks;
export const selectSpread = (state: OrderBookState) => state.spread;
export const selectMidPrice = (state: OrderBookState) => state.midPrice;
export const selectImbalance = (state: OrderBookState) => state.imbalance;

// Helper to aggregate price levels
export function aggregateLevels(
  levels: PriceLevel[],
  aggregation: number,
  isBid: boolean
): PriceLevel[] {
  if (aggregation <= 0 || levels.length === 0) return levels;

  const aggregated = new Map<number, PriceLevel>();

  for (const level of levels) {
    const roundedPrice = isBid
      ? Math.floor(level.price / aggregation) * aggregation
      : Math.ceil(level.price / aggregation) * aggregation;

    const existing = aggregated.get(roundedPrice);
    if (existing) {
      existing.size += level.size;
      existing.orderCount += level.orderCount;
    } else {
      aggregated.set(roundedPrice, {
        price: roundedPrice,
        size: level.size,
        orderCount: level.orderCount,
      });
    }
  }

  const result = Array.from(aggregated.values());
  return isBid
    ? result.sort((a, b) => b.price - a.price)
    : result.sort((a, b) => a.price - b.price);
}
