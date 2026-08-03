import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';
import { buildRoutines, checkConflicts } from '../lib/routine-engine.js';

export async function render(container) {
  // Show loading
  container.innerHTML = `<div class="card"><div class="empty">Consulting the rites...</div></div>`;

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in('lifecycle_state', ['stocked', 'ebbing', 'enshrined'])
    .order('category', { ascending: true }); // simplified sort

  const itemsArr = items || [];
  
  if (itemsArr.length === 0) {
    container.innerHTML = `
      <div class="card" style="margin:2rem;">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <div class="empty">
          <div style="font-size:3rem; margin-bottom:1rem;">${ic(G.tabRoot)}</div>
          The shelves are bare. Visit The Rootwork to begin gathering.
        </div>
      </div>
    `;
    return;
  }

  // Use the engine to build routines and check for conflicts
  const { amItems, pmItems } = buildRoutines(itemsArr);
  const conflicts = checkConflicts(itemsArr);

  function renderStep(item, isOpt = false, isRx = false, isAid = false) {
    const rxClass = isRx ? 'rx' : '';
    const optClass = isOpt ? 'opt' : '';
    const aidBadge = isAid ? `<span class="aid" title="Partner Assisted">${ic(G.tabAltars)}</span>` : '';
    
    // Using a toggle for optional, checkbox for mandatory
    const control = isOpt 
      ? `<label class="sw"><input type="checkbox"><span class="sl"></span></label>`
      : `<input type="checkbox" class="step-chk" data-id="${item.id}">`;

    return `
      <div class="step ${optClass}">
        ${control}
        <div style="flex:1;">
          <div class="nm ${rxClass}">${item.name} ${aidBadge}</div>
          <div class="mt">${item.brand || 'Prescription'} &bull; ${item.storage_location || 'Vanity'}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:1rem;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Mortal Rites</h2>
      <div style="text-align:center; margin-bottom:2rem; font-family:'Cormorant Garamond', serif; font-style:italic; color:var(--ash);">
        ${getRitualDate()}
      </div>

      <div class="rites2">
        <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Morning Invocation ${speakerMarkup('Morning Invocation')}</h3>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
          ${amItems.length > 0 ? amItems.map(i => renderStep(i)).join('') : '<div class="empty">No morning rites.</div>'}
        </div>
      </div>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>Evening Invocation ${speakerMarkup('Evening Invocation')}</h3>
        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:1rem;">
          ${pmItems.length > 0 ? pmItems.map(i => renderStep(i)).join('') : '<div class="empty">No evening rites.</div>'}
        </div>
      </div>
      
      ${conflicts.length > 0 ? `
      <div class="card mt-4" style="background:var(--card-bg-alt, rgba(100,20,20,0.5)); border-color:#882222;">
        <h3 style="color:#ff8888;">Keeper's Warning</h3>
        <ul style="margin-top:0.5rem; color:#ffcccc; padding-left:1.5rem;">
          ${conflicts.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <div style="margin-top:2rem; text-align:center;">
        <button id="btn-save-rite" class="btn plum" style="font-size:1.2rem; padding:1rem 2rem;">Conclude the Rite</button>
      </div>
      </div>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Long Hours ${speakerMarkup('The Long Hours')}</h3>
        <div class="mt mb-4">Habits of the day.</div>
        <div class="step"><input type="checkbox"> <div class="nm">Water (64oz)</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">SPF Reapplication</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Gentle Movement (Ride/Walk)</div></div>
        <div class="step"><input type="checkbox"> <div class="nm">Stretching (Rope)</div></div>
      </div>
    </div>
  `;

  const btnSave = document.getElementById('btn-save-rite');
  if (btnSave) {
    btnSave.addEventListener('click', async (e) => {
      btnSave.textContent = 'Rite Concluded';
      btnSave.classList.replace('plum', 'g');
      btnSave.disabled = true;

      // Collect checked item IDs
      const checkedIds = Array.from(document.querySelectorAll('.step-chk:checked')).map(chk => chk.dataset.id);
      
      if (checkedIds.length > 0) {
        await supabase.from('routine_history').insert({
          completed_at: new Date().toISOString(),
          items_used: checkedIds
        });
      }
    });
  }
}

function getRitualDate() {
  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = d.getDate();
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";
  return `The ${day}${suffix} of ${months[d.getMonth()]}`;
}
