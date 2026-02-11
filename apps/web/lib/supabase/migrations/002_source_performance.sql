-- Migration: Add source performance tracking for alpha backtesting
-- Run this in Supabase SQL editor

-- 1. Add category to sources table
ALTER TABLE sources ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
-- Categories: 'flow', 'research', 'breaking', 'sector', 'macro', 'filings', 'quant', 'contrarian'

-- 2. Price snapshots - capture price when signal is detected
CREATE TABLE IF NOT EXISTS price_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  ticker_symbol TEXT NOT NULL REFERENCES tickers(symbol),
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  price DECIMAL(12,4) NOT NULL,
  bid DECIMAL(12,4),
  ask DECIMAL(12,4),
  volume BIGINT,
  UNIQUE(feed_item_id, ticker_symbol)
);

-- 3. Signal returns - track returns at various intervals
CREATE TABLE IF NOT EXISTS signal_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  ticker_symbol TEXT NOT NULL REFERENCES tickers(symbol),
  -- Entry price (from snapshot)
  entry_price DECIMAL(12,4) NOT NULL,
  entry_time TIMESTAMPTZ NOT NULL,
  -- Returns at various intervals (null until measured)
  return_1h DECIMAL(8,4),
  return_4h DECIMAL(8,4),
  return_1d DECIMAL(8,4),
  return_1w DECIMAL(8,4),
  -- Exit prices for auditing
  price_1h DECIMAL(12,4),
  price_4h DECIMAL(12,4),
  price_1d DECIMAL(12,4),
  price_1w DECIMAL(12,4),
  -- Timestamps when measured
  measured_1h_at TIMESTAMPTZ,
  measured_4h_at TIMESTAMPTZ,
  measured_1d_at TIMESTAMPTZ,
  measured_1w_at TIMESTAMPTZ,
  -- Direction signal (1 = bullish, -1 = bearish, 0 = neutral)
  signal_direction SMALLINT DEFAULT 0,
  UNIQUE(feed_item_id, ticker_symbol)
);

-- 4. Source performance aggregate (materialized for fast reads)
CREATE TABLE IF NOT EXISTS source_performance (
  source_id UUID PRIMARY KEY REFERENCES sources(id) ON DELETE CASCADE,
  -- Signal counts
  total_signals INTEGER DEFAULT 0,
  signals_with_tickers INTEGER DEFAULT 0,
  -- Hit rates (% of signals where return matched direction)
  hit_rate_1h DECIMAL(5,2),
  hit_rate_4h DECIMAL(5,2),
  hit_rate_1d DECIMAL(5,2),
  hit_rate_1w DECIMAL(5,2),
  -- Average returns
  avg_return_1h DECIMAL(8,4),
  avg_return_4h DECIMAL(8,4),
  avg_return_1d DECIMAL(8,4),
  avg_return_1w DECIMAL(8,4),
  -- Best performing ticker for this source
  best_ticker TEXT,
  best_ticker_avg_return DECIMAL(8,4),
  -- Calculated alpha score (0-100)
  alpha_score DECIMAL(5,2),
  -- Timestamps
  last_calculated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_snapshots_ticker ON price_snapshots(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_price_snapshots_time ON price_snapshots(snapshot_time);
CREATE INDEX IF NOT EXISTS idx_signal_returns_ticker ON signal_returns(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_signal_returns_entry_time ON signal_returns(entry_time);

-- 6. Function to calculate source alpha score
CREATE OR REPLACE FUNCTION calculate_alpha_score(
  p_hit_rate_1h DECIMAL,
  p_hit_rate_1d DECIMAL,
  p_avg_return_1d DECIMAL,
  p_total_signals INTEGER
) RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL;
BEGIN
  -- Base score from hit rates (0-50 points)
  score := COALESCE(p_hit_rate_1h, 50) * 0.25 + COALESCE(p_hit_rate_1d, 50) * 0.25;

  -- Return magnitude bonus (0-30 points)
  score := score + LEAST(30, GREATEST(-30, COALESCE(p_avg_return_1d, 0) * 100));

  -- Sample size confidence (0-20 points)
  score := score + LEAST(20, COALESCE(p_total_signals, 0) * 0.5);

  RETURN LEAST(100, GREATEST(0, score));
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-update source_performance.updated_at
CREATE OR REPLACE FUNCTION update_source_performance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS source_performance_updated ON source_performance;
CREATE TRIGGER source_performance_updated
  BEFORE UPDATE ON source_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_source_performance_timestamp();
