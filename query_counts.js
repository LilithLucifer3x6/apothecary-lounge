import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.join('=').trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { count: reactionsCount, error: err1 } = await supabase
    .from('reactions')
    .select('*', { count: 'exact', head: true });

  const { count: somaticCount, error: err2 } = await supabase
    .from('somatic_reactions')
    .select('*', { count: 'exact', head: true });
    
  console.log(`Reactions count: ${reactionsCount}`);
  console.log(`Somatic Reactions count: ${somaticCount}`);
  if (err1) console.error("Error fetching reactions:", err1);
  if (err2) console.error("Error fetching somatic_reactions:", err2);
}
run();
