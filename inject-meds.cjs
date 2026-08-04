require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: users, error: fetchErr } = await supabase.from('user_profiles').select('*').limit(1);
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
    { name: 'Tretinoin cream', strength: '0.05%', zone: 'chin', frequency: 'Titration: 1-2 nights/week' },
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
    .from('user_profiles')
    .update({ intake_answers: intake })
    .eq('id', user.id);

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Medications successfully injected for user:", user.id);
  }
}

run();
