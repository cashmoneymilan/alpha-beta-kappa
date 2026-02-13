-- Migration: Add prediction_market as a source type
-- Enables ingestion of PM sentiment events from the prediction-market-analysis dashboard

-- Update sources.type CHECK constraint to include 'prediction_market'
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_type_check;
ALTER TABLE sources ADD CONSTRAINT sources_type_check
  CHECK (type IN ('twitter', 'rss', 'news', 'reddit', 'prediction_market'));

-- Update feed_items.source_type CHECK constraint to include 'prediction_market'
ALTER TABLE feed_items DROP CONSTRAINT IF EXISTS feed_items_source_type_check;
ALTER TABLE feed_items ADD CONSTRAINT feed_items_source_type_check
  CHECK (source_type IN ('twitter', 'rss', 'news', 'note', 'reddit', 'prediction_market'));

-- Update ingestion_logs.job_type CHECK constraint to include 'prediction_market'
ALTER TABLE ingestion_logs DROP CONSTRAINT IF EXISTS ingestion_logs_job_type_check;
ALTER TABLE ingestion_logs ADD CONSTRAINT ingestion_logs_job_type_check
  CHECK (job_type IN ('twitter', 'rss', 'manual', 'reddit', 'prediction_market'));

-- Seed PM sources (composite gets highest weight)
INSERT INTO sources (handle, name, type, weight, enabled) VALUES
  ('pm-kalshi', 'Kalshi Prediction Market', 'prediction_market', 7, true),
  ('pm-polymarket', 'Polymarket', 'prediction_market', 7, true),
  ('pm-composite', 'PM Composite Signal', 'prediction_market', 8, true)
ON CONFLICT (handle, type) DO NOTHING;

-- Add missing tickers used by PM signal mapping
INSERT INTO tickers (symbol, name, asset_class, aliases) VALUES
  ('XLF', 'Financial Sector ETF', 'equities', ARRAY['financials']),
  ('XLK', 'Technology Sector ETF', 'equities', ARRAY['tech sector']),
  ('COIN', 'Coinbase Global', 'equities', ARRAY['coinbase'])
ON CONFLICT (symbol) DO NOTHING;
