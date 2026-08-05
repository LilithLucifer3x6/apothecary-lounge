const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { count: c1, error: e1 } = await supabase.from('reactions').select('*', { count: 'exact', head: true });
  const { count: c2, error: e2 } = await supabase.from('somatic_reactions').select('*', { count: 'exact', head: true });
  console.log('reactions table row count:', c1);
  if (e1) console.log('reactions error:', e1.message);
  console.log('somatic_reactions table row count:', c2);
  if (e2) console.log('somatic_reactions error:', e2.message);
}
run();
