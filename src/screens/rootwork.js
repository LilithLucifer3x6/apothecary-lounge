import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';

export async function render(container) {
  container.innerHTML = `<div class="card"><div class="empty">Unearthing roots...</div></div>`;
  
  const { data: items } = await supabase.from('items').select('*').order('name');
  const itemsArr = items || [];
  
  const ebbing = itemsArr.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  const apothecary = itemsArr.filter(i => i.type === 'product' && !['ebbing', 'hollow', 'banished'].includes(i.lifecycle_state));
  const arsenal = itemsArr.filter(i => i.type === 'tool' && i.lifecycle_state !== 'banished');

  function renderRow(item) {
    let statusPill = '';
    if (item.lifecycle_state === 'ebbing') statusPill = '<span class="pill eb">Ebbing</span>';
    if (item.lifecycle_state === 'hollow') statusPill = '<span class="pill ho">Hollow</span>';
    
    return `
      <div class="row">
        <div class="tg">${ic(G.tabRoot)}</div>
        <div style="flex:1;">
          <div class="nm">${item.name} ${statusPill}</div>
          <div class="mt">${item.brand} &bull; ${item.category}</div>
        </div>
        <div class="acts">
          <button class="btn sm">Amend</button>
          <button class="btn sm g">Banish</button>
        </div>
      </div>
    `;
  }

  let html = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
        <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; color:var(--parch); margin:0;">The Rootwork</h2>
        <button id="btn-add-item" class="btn plum">+ Add to Inventory</button>
      </div>
  `;

  if (ebbing.length > 0) {
    html += `
      <div class="card mb-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Summoning Scroll</h3>
        <div class="mt mb-4">Items needing replenishment.</div>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${ebbing.map(renderRow).join('')}
        </div>
      </div>
    `;
  }

  html += `
      <div class="card mb-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Apothecary</h3>
        <div class="mt mb-4">Consumable preparations.</div>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${apothecary.length > 0 ? apothecary.map(renderRow).join('') : '<div class="empty">No active preparations.</div>'}
        </div>
      </div>

      <div class="card mb-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Arsenal</h3>
        <div class="mt mb-4">Durable tools.</div>
        <div style="display:flex; flex-direction:column; gap:0.5rem;">
          ${arsenal.length > 0 ? arsenal.map(renderRow).join('') : '<div class="empty">No tools gathered.</div>'}
        </div>
      </div>
      
      <div class="card mb-4" style="text-align:center;">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Silver Toll</h3>
        <div class="mt">Estimated Monthly Routine Cost</div>
        <div style="font-size:2rem; font-family:'Cormorant Garamond', serif; color:var(--gold); margin-top:1rem;">$124.50</div>
      </div>

    </div>

    <!-- Add Item Modal -->
    <div id="add-modal" class="modal" style="display:none;">
      <div class="modal-content card" style="max-width:500px;">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Add to Rootwork</h3>
        <div class="mt mb-4">Inscribe a new item into the codex.</div>
        
        <div class="field">
          <label>Photo Scan</label>
          <div style="position:relative; overflow:hidden; background:var(--card2); border:1px dashed var(--border); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:1rem; color:var(--dim); cursor:pointer;">
            ${ic(G.tabPool)} <span id="photo-status" style="margin-top:0.5rem; text-align:center;">Upload or take a photo</span>
            <input type="file" id="photo-upload" accept="image/*" capture="environment" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
          </div>
        </div>

        <div class="field">
          <label>Brand</label>
          <div class="ip mic"><input type="text" id="add-brand"></div>
        </div>
        <div class="field">
          <label>Name</label>
          <div class="ip mic"><input type="text" id="add-name"></div>
        </div>
        <div class="field">
          <label>Domain</label>
          <select id="add-domain">
            <option value="skin">Skin</option>
            <option value="hair">Hair</option>
            <option value="body">Body</option>
          </select>
        </div>
        <div class="field">
          <label>Category</label>
          <div class="ip mic"><input type="text" id="add-cat"></div>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:1rem; margin-top:2rem;">
          <button id="btn-add-cancel" class="btn">Cancel</button>
          <button id="btn-add-save" class="btn plum">Enshrine</button>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  attachVoice();

  document.getElementById('btn-add-item').addEventListener('click', () => {
    document.getElementById('add-modal').style.display = 'block';
  });
  
  document.getElementById('btn-add-cancel').addEventListener('click', () => {
    document.getElementById('add-modal').style.display = 'none';
  });
  
  document.getElementById('btn-add-save').addEventListener('click', async () => {
    const brand = document.getElementById('add-brand').value;
    const name = document.getElementById('add-name').value;
    const domain = document.getElementById('add-domain').value;
    const category = document.getElementById('add-cat').value;
    
    if (name) {
      await supabase.from('items').insert([{
        brand,
        name,
        domain,
        category,
        type: 'product',
        lifecycle_state: 'stocked'
      }]);
      render(container); // Re-render to show new item
    }
  });

  const photoUpload = document.getElementById('photo-upload');
  if (photoUpload) {
    photoUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const status = document.getElementById('photo-status');
      status.textContent = 'Divining image...';
      
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target.result;
        const base64 = dataUrl.split(',')[1];
        const mime = dataUrl.split(';')[0].split(':')[1];
        
        try {
          const { parseProductImage } = await import('../lib/ai-engine.js');
          const details = await parseProductImage(base64, mime);
          
          if (details.brand) document.getElementById('add-brand').value = details.brand;
          if (details.name) document.getElementById('add-name').value = details.name;
          if (details.category) document.getElementById('add-cat').value = details.category;
          
          status.textContent = 'Vision extracted.';
        } catch (err) {
          console.error(err);
          status.textContent = 'Failed to divine image.';
        }
      };
      reader.readAsDataURL(file);
    });
  }
}
