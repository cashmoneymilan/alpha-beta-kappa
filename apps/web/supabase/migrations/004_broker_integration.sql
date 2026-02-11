-- =============================================
-- SnapTrade Broker Integration Tables
-- Migration: 004_broker_integration.sql
-- =============================================

-- User broker connections (stores SnapTrade credentials)
CREATE TABLE IF NOT EXISTS user_brokers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snaptrade_user_id TEXT,
  snaptrade_user_secret TEXT,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Connected brokerage accounts
CREATE TABLE IF NOT EXISTS broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snaptrade_account_id TEXT NOT NULL,
  authorization_id TEXT NOT NULL,
  brokerage_name TEXT NOT NULL,
  account_name TEXT,
  account_number TEXT,
  institution_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(snaptrade_account_id)
);

-- Trade log for tracking all trades (both paper and real)
CREATE TABLE IF NOT EXISTS trade_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT, -- Alpaca account ID or SnapTrade account ID
  account_type TEXT NOT NULL DEFAULT 'paper' CHECK (account_type IN ('paper', 'real')),
  brokerage_order_id TEXT,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
  limit_price NUMERIC,
  stop_price NUMERIC,
  filled_price NUMERIC,
  filled_quantity NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  filled_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_brokers_user_id ON user_brokers(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_accounts_user_id ON broker_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_accounts_authorization ON broker_accounts(authorization_id);
CREATE INDEX IF NOT EXISTS idx_trade_log_user_id ON trade_log(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_log_symbol ON trade_log(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_log_created_at ON trade_log(created_at);

-- RLS Policies
ALTER TABLE user_brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_log ENABLE ROW LEVEL SECURITY;

-- Users can only access their own broker data
CREATE POLICY user_brokers_select ON user_brokers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_brokers_insert ON user_brokers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_brokers_update ON user_brokers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_brokers_delete ON user_brokers
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own accounts
CREATE POLICY broker_accounts_select ON broker_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY broker_accounts_insert ON broker_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY broker_accounts_update ON broker_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY broker_accounts_delete ON broker_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only access their own trade logs
CREATE POLICY trade_log_select ON trade_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY trade_log_insert ON trade_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY trade_log_update ON trade_log
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_user_brokers_updated_at
  BEFORE UPDATE ON user_brokers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broker_accounts_updated_at
  BEFORE UPDATE ON broker_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
