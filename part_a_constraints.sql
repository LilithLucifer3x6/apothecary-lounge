-- Part A: Database-Level NOT NULL Constraints
-- Run this in the Supabase SQL Editor

-- 1. lifecycle_state
UPDATE items SET lifecycle_state = 'stocked' WHERE lifecycle_state IS NULL;
ALTER TABLE items ALTER COLUMN lifecycle_state SET DEFAULT 'stocked';
ALTER TABLE items ALTER COLUMN lifecycle_state SET NOT NULL;

-- 2. item_type
UPDATE items SET item_type = 'consumable' WHERE item_type IS NULL;
ALTER TABLE items ALTER COLUMN item_type SET DEFAULT 'consumable';
ALTER TABLE items ALTER COLUMN item_type SET NOT NULL;

-- 3. is_essential
UPDATE items SET is_essential = false WHERE is_essential IS NULL;
ALTER TABLE items ALTER COLUMN is_essential SET DEFAULT false;
ALTER TABLE items ALTER COLUMN is_essential SET NOT NULL;

-- 4. is_prescription
UPDATE items SET is_prescription = false WHERE is_prescription IS NULL;
ALTER TABLE items ALTER COLUMN is_prescription SET DEFAULT false;
ALTER TABLE items ALTER COLUMN is_prescription SET NOT NULL;
