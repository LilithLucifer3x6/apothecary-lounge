CREATE TABLE IF NOT EXISTS isotretinoin_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  last_confirmed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_confirmed_dose_mg INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE isotretinoin_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access" ON isotretinoin_log;
CREATE POLICY "Allow all access" ON isotretinoin_log FOR ALL USING (true) WITH CHECK (true);
