const url = 'https://gwezojwujynharoqjuio.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXpvand1anluaGFyb3FqdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUwNzgsImV4cCI6MjEwMTIyMTA3OH0.BPF1s-QjY0EF8xE6lumPDXxbZbg7XgPg1csVfPTNWdQ';

const headers = {
  'apikey': key,
  'Authorization': 'Bearer ' + key,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

async function getCount(query) {
  const res = await fetch(`${url}/rest/v1/items?${query}`, { method: 'HEAD', headers });
  const range = res.headers.get('content-range');
  if (range) {
    return parseInt(range.split('/')[1], 10);
  }
  return 0;
}

async function checkNullCounts() {
  const fields = [
    'application_zones',
    'lifecycle_state',
    'ingredients',
    'risk_flags',
    'opened_date',
    'period_after_opening_months',
    'unopened_shelf_life_months',
    'manufacture_date',
    'purchase_date',
    'is_essential',
    'is_prescription',
    'prescription_details',
    'item_type',
    'composite_form'
  ];

  console.log("Checking null counts...");
  
  const results = {};
  
  results.total = await getCount('select=*');

  for (const field of fields) {
    results[field] = await getCount(`select=*&${field}=is.null`);
  }
  
  results['application_zones_empty'] = await getCount('select=*&application_zones=eq.%5B%5D'); // eq.[] URL encoded is eq.%5B%5D or just eq.[]? Let's use eq.[] 
  
  console.log(JSON.stringify(results, null, 2));
}

checkNullCounts();
