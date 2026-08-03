import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';

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

  // Simple mock engine for sorting into am/pm
  const amItems = itemsArr.filter(i => !['Retinoid', 'Sleeping Mask'].includes(i.category));
  const pmItems = itemsArr.filter(i => !['Sunscreen'].includes(i.category));

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
        <div class="ritecol card">
          <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
          <h3>The Waking Rite ${speakerMarkup('The Waking Rite')}</h3>
          <div class="mt mb-4">Greet the sun.</div>
          
          <div class="rite-steps" id="am-steps">
            ${amItems.map(i => renderStep(i, i.category === 'Mask')).join('')}
          </div>
          <button class="btn plum full mt-4 btn-seal" data-rite="am">Seal the Waking Rite</button>
        </div>

        <div class="ritecol card">
          <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
          <h3>The Closing Rite ${speakerMarkup('The Closing Rite')}</h3>
          <div class="mt mb-4">Banish the day.</div>
          
          <div class="rite-steps" id="pm-steps">
            ${pmItems.map(i => renderStep(i, i.category === 'Spot Treatment', i.is_prescription, i.zone === 'Back')).join('')}
          </div>
          <button class="btn plum full mt-4 btn-seal" data-rite="pm">Seal the Closing Rite</button>
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

  document.querySelectorAll('.btn-seal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.textContent = 'Rite Sealed';
      e.target.classList.replace('plum', 'g');
      e.target.disabled = true;
    });
  });
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
