-- Part A (Supplement): DB-Level Constraint for application_zones
-- Run this in the Supabase SQL Editor

-- Backfill any existing null or empty rows with a placeholder zone ("visage") so they pass the constraint
UPDATE items SET application_zones = '["visage"]'::jsonb WHERE application_zones IS NULL OR jsonb_array_length(application_zones) = 0;

-- Lock down NOT NULL
ALTER TABLE items ALTER COLUMN application_zones SET NOT NULL;

-- Ensure the array is never empty, preventing the silent false-negative bug in the conflict engine
ALTER TABLE items ADD CONSTRAINT application_zones_not_empty CHECK (jsonb_array_length(application_zones) > 0);
