-- =============================================
-- Narrative Terminal Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Sources (Twitter accounts, RSS feeds)
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('twitter', 'rss', 'news')),
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight >= 0 AND weight <= 10),
  url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_fetched_at TIMESTAMPTZ,
  UNIQUE(handle, type)
);

-- Tickers
CREATE TABLE tickers (
  symbol TEXT PRIMARY KEY,
  name TEXT,
  asset_class TEXT NOT NULL DEFAULT 'equities'
    CHECK (asset_class IN ('equities', 'crypto', 'macro', 'metals', 'commodities')),
  aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feed items (tweets, articles, notes)
CREATE TABLE feed_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('twitter', 'rss', 'news', 'note')),
  text TEXT NOT NULL,
  full_content TEXT,
  url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ DEFAULT now(),
  velocity INTEGER DEFAULT 0,
  score INTEGER DEFAULT 50,
  -- Sentiment analysis fields
  sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'negative', 'neutral')),
  sentiment_score REAL, -- Confidence 0-1
  sentiment_analyzed_at TIMESTAMPTZ,
  UNIQUE(external_id, source_id)
);

-- Feed item <-> ticker junction
CREATE TABLE feed_item_tickers (
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  ticker_symbol TEXT REFERENCES tickers(symbol) ON DELETE CASCADE,
  confidence REAL DEFAULT 1.0,
  PRIMARY KEY (feed_item_id, ticker_symbol)
);

-- Flags (new, repost, multi-source, starred)
CREATE TABLE feed_item_flags (
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  flag TEXT NOT NULL CHECK (flag IN ('new', 'repost', 'multi-source', 'breaking', 'starred')),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (feed_item_id, flag)
);

-- User notes
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  tickers TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ingestion logs
CREATE TABLE ingestion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL CHECK (job_type IN ('twitter', 'rss', 'manual')),
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  items_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Source predictions for tracking accuracy
CREATE TABLE source_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL REFERENCES tickers(symbol) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('bullish', 'bearish', 'neutral')),
  entry_price NUMERIC,
  predicted_at TIMESTAMPTZ DEFAULT now(),
  -- Filled by background job
  exit_price_1h NUMERIC,
  exit_price_4h NUMERIC,
  exit_price_1d NUMERIC,
  return_1h NUMERIC,
  return_4h NUMERIC,
  return_1d NUMERIC,
  outcome_1h TEXT CHECK (outcome_1h IN ('correct', 'incorrect', 'pending')),
  outcome_4h TEXT CHECK (outcome_4h IN ('correct', 'incorrect', 'pending')),
  outcome_1d TEXT CHECK (outcome_1d IN ('correct', 'incorrect', 'pending')),
  processed_at TIMESTAMPTZ
);

-- Source performance aggregates (calculated periodically)
CREATE TABLE source_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE UNIQUE,
  -- Hit rates by time horizon
  hit_rate_1h NUMERIC DEFAULT 0,
  hit_rate_4h NUMERIC DEFAULT 0,
  hit_rate_1d NUMERIC DEFAULT 0,
  -- Average returns by time horizon
  avg_return_1h NUMERIC DEFAULT 0,
  avg_return_4h NUMERIC DEFAULT 0,
  avg_return_1d NUMERIC DEFAULT 0,
  -- Counts
  total_predictions INTEGER DEFAULT 0,
  bullish_count INTEGER DEFAULT 0,
  bearish_count INTEGER DEFAULT 0,
  -- Overall alpha score (0-100)
  alpha_score NUMERIC DEFAULT 50,
  -- Best and worst picks
  best_ticker TEXT,
  best_return NUMERIC,
  worst_ticker TEXT,
  worst_return NUMERIC,
  -- Time tracking
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_feed_items_published ON feed_items(published_at DESC);
CREATE INDEX idx_feed_items_score ON feed_items(score DESC);
CREATE INDEX idx_feed_items_source ON feed_items(source_id);
CREATE INDEX idx_feed_items_type ON feed_items(source_type);
CREATE INDEX idx_feed_item_tickers_ticker ON feed_item_tickers(ticker_symbol);
CREATE INDEX idx_sources_type ON sources(type);
CREATE INDEX idx_sources_enabled ON sources(enabled);
CREATE INDEX idx_source_predictions_source ON source_predictions(source_id);
CREATE INDEX idx_source_predictions_ticker ON source_predictions(ticker);
CREATE INDEX idx_source_predictions_predicted ON source_predictions(predicted_at DESC);
CREATE INDEX idx_source_predictions_pending ON source_predictions(outcome_1d) WHERE outcome_1d = 'pending';
CREATE INDEX idx_feed_items_sentiment ON feed_items(sentiment_label) WHERE sentiment_label IS NOT NULL;

