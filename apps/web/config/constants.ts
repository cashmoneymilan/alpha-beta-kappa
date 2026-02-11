// Application constants

// API endpoints - Alpaca (trading only)
export const API_ROUTES = {
  // Alpaca - Paper/Live Trading
  ACCOUNT: '/api/alpaca/account',
  POSITIONS: '/api/alpaca/positions',
  ORDERS: '/api/alpaca/orders',
  ALPACA_MARKET_DATA: '/api/alpaca/market-data',
  ALPACA_WS_CREDENTIALS: '/api/alpaca/ws-credentials',

  // FMP - Market Data (primary source)
  FMP_QUOTES: '/api/fmp/quotes',
  FMP_BARS: '/api/fmp/bars',
  FMP_WS_CREDENTIALS: '/api/fmp/ws-credentials',

  // SnapTrade - Real Brokerage Integration
  SNAPTRADE_AUTH: '/api/snaptrade/auth',
  SNAPTRADE_CALLBACK: '/api/snaptrade/callback',
  SNAPTRADE_ACCOUNTS: '/api/snaptrade/accounts',
  SNAPTRADE_HOLDINGS: '/api/snaptrade/holdings',
  SNAPTRADE_ORDERS: '/api/snaptrade/orders',

  // Alias for market data (now points to FMP)
  MARKET_DATA: '/api/fmp/bars',
  WS_CREDENTIALS: '/api/fmp/ws-credentials',
} as const;

// FMP WebSocket configuration (primary real-time data)
export const FMP_WS_CONFIG = {
  URL: 'wss://websockets.financialmodelingprep.com',
  RECONNECT_DELAY_BASE: 1000,
  MAX_RECONNECT_ATTEMPTS: 5,
  MESSAGE_BUFFER_INTERVAL: 50, // ms between buffer flushes
} as const;

// Alpaca WebSocket configuration (kept for paper trading updates)
export const WS_CONFIG = {
  PAPER_URL: 'wss://stream.data.sandbox.alpaca.markets/v2/iex',
  LIVE_URL: 'wss://stream.data.alpaca.markets/v2/iex',
  RECONNECT_DELAY_BASE: 1000,
  MAX_RECONNECT_ATTEMPTS: 5,
  MESSAGE_BUFFER_INTERVAL: 50, // ms between buffer flushes
} as const;

// Chart configuration
export const CHART_CONFIG = {
  DEFAULT_TIMEFRAME: '1Day' as const,
  DEFAULT_BAR_COUNT: 100,
  MAX_BAR_COUNT: 1000,
  TIMEFRAMES: ['1Min', '5Min', '15Min', '1Hour', '1Day'] as const,
} as const;

// Order book configuration
export const ORDER_BOOK_CONFIG = {
  MAX_LEVELS: 50,
  DEFAULT_AGGREGATION: 0.01, // Penny increments
  AGGREGATION_LEVELS: [0.01, 0.05, 0.1, 0.25, 0.5, 1.0] as const,
} as const;

// Animation timing (matching CSS variables)
export const ANIMATION = {
  MICRO: 150, // ms
  NORMAL: 300, // ms
  SLOW: 500, // ms
} as const;

// Trading limits
export const TRADING_LIMITS = {
  MIN_ORDER_QTY: 1,
  MAX_ORDER_QTY: 100000,
  MIN_PRICE: 0.01,
} as const;

// Refresh intervals
export const REFRESH_INTERVALS = {
  ACCOUNT: 60000, // 1 minute
  POSITIONS: 30000, // 30 seconds
  ORDERS: 10000, // 10 seconds
  WATCHLIST: 5000, // 5 seconds
} as const;

// Default watchlist symbols
export const DEFAULT_WATCHLIST = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'TSLA',
  'META',
  'SPY',
  'QQQ',
] as const;

// Position size limits for risk management
export const RISK_CONFIG = {
  MAX_POSITION_SIZE_PERCENT: 25, // Max 25% of portfolio in single position
  MAX_DAILY_LOSS_PERCENT: 5, // Max 5% daily loss before warning
} as const;
