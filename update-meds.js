import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: fetchErr } = await supabase.from('user_profile').select('*').limit(1);
  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    return;
  }
  if (!users || users.length === 0) {
    console.error("No user found.");
    return;
  }

  const user = users[0];
  let intake = user.intake_answers || {};
  let rxList = intake.rxList || [];

  // Remove Retaine MGD and Xiidra
  rxList = rxList.filter(rx => {
    const n = rx.name.toLowerCase();
    return !n.includes('retaine') && !n.includes('xiidra');
  });

  intake.rxList = rxList;

  const { error: updateErr } = await supabase
    .from('user_profile')
    .update({ intake_answers: intake })
    .eq('id', user.id);

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Medications successfully updated for user:", user.id);
  }
}
run();
