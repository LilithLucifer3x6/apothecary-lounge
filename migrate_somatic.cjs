const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Qyf6Y22eKphAydUG@db.gwezojwujynharoqjuio.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS somatic_reactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      item_id uuid REFERENCES items(id) ON DELETE CASCADE,
      zone text NOT NULL,
      severity int NOT NULL CHECK (severity BETWEEN 1 AND 5),
      symptoms text[] NOT NULL DEFAULT '{}'
    );
    
    -- Set RLS policies
    ALTER TABLE somatic_reactions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Enable all access for all users" ON somatic_reactions;
    
    CREATE POLICY "Enable all access for all users" ON somatic_reactions FOR ALL USING (true) WITH CHECK (true);
  `);
  
  console.log("Table somatic_reactions created");
  await client.end();
}

run().catch(console.error);
