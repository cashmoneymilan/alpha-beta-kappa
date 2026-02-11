// Core trading types for the platform

export interface Quote {
  symbol: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: number;
}

export interface Trade {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
}

export interface Bar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface PriceLevel {
  price: number;
  size: number;
  orderCount: number;
  total?: number;
}

export interface OrderBook {
  symbol: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
  timestamp: number;
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
export type OrderStatus =
  | 'new'
  | 'partially_filled'
  | 'filled'
  | 'done_for_day'
  | 'canceled'
  | 'expired'
  | 'replaced'
  | 'pending_cancel'
  | 'pending_replace'
  | 'accepted'
  | 'pending_new'
  | 'accepted_for_bidding'
  | 'stopped'
  | 'rejected'
  | 'suspended'
  | 'calculated';

export type TimeInForce = 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';

export interface Order {
  id: string;
  clientOrderId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  timeInForce: TimeInForce;
  qty: number;
  filledQty: number;
  filledAvgPrice: number | null;
  limitPrice: number | null;
  stopPrice: number | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string;
  filledAt: string | null;
  canceledAt: string | null;
  expiredAt: string | null;
}

export interface Position {
  assetId: string;
  symbol: string;
  exchange: string;
  assetClass: string;
  avgEntryPrice: number;
  qty: number;
  side: 'long' | 'short';
  marketValue: number;
  costBasis: number;
  unrealizedPl: number;
  unrealizedPlPercent: number;
  unrealizedIntradayPl: number;
  unrealizedIntradayPlPercent: number;
  currentPrice: number;
  lastdayPrice: number;
  changeToday: number;
}

export interface Account {
  id: string;
  accountNumber: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'REJECTED';
  currency: string;
  cash: number;
  portfolioValue: number;
  patternDayTrader: boolean;
  tradingBlocked: boolean;
  transfersBlocked: boolean;
  accountBlocked: boolean;
  tradeSuspendedByUser: boolean;
  shortingEnabled: boolean;
  equity: number;
  lastEquity: number;
  multiplier: number;
  buyingPower: number;
  initialMargin: number;
  maintenanceMargin: number;
  daytradeCount: number;
  daytradingBuyingPower: number;
  regtBuyingPower: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
}
