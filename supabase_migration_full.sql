-- The Apothecary Lounge / Shadow & Sanctuary — Core Schema
-- Run this in the Supabase SQL Editor

-- User profile (single row for single-user app)
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  display_name TEXT,
  avatar_config JSONB DEFAULT '{}',
  familiar TEXT DEFAULT 'cat',
  intake_completed BOOLEAN DEFAULT false,
  intake_answers JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{"font_size": "1", "typeface": "default", "tts_enabled": false, "tts_voice": null, "tts_rate": 1.0}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- Items (all inventory — consumables, tools, composites)
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  domain TEXT NOT NULL CHECK (domain IN ('Crown', 'Gaze', 'Grin', 'Visage', 'Vessel')),
  category TEXT,
  sub_class TEXT,
  item_type TEXT NOT NULL DEFAULT 'consumable' CHECK (item_type IN ('consumable', 'tool', 'composite')),
  application_zones TEXT[] DEFAULT '{}',
  ingredients JSONB DEFAULT '[]',
  behavior_flags JSONB DEFAULT '{"requires_rinse": false, "timer_minutes": null, "layering_weight": 5}',
  risk_flags JSONB DEFAULT '{"melanin_caution": false, "photosensitizer": false, "comedogenic": false, "buildup_risk": false, "fragrance": false, "retinoid": false, "acid": false, "vitamin_c": false, "benzoyl_peroxide": false, "exfoliant": false}',
  lifecycle_state TEXT NOT NULL DEFAULT 'stocked' CHECK (lifecycle_state IN ('stocked', 'ebbing', 'hollow', 'enshrined', 'banished')),
  is_prescription BOOLEAN DEFAULT false,
  prescription_details JSONB,
  is_opened BOOLEAN DEFAULT false,
  opened_date DATE,
  period_after_opening_months INTEGER,
  unopened_shelf_life_months INTEGER,
  manufacture_date DATE,
  purchase_date DATE,
  storage_location TEXT,
  price DECIMAL(10,2),
  scheduling_mode TEXT DEFAULT 'scheduled' CHECK (scheduling_mode IN ('scheduled', 'anytime')),
  time_of_day TEXT DEFAULT 'both' CHECK (time_of_day IN ('morning', 'evening', 'both')),
  partner_assisted BOOLEAN DEFAULT false,
  glyph TEXT,
  banish_reason TEXT,
  banish_type TEXT,
  cleaning_cadence_days INTEGER,
  maintenance_notes TEXT,
  expected_service_life TEXT,
  usage_rules TEXT,
  composite_form TEXT CHECK (composite_form IN ('oil', 'liquid', 'powder', 'balm', 'other') OR composite_form IS NULL),
  batch_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- Composite components junction
CREATE TABLE IF NOT EXISTS composite_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  composite_id UUID REFERENCES items(id) ON DELETE CASCADE,
  component_id UUID REFERENCES items(id) ON DELETE CASCADE,
  proportion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Codex (ingredient block list)
CREATE TABLE IF NOT EXISTS codex_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient TEXT NOT NULL,
  reason TEXT,
  is_permanent BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Conflict rules (reference data for synergy engine)
CREATE TABLE IF NOT EXISTS conflict_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_a TEXT NOT NULL,
  ingredient_b TEXT NOT NULL,
  conflict_type TEXT NOT NULL CHECK (conflict_type IN ('block', 'separate_days', 'separate_am_pm', 'advisory')),
  description TEXT,
  zone_specific BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'reference',
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Routine history
CREATE TABLE IF NOT EXISTS routine_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_date DATE NOT NULL DEFAULT CURRENT_DATE,
  routine_type TEXT NOT NULL CHECK (routine_type IN ('morning', 'evening')),
  item_id UUID REFERENCES items(id) ON DELETE SET NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER,
  completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Somatic Reactions (Merged with reactions)
CREATE TABLE IF NOT EXISTS somatic_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  zone TEXT,
  severity TEXT,
  symptoms JSONB DEFAULT '[]',
  reaction_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  practitioner TEXT,
  appointment_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  notes TEXT,
  reminders JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT,
  notes TEXT,
  photos TEXT[],
  moon_phase TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Storage Locations
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  environment_type TEXT CHECK (environment_type IN ('dry', 'humid', 'refrigerated', 'dark')),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Glyph Registry
CREATE TABLE IF NOT EXISTS glyph_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  svg_path TEXT NOT NULL,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Titration Log
CREATE TABLE IF NOT EXISTS titration_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  dosage_amount DECIMAL(10,2),
  dosage_unit TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ShadowTome Elixirs
CREATE TABLE IF NOT EXISTS shadowtome_elixirs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT,
  name TEXT NOT NULL,
  ingredients JSONB,
  caffeine_content TEXT,
  steep_time TEXT,
  circadian_alignment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Enable RLS on all tables
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE composite_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE codex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE somatic_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glyph_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE titration_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadowtome_elixirs ENABLE ROW LEVEL SECURITY;

-- Allow anon access to all tables (single-user, private app)
DROP POLICY IF EXISTS "Allow all access" ON user_profile;
CREATE POLICY "Allow all access" ON user_profile FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON items;
CREATE POLICY "Allow all access" ON items FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON composite_components;
CREATE POLICY "Allow all access" ON composite_components FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON codex_entries;
CREATE POLICY "Allow all access" ON codex_entries FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON conflict_rules;
CREATE POLICY "Allow all access" ON conflict_rules FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON routine_history;
CREATE POLICY "Allow all access" ON routine_history FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON somatic_reactions;
CREATE POLICY "Allow all access" ON somatic_reactions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON appointments;
CREATE POLICY "Allow all access" ON appointments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON journal_entries;
CREATE POLICY "Allow all access" ON journal_entries FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON storage_locations;
CREATE POLICY "Allow all access" ON storage_locations FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON glyph_registry;
CREATE POLICY "Allow all access" ON glyph_registry FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON titration_log;
CREATE POLICY "Allow all access" ON titration_log FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all access" ON shadowtome_elixirs;
CREATE POLICY "Allow all access" ON shadowtome_elixirs FOR ALL USING (true) WITH CHECK (true);

-- MERGE reactions INTO somatic_reactions safely
-- We only copy rows that don't already perfectly match on item_id, zone, severity, and DATE(created_at)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reactions') THEN
        INSERT INTO somatic_reactions (item_id, zone, severity, reaction_type, notes, created_at)
        SELECT r.item_id, r.zone, r.severity, r.reaction_type, r.notes, r.logged_at
        FROM reactions r
        WHERE NOT EXISTS (
            SELECT 1 FROM somatic_reactions sr 
            WHERE sr.item_id = r.item_id 
              AND sr.zone = r.zone 
              AND sr.severity = r.severity 
              AND DATE(sr.created_at) = DATE(r.logged_at)
        );
        
        -- Drop the old table now that it is merged
        DROP TABLE reactions;
    END IF;
END $$;
