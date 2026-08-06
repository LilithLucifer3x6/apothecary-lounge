import { supabase } from './src/lib/supabase.js';

async function checkDates() {
  const { data, error } = await supabase.from('items').select('name, unopened_shelf_life_months, manufacture_date, purchase_date').not('unopened_shelf_life_months', 'is', null).limit(5);
  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

checkDates();