-- =============================================
-- Auto-update updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sources_updated_at
  BEFORE UPDATE ON sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Seed Tickers
-- =============================================
INSERT INTO tickers (symbol, name, asset_class, aliases) VALUES
-- Tech
('NVDA', 'NVIDIA Corporation', 'equities', ARRAY['nvidia']),
('AMD', 'Advanced Micro Devices', 'equities', ARRAY['amd']),
('AVGO', 'Broadcom Inc', 'equities', ARRAY['broadcom']),
('AAPL', 'Apple Inc', 'equities', ARRAY['apple']),
('MSFT', 'Microsoft Corporation', 'equities', ARRAY['microsoft']),
('GOOGL', 'Alphabet Inc', 'equities', ARRAY['google', 'alphabet']),
('AMZN', 'Amazon.com Inc', 'equities', ARRAY['amazon']),
('META', 'Meta Platforms', 'equities', ARRAY['meta', 'facebook']),
('TSLA', 'Tesla Inc', 'equities', ARRAY['tesla']),
-- Indexes/ETFs
('SPY', 'S&P 500 ETF', 'equities', ARRAY['spx', 's&p', 'sp500']),
('QQQ', 'Nasdaq 100 ETF', 'equities', ARRAY['nasdaq', 'qqq']),
('IWM', 'Russell 2000 ETF', 'equities', ARRAY['russell']),
('DIA', 'Dow Jones ETF', 'equities', ARRAY['dow']),
-- Bonds/Macro
('TLT', 'Treasury Bond ETF', 'macro', ARRAY['treasuries', 'bonds', 'long bonds']),
('HYG', 'High Yield Bond ETF', 'macro', ARRAY['junk bonds', 'high yield']),
('LQD', 'Investment Grade Bond ETF', 'macro', ARRAY['ig bonds']),
-- Uranium
('CCJ', 'Cameco Corporation', 'equities', ARRAY['cameco', 'uranium']),
('UEC', 'Uranium Energy Corp', 'equities', ARRAY[]),
('UUUU', 'Energy Fuels', 'equities', ARRAY['energy fuels']),
('DNN', 'Denison Mines', 'equities', ARRAY['denison']),
-- Metals
('GLD', 'Gold ETF', 'metals', ARRAY['gold']),
('SLV', 'Silver ETF', 'metals', ARRAY['silver']),
('NEM', 'Newmont Corporation', 'metals', ARRAY['newmont']),
('GOLD', 'Barrick Gold', 'metals', ARRAY['barrick']),
('MP', 'MP Materials', 'metals', ARRAY['rare earth', 'ree']),
-- Crypto
('BTC', 'Bitcoin', 'crypto', ARRAY['bitcoin']),
('ETH', 'Ethereum', 'crypto', ARRAY['ethereum', 'ether']),
('SOL', 'Solana', 'crypto', ARRAY['solana']),
-- Oil/Energy
('XLE', 'Energy Sector ETF', 'commodities', ARRAY['energy']),
('USO', 'Oil ETF', 'commodities', ARRAY['oil', 'crude']),
('XOP', 'Oil & Gas Exploration ETF', 'commodities', ARRAY['oil gas']);
