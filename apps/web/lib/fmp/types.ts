// FMP API Response Types

// Real-time quote from REST API
export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string | null;
  sharesOutstanding: number;
  timestamp: number;
}

// Historical bar data
export interface FMPBar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
  unadjustedVolume?: number;
  change?: number;
  changePercent?: number;
  vwap?: number;
  label?: string;
  changeOverTime?: number;
}

// Intraday bar data (different format)
export interface FMPIntradayBar {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

// WebSocket message format
export interface FMPWebSocketMessage {
  s: string;    // symbol
  t: number;    // timestamp (ms)
  lp: number;   // last price
  ls: number;   // last size
  bp?: number;  // bid price
  ap?: number;  // ask price
  bs?: number;  // bid size
  as?: number;  // ask size
  v?: number;   // volume
  type?: string; // message type
}

// WebSocket subscription response
export interface FMPSubscriptionResponse {
  event: 'subscribe' | 'unsubscribe';
  data: {
    ticker: string[];
  };
}

// WebSocket login response
export interface FMPLoginResponse {
  event: 'login';
  status: 'success' | 'error';
  message?: string;
}

// Full quote endpoint response
export interface FMPFullQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string | null;
  sharesOutstanding: number;
  timestamp: number;
}

// Batch quotes response
export type FMPBatchQuotesResponse = FMPQuote[];

// Search result
export interface FMPSearchResult {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

// Company profile
export interface FMPCompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

// Timeframes for historical data
export type FMPTimeframe = '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour' | '1day';

// Map our timeframe format to FMP format
export const TIMEFRAME_MAP: Record<string, FMPTimeframe> = {
  '1Min': '1min',
  '5Min': '5min',
  '15Min': '15min',
  '30Min': '30min',
  '1Hour': '1hour',
  '4Hour': '4hour',
  '1Day': '1day',
};
