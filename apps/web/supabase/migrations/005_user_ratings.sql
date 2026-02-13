-- Migration: User ratings for feed items (ML training data)
-- This table stores user feedback on feed items for personalization and ML training

-- User feedback ratings table
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_item_id UUID REFERENCES feed_items(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)), -- -1 = thumbs down, 1 = thumbs up
  tags TEXT[] DEFAULT '{}', -- ['actionable', 'noise', 'already_knew', 'too_late']
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, feed_item_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_item ON user_ratings(feed_item_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_rating ON user_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_user_ratings_created ON user_ratings(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_ratings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_ratings_updated_at ON user_ratings;
CREATE TRIGGER user_ratings_updated_at
  BEFORE UPDATE ON user_ratings
  FOR EACH ROW EXECUTE FUNCTION update_user_ratings_updated_at();

-- Enable RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and modify their own ratings
CREATE POLICY "Users can view own ratings" ON user_ratings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON user_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON user_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can access all ratings (for ML training)
CREATE POLICY "Service role full access" ON user_ratings
  FOR ALL USING (auth.role() = 'service_role');
