const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

async function run() {
  console.log("Setting up test data for Waning and Summoning Scroll...");

  const waningDate = new Date();
  waningDate.setMonth(waningDate.getMonth() - 5);
  waningDate.setDate(waningDate.getDate() - 15); // 5.5 months ago

  const testItems = [
    {
      name: 'Test Waning Serum',
      brand: 'TestBrand',
      category: 'serum',
      domain: 'Visage',
      item_type: 'consumable',
      lifecycle_state: 'stocked',
      period_after_opening_months: 6,
      opened_date: waningDate.toISOString(),
      is_essential: false,
    },
    {
      name: 'Test Essential Replenish',
      brand: 'TestBrand',
      category: 'cleanser',
      domain: 'Visage',
      item_type: 'consumable',
      lifecycle_state: 'ebbing',
      is_essential: true,
    },
    {
      name: 'Test Non-Essential Wait 1',
      brand: 'TestBrand',
      category: 'mask',
      domain: 'Visage',
      item_type: 'consumable',
      lifecycle_state: 'ebbing',
      is_essential: false,
    }
  ];

  for (const item of testItems) {
    const res = await fetch(url + '/rest/v1/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      console.error("Error inserting:", await res.text());
    }
  }

  console.log("Test data inserted into Supabase. If you check Rootwork in the UI, you should see them.");
  
  // Now let's test the logic
  const items = await fetch(url + '/rest/v1/items', {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  }).then(r => r.json());

  const enrichedApothecary = items
    .filter(i => (i.item_type === 'consumable' || i.item_type === 'composite') && !['ebbing', 'hollow', 'banished'].includes(i.lifecycle_state))
    .map(i => {
      let expiryPAO = null;
      let expiryShelf = null;

      if (i.period_after_opening_months && i.opened_date) {
        const start = new Date(i.opened_date);
        expiryPAO = new Date(start.setMonth(start.getMonth() + parseInt(i.period_after_opening_months, 10)));
      }

      if (i.unopened_shelf_life_months && (i.manufacture_date || i.purchase_date || i.created_at)) {
        const startShelf = new Date(i.manufacture_date || i.purchase_date || i.created_at);
        expiryShelf = new Date(startShelf.setMonth(startShelf.getMonth() + parseInt(i.unopened_shelf_life_months, 10)));
      }

      const trueExpiry = (expiryPAO && expiryShelf) 
        ? (expiryPAO < expiryShelf ? expiryPAO : expiryShelf) 
        : (expiryPAO || expiryShelf);
        
      let monthsLeft = null;
      if (trueExpiry) {
        monthsLeft = (trueExpiry - new Date()) / (1000 * 60 * 60 * 24 * 30);
      }
      
      return {
        ...i,
        is_expired: monthsLeft !== null && monthsLeft <= 0,
        is_waning: monthsLeft !== null && monthsLeft > 0 && monthsLeft <= 1
      };
    });

  const waningItems = enrichedApothecary.filter(i => i.is_waning || i.is_expired);
  console.log("Waning Items Logic output:", waningItems.map(i => i.name));

  const ebbing = items.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  const essential = ebbing.filter(i => i.is_essential);
  const nonEssential = ebbing.filter(i => !i.is_essential);
  const readyNonEssential = nonEssential.length >= 5 ? nonEssential : [];
  const pendingCount = nonEssential.length < 5 ? nonEssential.length : 0;
  
  const itemsToRender = [...essential, ...readyNonEssential];
  console.log("Summoning Scroll Rendered:", itemsToRender.map(i => i.name));
  console.log("Summoning Scroll Pending Count:", pendingCount);
}
run();
