// SnapTrade API Types
// Documentation: https://docs.snaptrade.com/

// ===== USER MANAGEMENT =====

export interface SnapTradeUser {
  userId: string;
  userSecret: string;
}

export interface SnapTradeUserResponse {
  userId: string;
  userSecret: string;
}

// ===== AUTHENTICATION =====

export interface SnapTradeLoginLink {
  redirectURI: string;
  sessionId: string;
}

export interface SnapTradeConnectionPortalResponse {
  redirectURI: string;
}

// ===== ACCOUNTS =====

export interface SnapTradeBrokerageAuthorization {
  id: string;
  created_date: string;
  updated_date: string;
  brokerage: SnapTradeBrokerage;
  name: string;
  type: string;
  disabled: boolean;
  disabled_date: string | null;
  meta: Record<string, unknown>;
}

export interface SnapTradeBrokerage {
  id: string;
  name: string;
  display_name: string;
  description: string;
  aws_s3_logo_url: string;
  aws_s3_square_logo_url: string;
  open_url: string | null;
  slug: string;
  url: string;
  enabled: boolean;
  maintenance_mode: boolean;
  allows_fractional_units: boolean;
  allows_trading: boolean;
  has_reporting: boolean;
  is_real_time_connection: boolean;
  allows_trading_through_snaptrade_api: boolean;
  is_scraping_integration: boolean;
  default_currency: string;
  brokerage_type: SnapTradeBrokerageType;
  exchanges: SnapTradeExchange[];
}

export interface SnapTradeBrokerageType {
  id: string;
  name: string;
}

export interface SnapTradeExchange {
  id: string;
  code: string;
  mic_code: string;
  name: string;
  timezone: string;
  start_time: string;
  close_time: string;
  suffix: string | null;
}

export interface SnapTradeAccount {
  id: string;
  brokerage_authorization: string;
  portfolio_group: string | null;
  name: string;
  number: string;
  institution_name: string;
  created_date: string;
  meta: Record<string, unknown>;
  cash_restrictions: string[];
  sync_status: SnapTradeSyncStatus;
  balance: SnapTradeAccountBalance;
}

export interface SnapTradeSyncStatus {
  transactions: {
    initial_sync_completed: boolean;
    last_successful_sync: string | null;
    first_transaction_date: string | null;
  };
  holdings: {
    initial_sync_completed: boolean;
    last_successful_sync: string | null;
  };
}

export interface SnapTradeAccountBalance {
  total: SnapTradeCurrencyAmount | null;
  cash: SnapTradeCurrencyAmount | null;
}

export interface SnapTradeCurrencyAmount {
  amount: number;
  currency: string;
}

// ===== HOLDINGS & POSITIONS =====

export interface SnapTradePosition {
  symbol: SnapTradeUniversalSymbol;
  units: number;
  price: number;
  open_pnl: number;
  fractional_units: number;
  average_purchase_price: number | null;
  currency: SnapTradeCurrency;
}

export interface SnapTradeUniversalSymbol {
  id: string;
  symbol: string;
  raw_symbol: string;
  description: string | null;
  currency: SnapTradeCurrency;
  exchange: SnapTradeExchange | null;
  type: SnapTradeSecurityType;
  figi_code: string | null;
  figi_instrument: string | null;
}

export interface SnapTradeCurrency {
  id: string;
  code: string;
  name: string;
}

export interface SnapTradeSecurityType {
  id: string;
  code: string;
  description: string;
  is_supported: boolean;
}

export interface SnapTradeAccountHoldings {
  account: SnapTradeAccount;
  balances: SnapTradeBalance[];
  positions: SnapTradePosition[];
  option_positions: SnapTradeOptionPosition[];
  orders: SnapTradeOrder[];
  total_value: SnapTradeCurrencyAmount;
}

export interface SnapTradeBalance {
  currency: SnapTradeCurrency;
  cash: number;
  buying_power: number | null;
}

export interface SnapTradeOptionPosition {
  symbol: SnapTradeOptionsSymbol;
  units: number;
  price: number;
  average_purchase_price: number | null;
  currency: SnapTradeCurrency;
}

