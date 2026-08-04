import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf-8');
const SUPABASE_URL = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const SUPABASE_ANON_KEY = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: fetchErr } = await supabase.from('user_profile').select('*');
  if (fetchErr) return console.error(fetchErr);
  
  for (const user of users) {
    let intake = user.intake_answers || {};
    
    intake.rxList = [
      { name: 'Tacrolimus ointment', strength: '0.1%', zone: 'orbital and eyelid', frequency: 'Eyelid eczema' },
      { name: 'Drysol (Aluminium Chloride)', strength: '', zone: 'underarms', frequency: 'Bedtime, dry skin only' },
      { name: 'Zoryve foam', strength: '0.3%', zone: '', frequency: 'Ebbing' }
    ];
    intake.noRx = false;

    intake.oralList = [
      { name: 'Isotretinoin', dose: '40mg', frequency: 'Alternating 1 pill / 2 pills every other day (avg 60mg/day)' },
      { name: 'Methotrexate', dose: '15mg', frequency: 'Once a week' },
      { name: 'Enbrel (Etanercept)', dose: 'Pending', frequency: '1 injection a week' },
      { name: 'Wegovy', dose: '2.4mg', frequency: 'Once a week' }
    ];
    intake.noOral = false;

    await supabase.from('user_profile').update({ intake_answers: intake }).eq('id', user.id);
    console.log(`Updated user ${user.id}`);
  }
}
run();
