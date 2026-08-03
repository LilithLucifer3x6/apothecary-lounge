import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';

export async function render(container) {
  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Scrying Pool</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Echo</h3>
        <div class="mt mb-4">Prospective formula analysis. Present a formula to divine its nature.</div>
        <div class="field" style="display:flex; gap:0.5rem; align-items:flex-start;">
          <div class="ip mic" style="flex:1;">
            <textarea id="scry-input" rows="3" style="width:100%; background:transparent; border:none; color:var(--white); font-family:'IM Fell English', serif; font-size:1.1rem; resize:vertical; outline:none;" placeholder="Enter formula name or ingredients..."></textarea>
          </div>
          <button id="btn-scry" class="btn plum">Scry</button>
        </div>
        <div id="scry-status" style="margin-top:0.5rem; font-size:0.9rem; color:var(--rose); height:1rem;"></div>
        <div id="scry-result" style="margin-top:1rem; font-family:'IM Fell English', serif; font-size:1.1rem; line-height:1.5; color:var(--parch); white-space:pre-wrap;"></div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Reaction Grimoire</h3>
        <div class="mt mb-4">Log bodily responses to active ingredients.</div>
        <div class="row">
          <div style="flex:1;">
            <div class="nm">Tretinoin 0.05%</div>
            <div class="mt">Retinoid</div>
            <div style="display:flex; gap:1rem; margin-top:0.5rem;">
              <label><input type="checkbox"> Peeling</label>
              <label><input type="checkbox"> Redness</label>
              <label><input type="checkbox"> Purging</label>
              <label><input type="checkbox"> Dryness</label>
            </div>
          </div>
          <button class="btn sm plum">Log</button>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Waning</h3>
        <div class="mt mb-4">Formulas nearing their end.</div>
        <div id="waning-list">
          <div class="empty">No formulas are currently waning.</div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Crypt of Ashes</h3>
        <div class="mt mb-4">Permanently Banished Ingredients.</div>
        <div id="ashes-list">
          <div class="empty">No formulas have been banished yet.</div>
        </div>
      </div>
    </div>
  `;

  const { data: items } = await supabase.from('items').select('*');
  const inventory = items || [];
  
  // Calculate Silver Toll (if prices exist)
  // For the sake of the demo, we assume price might be stored in 'price' metadata, or we default to a simulated value if it's 0.
  // Wait, if no prices, we don't render it here, it was rendered in Rootwork. 
  
  const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
  
  const btnScry = document.getElementById('btn-scry');
  if (btnScry) {
    btnScry.addEventListener('click', async () => {
      const input = document.getElementById('scry-input').value.trim();
      if (!input) return;
      
      const status = document.getElementById('scry-status');
      const result = document.getElementById('scry-result');
      status.textContent = 'The Pool stirs...';
      result.textContent = '';
      
      try {
        const { evaluateScryingPool } = await import('../lib/ai-engine.js');
        const reply = await evaluateScryingPool(input, profile?.intake_answers || {}, inventory);
        
        // Render text
        status.textContent = '';
        result.textContent = reply;
      } catch (err) {
        console.error(err);
        status.textContent = 'The Pool is clouded. ' + err.message;
      }
    });
  }

  // Waning logic
  const waningList = document.getElementById('waning-list');
  const waningItems = inventory.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  if (waningItems.length > 0) {
    waningList.innerHTML = waningItems.map(item => `
      <div class="row">
        <div style="flex:1;">
          <div class="nm">${item.name}</div>
          <div class="mt">${item.brand} &bull; ${item.lifecycle_state}</div>
        </div>
        <button class="btn sm">Order</button>
      </div>
    `).join('');
  }

  // Crypt of Ashes logic (from intake conditions/allergies)
  const ashesList = document.getElementById('ashes-list');
  const allergies = profile?.intake_answers?.conditions?.filter(c => c.type === 'allergy') || [];
  // Also check if any inventory items were banished
  const banishedItems = inventory.filter(i => i.lifecycle_state === 'banished');
  
  if (allergies.length > 0 || banishedItems.length > 0) {
    let html = '';
    allergies.forEach(a => {
      html += `<div class="row" style="opacity:0.8;"><div style="flex:1;"><div class="nm" style="color:var(--rose);">${a.value}</div><div class="mt">Allergy / Sensitivity</div></div></div>`;
    });
    banishedItems.forEach(item => {
      html += `<div class="row" style="opacity:0.8;"><div style="flex:1;"><div class="nm" style="color:var(--rose);">${item.name}</div><div class="mt">${item.brand} &bull; Banished</div></div></div>`;
    });
    ashesList.innerHTML = html;
  }
}
