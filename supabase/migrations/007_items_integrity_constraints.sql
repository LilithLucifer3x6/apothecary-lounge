ALTER TABLE items ADD COLUMN IF NOT EXISTS is_essential BOOLEAN;
UPDATE items SET is_essential = false WHERE is_essential IS NULL;
ALTER TABLE items ALTER COLUMN is_essential SET DEFAULT false;
ALTER TABLE items ALTER COLUMN is_essential SET NOT NULL;
UPDATE items SET is_prescription = false WHERE is_prescription IS NULL;
ALTER TABLE items ALTER COLUMN is_prescription SET NOT NULL;
UPDATE items SET application_zones = ARRAY['visage']
  WHERE application_zones IS NULL OR array_length(application_zones, 1) IS NULL;
ALTER TABLE items ALTER COLUMN application_zones SET NOT NULL;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'application_zones_not_empty') THEN
    ALTER TABLE items ADD CONSTRAINT application_zones_not_empty
      CHECK (array_length(application_zones, 1) > 0);
  END IF;
END $$;
