import { ic, G } from '../lib/icons.js';
import { supabase } from '../lib/supabase.js';

export async function render(container) {
  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto; display:flex; gap:1rem;">
      <div class="sub" style="width:220px; display:flex; flex-direction:column; gap:0.5rem;">
        <button class="st active" data-altar="crown" data-name="Crown" style="text-align:left; padding-left:1rem;">${ic(G.crown)} The Crown</button>
        <button class="st" data-altar="gaze" data-name="Gaze" style="text-align:left; padding-left:1rem;">${ic(G.gaze)} The Gaze</button>
        <button class="st" data-altar="grin" data-name="Grin" style="text-align:left; padding-left:1rem;">${ic(G.grin)} The Grin</button>
        <button class="st" data-altar="visage" data-name="Visage" style="text-align:left; padding-left:1rem;">${ic(G.visage)} The Visage</button>
        <button class="st" data-altar="vessel" data-name="Vessel" style="text-align:left; padding-left:1rem;">${ic(G.vessel)} The Vessel</button>
      </div>
      
      <div class="card" style="flex:1; min-height:300px; transition: opacity 0.3s ease;" id="altar-content">
        <div class="empty">Invoking the altar...</div>
      </div>
    </div>
  `;

  const contentArea = document.getElementById('altar-content');
  
  async function loadAltar(altarId, altarName) {
    contentArea.style.opacity = 0;
    
    setTimeout(() => {
      let html = `<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>`;
      
      html += `
        <h3>The ${altarName} is Still</h3>
        <div class="mt mb-4">No rites currently inscribed for this domain. The shelves are bare.</div>
      `;
      
      contentArea.innerHTML = html;
      contentArea.style.opacity = 1;
    }, 150);
  }
  
  // Bind tabs
  document.querySelectorAll('.st').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.st').forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      loadAltar(targetBtn.getAttribute('data-altar'), targetBtn.getAttribute('data-name'));
    });
  });
  
  // Load initial
  loadAltar('crown', 'Crown');
}
