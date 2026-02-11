// Database types for SnapTrade integration
// These types mirror the tables defined in 004_broker_integration.sql

export interface UserBroker {
  id: string;
  user_id: string;
  snaptrade_user_id: string | null;
  snaptrade_user_secret: string | null;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrokerAccount {
  id: string;
  user_id: string;
  snaptrade_account_id: string;
  authorization_id: string;
  brokerage_name: string;
  account_name: string | null;
  account_number: string | null;
  institution_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeLog {
  id: string;
  user_id: string;
  account_id: string | null;
  account_type: 'paper' | 'real';
  brokerage_order_id: string | null;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit' | 'stop' | 'stop_limit';
  limit_price: number | null;
  stop_price: number | null;
  filled_price: number | null;
  filled_quantity: number | null;
  status: string;
  error_message: string | null;
  created_at: string;
  filled_at: string | null;
}

// Helper type for partial user broker data (for queries)
export interface UserBrokerPartial {
  snaptrade_user_id: string | null;
  snaptrade_user_secret: string | null;
}

export interface BrokerAccountPartial {
  snaptrade_account_id: string;
  account_name: string | null;
  brokerage_name: string;
}
