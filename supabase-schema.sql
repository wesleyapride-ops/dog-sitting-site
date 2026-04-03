-- ============================================
-- GenusPupClub — Supabase Schema
-- Paste this into: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================

-- Key-value store: mirrors localStorage exactly
-- Each gpc_ key becomes a row with its JSON value
CREATE TABLE IF NOT EXISTS gpc_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update timestamp on changes
CREATE OR REPLACE FUNCTION update_gpc_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS gpc_store_timestamp ON gpc_store;
CREATE TRIGGER gpc_store_timestamp
    BEFORE UPDATE ON gpc_store
    FOR EACH ROW
    EXECUTE FUNCTION update_gpc_timestamp();

-- Enable Row Level Security
ALTER TABLE gpc_store ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations with anon key (site is admin-controlled)
-- For production, you'd want auth-based policies
CREATE POLICY "Allow all access" ON gpc_store
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant access to anon and authenticated roles
GRANT ALL ON gpc_store TO anon;
GRANT ALL ON gpc_store TO authenticated;

-- Enable realtime for live sync across devices
ALTER PUBLICATION supabase_realtime ADD TABLE gpc_store;

-- Seed default keys so they exist for upsert
INSERT INTO gpc_store (key, value) VALUES
    ('services', '[]'::jsonb),
    ('addons', '[]'::jsonb),
    ('packages', '[]'::jsonb),
    ('zones', '[]'::jsonb),
    ('bookings', '[]'::jsonb),
    ('clients', '[]'::jsonb),
    ('pets', '[]'::jsonb),
    ('sitters', '[]'::jsonb),
    ('reviews', '[]'::jsonb),
    ('messages', '[]'::jsonb),
    ('properties', '[]'::jsonb),
    ('settings', '{}'::jsonb),
    ('users', '[]'::jsonb),
    ('payments', '[]'::jsonb),
    ('expenses', '[]'::jsonb),
    ('checkins', '[]'::jsonb),
    ('notifications', '[]'::jsonb),
    ('waivers', '[]'::jsonb),
    ('infamy', '[]'::jsonb),
    ('photos', '[]'::jsonb),
    ('email_config', '{}'::jsonb),
    ('email_log', '[]'::jsonb),
    ('site_content', '{}'::jsonb),
    ('staff_accounts', '[]'::jsonb),
    ('admin_creds', '{}'::jsonb),
    ('loyalty_points', '[]'::jsonb),
    ('referral_codes', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;
