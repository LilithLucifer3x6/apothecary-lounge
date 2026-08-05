-- The Apothecary Lounge — Core Schema
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

-- Reactions
CREATE TABLE IF NOT EXISTS reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  zone TEXT,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now()
);

-- Appointments (salon, recurring rituals)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  glyph TEXT,
  cadence_weeks INTEGER,
  last_completed DATE,
  next_due DATE,
  is_optional BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Journal entries (Shadow Tome)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  moods TEXT[] DEFAULT '{}',
  body_text TEXT,
  is_breathing_session BOOLEAN DEFAULT false,
  breathing_duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Storage locations (user-extensible)
CREATE TABLE IF NOT EXISTS storage_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Glyph registry (uniqueness enforcement)
CREATE TABLE IF NOT EXISTS glyph_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  glyph_name TEXT NOT NULL UNIQUE,
  assigned_to TEXT NOT NULL,
  assigned_type TEXT NOT NULL CHECK (assigned_type IN ('item', 'category', 'ritual', 'altar', 'appointment', 'system')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tretinoin titration tracking
CREATE TABLE IF NOT EXISTS titration_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_frequency TEXT,
  tolerance_responses JSONB DEFAULT '{}',
  recommendation TEXT,
  user_confirmed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Disable RLS for single-user app (no auth needed)
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE composite_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE codex_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE glyph_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE titration_log ENABLE ROW LEVEL SECURITY;

-- Allow anon access to all tables (single-user, private app)
CREATE POLICY "Allow all access" ON user_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON composite_components FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON codex_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON conflict_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON routine_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON reactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON journal_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON storage_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON glyph_registry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON titration_log FOR ALL USING (true) WITH CHECK (true);
-- Seed Data for The Apothecary Lounge

INSERT INTO codex_entries (ingredient, reason, is_permanent, source)
VALUES ('lavender', 'Known sensitivity — permanent entry', true, 'system');

INSERT INTO storage_locations (name)
VALUES 
  ('Mini fridge'),
  ('Bathroom shelf'),
  ('Vanity'),
  ('Basket'),
  ('Cabinet'),
  ('Shower caddy');

INSERT INTO appointments (name, cadence_weeks, glyph, is_optional)
VALUES
  ('Root Weaving', 8, 'locs', false),
  ('Talon Honing', 2, 'talon', false),
  ('The Soaking', 2, 'bathtub', false),
  ('The Smoothing', NULL, 'depilatory', true),
  ('The Paring', NULL, 'razor', true);

INSERT INTO conflict_rules (ingredient_a, ingredient_b, conflict_type, description, source)
VALUES
  ('retinoid', 'acid', 'separate_days', 'May cause excess irritation and compromise the skin barrier.', 'reference'),
  ('retinoid', 'vitamin_c', 'separate_am_pm', 'Differing optimal pH ranges and increased irritation risk.', 'reference'),
  ('retinoid', 'benzoyl_peroxide', 'separate_days', 'Benzoyl peroxide can degrade certain retinoids and increase dryness.', 'reference'),
  ('acid', 'acid', 'advisory', 'Layering AHA and BHA can lead to over-exfoliation. Proceed with caution.', 'reference'),
  ('vitamin_c', 'niacinamide', 'advisory', 'Historical concern of flushing; mostly outdated but worth noting for sensitive skin.', 'reference');
CREATE TABLE IF NOT EXISTS public.shadowtome_elixirs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brand text,
  name text NOT NULL,
  ingredients jsonb,
  caffeine_content text,
  steep_time text,
  circadian_alignment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


