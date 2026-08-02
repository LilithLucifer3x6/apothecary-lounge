import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';

export async function render(container) {
  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Scrying Pool</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Echo</h3>
        <div class="mt mb-4">Prospective formula analysis (Phase 2).</div>
        <div class="empty">The Pool is still. Present a formula to divine its nature.</div>
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
        <div class="row">
          <div style="flex:1;">
            <div class="nm">Vitamin C Serum</div>
            <div class="mt">Opened 4 months ago. PAO: 6M.</div>
          </div>
          <div style="color:var(--crimson-b); font-weight:bold;">60 Days Remaining</div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Crypt of Ashes</h3>
        <div class="mt mb-4">Banished formulas.</div>
        <div class="empty">No formulas have been banished yet.</div>
      </div>
    </div>
  `;
}
