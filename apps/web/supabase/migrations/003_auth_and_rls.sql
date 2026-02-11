-- =============================================
-- User Authentication & Credentials Schema
-- Sprint 7: Simple Auth Implementation
-- =============================================

-- User credentials table for storing encrypted API keys
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('alpaca', 'ibkr', 'resend')),
  -- Encrypted credentials stored as JSON
  encrypted_data TEXT NOT NULL,
  -- Metadata
  label TEXT, -- e.g., "Paper Trading Account"
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- One active credential per provider per user
  UNIQUE(user_id, provider, is_active) -- Partial unique constraint
);

-- User settings/preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Notification preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  browser_notifications BOOLEAN NOT NULL DEFAULT true,
  notification_email TEXT,
  -- Trading preferences
  default_position_size NUMERIC DEFAULT 0.1, -- 10% of buying power
  risk_warning_threshold NUMERIC DEFAULT 0.25, -- Warn at 25% position
  -- UI preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  workspace_layout JSONB,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User alert rules (for compound alerts with user ownership)
CREATE TABLE IF NOT EXISTS user_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '[]',
  logic TEXT NOT NULL DEFAULT 'AND' CHECK (logic IN ('AND', 'OR')),
  browser_notify BOOLEAN NOT NULL DEFAULT true,
  email_notify BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add user_id column to existing tables that need per-user data
-- For feed_items, we'll track which user ingested them
ALTER TABLE feed_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- For user_notes, we need user ownership
ALTER TABLE user_notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- For source_predictions, track which user the prediction belongs to
ALTER TABLE source_predictions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- Indexes for user-related queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_credentials_user ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_provider ON user_credentials(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_rules_user ON user_alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_items_user ON feed_items(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_source_predictions_user ON source_predictions(user_id);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all user-specific tables
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_predictions ENABLE ROW LEVEL SECURITY;

-- User Credentials: Users can only see/manage their own credentials
CREATE POLICY "Users can view own credentials" ON user_credentials
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials" ON user_credentials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials" ON user_credentials
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials" ON user_credentials
  FOR DELETE USING (auth.uid() = user_id);

-- User Settings: Users can only see/manage their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Alert Rules: Users can only see/manage their own rules
CREATE POLICY "Users can view own alert rules" ON user_alert_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert rules" ON user_alert_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alert rules" ON user_alert_rules
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own alert rules" ON user_alert_rules
  FOR DELETE USING (auth.uid() = user_id);

-- User Notes: Users can only see/manage their own notes
CREATE POLICY "Users can view own notes" ON user_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON user_notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON user_notes
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON user_notes
  FOR DELETE USING (auth.uid() = user_id);

-- Feed Items: Users can see shared items (no user_id) or their own
CREATE POLICY "Users can view shared or own feed items" ON feed_items
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own feed items" ON feed_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Source Predictions: Users can only see their own predictions
CREATE POLICY "Users can view own predictions" ON source_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON source_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sources and Tickers: Shared across all users (read-only for authenticated)
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sources" ON sources
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view tickers" ON tickers
  FOR SELECT USING (auth.role() = 'authenticated');

-- =============================================
-- Auto-update updated_at triggers
-- =============================================
CREATE TRIGGER user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_alert_rules_updated_at
  BEFORE UPDATE ON user_alert_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Helper Functions
-- =============================================

-- Function to get user's active credential for a provider
CREATE OR REPLACE FUNCTION get_user_credential(p_provider TEXT)
RETURNS TABLE (
  id UUID,
  encrypted_data TEXT,
  label TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT uc.id, uc.encrypted_data, uc.label
  FROM user_credentials uc
  WHERE uc.user_id = auth.uid()
    AND uc.provider = p_provider
    AND uc.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize user settings on first login
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user settings on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
