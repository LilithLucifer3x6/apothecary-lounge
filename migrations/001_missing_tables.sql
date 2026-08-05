-- Core Schema for The Apothecary Lounge

-- User profiles (single user focus)
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  health_data JSONB DEFAULT '{}',
  avatar_config JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  intake_completed BOOLEAN DEFAULT false,
  intake_answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- Items (Rootwork inventory)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  domain TEXT NOT NULL CHECK (domain IN ('Crown', 'Gaze', 'Grin', 'Visage', 'Vessel')),
  primary_category TEXT,
  subclass TEXT,
  application_zones TEXT[],
  ingredients JSONB,
  behavior_flags JSONB DEFAULT '{}',
  risk_flags JSONB DEFAULT '{}',
  lifecycle_state TEXT DEFAULT 'stocked' CHECK (lifecycle_state IN ('stocked', 'ebbing', 'enshrined')),
  purchase_date DATE,
  opened_date DATE,
  expiry_date DATE,
  uses_per_week INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- Routine History (Tracking Rites/Altars completions)
CREATE TABLE IF NOT EXISTS routine_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  completed_at TIMESTAMPTZ NOT NULL,
  items_used UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Journal Entries (ShadowTome)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  body_text TEXT,
  moods TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ShadowTome Elixirs
CREATE TABLE IF NOT EXISTS shadowtome_elixirs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT,
  name TEXT,
  ingredients JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Somatic Reactions (Scrying)
CREATE TABLE IF NOT EXISTS somatic_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  notes TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Function to handle `updated_at` triggers
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_user_profile_modtime ON user_profile;
CREATE TRIGGER update_user_profile_modtime BEFORE UPDATE ON user_profile FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_items_modtime ON items;
CREATE TRIGGER update_items_modtime BEFORE UPDATE ON items FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


