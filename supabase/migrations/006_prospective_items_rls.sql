ALTER TABLE prospective_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON prospective_items;
CREATE POLICY "Allow all access" ON prospective_items FOR ALL USING (true) WITH CHECK (true);
