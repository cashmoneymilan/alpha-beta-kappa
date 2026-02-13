-- Migration: Add Reddit as a source type
-- Enables ingestion from Reddit subreddits (r/wallstreetbets, r/stocks, etc.)

-- Update sources.type CHECK constraint to include 'reddit'
ALTER TABLE sources DROP CONSTRAINT IF EXISTS sources_type_check;
ALTER TABLE sources ADD CONSTRAINT sources_type_check
  CHECK (type IN ('twitter', 'rss', 'news', 'reddit'));

-- Update feed_items.source_type CHECK constraint to include 'reddit'
ALTER TABLE feed_items DROP CONSTRAINT IF EXISTS feed_items_source_type_check;
ALTER TABLE feed_items ADD CONSTRAINT feed_items_source_type_check
  CHECK (source_type IN ('twitter', 'rss', 'news', 'note', 'reddit'));

-- Update ingestion_logs.job_type CHECK constraint to include 'reddit'
ALTER TABLE ingestion_logs DROP CONSTRAINT IF EXISTS ingestion_logs_job_type_check;
ALTER TABLE ingestion_logs ADD CONSTRAINT ingestion_logs_job_type_check
  CHECK (job_type IN ('twitter', 'rss', 'manual', 'reddit'));