export interface SnapTradeOptionsSymbol {
  id: string;
  ticker: string;
  option_type: 'CALL' | 'PUT';
  strike_price: number;
  expiration_date: string;
  is_mini_option: boolean;
  underlying_symbol: SnapTradeUniversalSymbol;
  local_id: string;
  exchange_id: string;
}

// ===== ORDERS =====

export interface SnapTradeOrder {
  brokerage_order_id: string;
  status: SnapTradeOrderStatus;
  symbol: SnapTradeUniversalSymbol;
  universal_symbol: SnapTradeUniversalSymbol | null;
  option_symbol: SnapTradeOptionsSymbol | null;
  action: 'BUY' | 'SELL';
  total_quantity: number;
  open_quantity: number;
  canceled_quantity: number;
  filled_quantity: number;
  execution_price: number | null;
  limit_price: number | null;
  stop_price: number | null;
  order_type: SnapTradeOrderType;
  time_in_force: SnapTradeTimeInForce;
  time_placed: string;
  time_updated: string | null;
  time_executed: string | null;
  expiry_date: string | null;
}

export type SnapTradeOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELED'
  | 'PARTIAL_CANCELED'
  | 'CANCEL_PENDING'
  | 'EXECUTED'
  | 'PARTIAL'
  | 'REPLACE_PENDING'
  | 'REPLACED'
  | 'STOPPED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'QUEUED'
  | 'TRIGGERED'
  | 'ACTIVATED'
  | 'PENDING_RISK_REVIEW'
  | 'CONTINGENT_ORDER';

export type SnapTradeOrderType = 'Limit' | 'Market' | 'StopLimit' | 'StopLoss';
export type SnapTradeTimeInForce = 'Day' | 'GTC' | 'FOK';

// ===== TRADING =====

export interface SnapTradeOrderRequest {
  account_id: string;
  action: 'BUY' | 'SELL';
  order_type: SnapTradeOrderType;
  price?: number;
  stop?: number;
  time_in_force: SnapTradeTimeInForce;
  units?: number;
  notional_value?: SnapTradeCurrencyAmount;
  universal_symbol_id?: string;
  symbol?: string;
}

export interface SnapTradeOrderResponse {
  brokerage_order_id: string;
  status: SnapTradeOrderStatus;
  symbol: SnapTradeUniversalSymbol;
  universal_symbol: SnapTradeUniversalSymbol | null;
  action: 'BUY' | 'SELL';
  total_quantity: number;
  open_quantity: number;
  canceled_quantity: number;
  filled_quantity: number;
  execution_price: number | null;
  limit_price: number | null;
  stop_price: number | null;
  order_type: SnapTradeOrderType;
  time_in_force: SnapTradeTimeInForce;
  time_placed: string;
}

export interface SnapTradeOrderImpact {
  account: SnapTradeAccount;
  currency: SnapTradeCurrency;
  remaining_cash: number;
  estimated_commissions: number;
  forex_fees: number;
}

// ===== TRANSACTIONS =====

export interface SnapTradeTransaction {
  id: string;
  account: string;
  amount: number;
  currency: SnapTradeCurrency;
  description: string;
  fee: number;
  fx_rate: number | null;
  institution: string;
  option_symbol: SnapTradeOptionsSymbol | null;
  option_type: string | null;
  price: number;
  settlement_date: string;
  external_reference_id: string | null;
  symbol: SnapTradeUniversalSymbol | null;
  trade_date: string;
  type: string;
  units: number;
}

// ===== SUPPORTED BROKERAGES =====

// Known brokerages that support Wealthsimple, Interactive Brokers, etc.
export const SUPPORTED_BROKERAGES = {
  WEALTHSIMPLE: 'wealthsimple',
  INTERACTIVE_BROKERS: 'interactive-brokers',
  QUESTRADE: 'questrade',
  TD_AMERITRADE: 'td-ameritrade',
  ROBINHOOD: 'robinhood',
  FIDELITY: 'fidelity',
  SCHWAB: 'schwab',
} as const;

export type SupportedBrokerage = typeof SUPPORTED_BROKERAGES[keyof typeof SUPPORTED_BROKERAGES];

// ===== API RESPONSE WRAPPERS =====

export interface SnapTradeApiError {
  detail: string;
  code: string;
  status_code: number;
}

export interface SnapTradeListResponse<T> {
  data: T[];
}
