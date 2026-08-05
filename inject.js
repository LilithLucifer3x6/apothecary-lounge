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

  // Update Topicals
  intake.rxList = [
    { name: 'Tacrolimus ointment', strength: '0.1%', zone: 'orbital and eyelid', frequency: 'Eyelid eczema' },
    { name: 'Drysol (Aluminium Chloride)', strength: '', zone: 'underarms', frequency: 'Bedtime, dry skin only' },
    { name: 'Zoryve foam', strength: '0.3%', zone: '', frequency: 'Ebbing' },
    { name: 'Retaine MGD drops', strength: '', zone: 'eyes', frequency: '15-20 min before Menicon Z' }
  ];
  intake.noRx = false;

  // Update Orals
  intake.oralList = [
    { name: 'Isotretinoin', dose: '40mg', frequency: 'Alternating 1 pill / 2 pills every other day (avg 60mg/day)' },
    { name: 'Methotrexate', dose: '15mg', frequency: 'Once a week' },
    { name: 'Enbrel (Etanercept)', dose: 'Pending', frequency: '1 injection a week' },
    { name: 'Wegovy', dose: '2.4mg', frequency: 'Once a week' }
  ];
  intake.noOral = false;

  const { error: updateErr } = await supabase
    .from('user_profile')
    .update({ intake_answers: intake })
    .eq('id', user.id);

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Medications successfully injected for user:", user.id);
  }
}
run();
