import { ic, G } from '../lib/icons.js';
import { supabase } from '../lib/supabase.js';

export async function render(container) {
  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto; display:flex; gap:1rem;">
      <div class="sub" style="width:200px; display:flex; flex-direction:column; gap:0.5rem;">
        <button class="st active" data-altar="crown">${ic(G.tabAltars)} The Crown</button>
        <button class="st" data-altar="gaze">${ic(G.tabPool)} The Gaze</button>
        <button class="st" data-altar="grin">${ic(G.tabGrim)} The Grin</button>
        <button class="st" data-altar="visage">${ic(G.tabRites)} The Visage</button>
        <button class="st" data-altar="vessel">${ic(G.tabTome)} The Vessel</button>
      </div>
      
      <div class="card" style="flex:1;" id="altar-content">
        <div class="empty">Invoking the altar...</div>
      </div>
    </div>
  `;

  const contentArea = document.getElementById('altar-content');
  
  async function loadAltar(altarId) {
    // In a real app we'd fetch specific routines per altar from the engine based on domains.
    // For now, providing a hardcoded representation of the engine's output for these specific altars.
    
    let html = `<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>`;
    
    if (altarId === 'crown') {
      html += `
        <h3>The Crown</h3>
        <div class="mt mb-4">Hair and scalp maintenance.</div>
        <div class="step"><input type="checkbox"> <div class="nm">Scalp Oil (Rosemary/Mint)</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Wrap in Silk</div></div>
      `;
    } else if (altarId === 'grin') {
      html += `
        <h3>The Grin</h3>
        <div class="mt mb-4">Oral care. Fixed sequence.</div>
        <div class="step"><input type="checkbox"> <div class="nm">Floss</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Waterpick</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Mouthwash</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Brush (Sonicare)</div></div>
      `;
    } else {
      html += `
        <h3>The Altar is Still</h3>
        <div class="mt mb-4">No rites currently inscribed for this domain.</div>
      `;
    }
    
    contentArea.innerHTML = html;
  }
  
  // Bind tabs
  document.querySelectorAll('.st').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.st').forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      loadAltar(targetBtn.getAttribute('data-altar'));
    });
  });
  
  // Load initial
  loadAltar('crown');
}
