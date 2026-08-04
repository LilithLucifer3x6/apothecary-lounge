import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: fetchErr } = await supabase.from('user_profile').select('*').limit(1);
  if (fetchErr) return console.error(fetchErr);
  if (!users || users.length === 0) return;
  const user = users[0];
  let intake = user.intake_answers || {};
  let rxList = intake.rxList || [];

  // Remove Tretinoin
  rxList = rxList.filter(rx => !rx.name.toLowerCase().includes('tretinoin'));

  intake.rxList = rxList;
  await supabase.from('user_profile').update({ intake_answers: intake }).eq('id', user.id);
  console.log("Tretinoin removed.");
}
run();
