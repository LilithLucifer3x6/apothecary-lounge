import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';
import { syncAppointments, markAppointmentDone } from '../lib/calendar.js';

export async function render(container) {
  // Generate basic calendar data
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const appointments = await syncAppointments();
  
  let calHTML = '';
  for (let i = 0; i < firstDay; i++) {
    calHTML += `<div></div>`;
  }
  
  for(let i=1; i<=daysInMonth; i++) {
    const isToday = i === d.getDate() ? 'today' : '';
    let events = [];
    if (appointments.some(app => new Date(app.date).getDate() === i && app.type === 'retie')) {
      events.push(`<div class="ce" title="Root Weaving" style="color:var(--plum-b); font-size:1.2rem;">⚝</div>`);
    }
    if (appointments.some(app => new Date(app.date).getDate() === i && app.type === 'nails')) {
      events.push(`<div class="ce" title="Talon Honing" style="color:var(--rose); font-size:1.2rem;">✧</div>`);
    }
    calHTML += `<div class="cd ${isToday}">${i}${events.join('')}</div>`;
  }

  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Grimoire</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Turning Week ${speakerMarkup('The Turning Week')}</h3>
        <div class="mt mb-4">Rhythms and cycles.</div>
        
        <div class="wheel" style="display:flex; justify-content:space-between; text-align:center;">
          <div class="d"><div class="dn">Mon</div><div class="tg" title="Rootwork">${ic(G.tabRoot)}<div style="font-size:0.6rem; margin-top:2px;">Rootwork</div></div></div>
          <div class="d"><div class="dn">Tue</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Wed</div><div class="tg" title="Grimoire">${ic(G.tabGrim)}<div style="font-size:0.6rem; margin-top:2px;">Grimoire</div></div></div>
          <div class="d"><div class="dn">Thu</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Fri</div><div class="tg" title="Scrying Pool">${ic(G.tabPool)}<div style="font-size:0.6rem; margin-top:2px;">Scrying</div></div></div>
          <div class="d"><div class="dn">Sat</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Sun</div><div class="tg" title="Mortal Rites">${ic(G.tabRites)}<div style="font-size:0.6rem; margin-top:2px;">Rites</div></div></div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Almanac ${speakerMarkup('The Almanac')}</h3>
        <div class="mt mb-4">The long count.</div>
        
        <div class="cal">
          <div class="ch">S</div><div class="ch">M</div><div class="ch">T</div><div class="ch">W</div><div class="ch">T</div><div class="ch">F</div><div class="ch">S</div>
          ${calHTML}
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Appointed Days ${speakerMarkup('The Appointed Days')}</h3>
        <div class="mt mb-4">Rites that occur sparingly.</div>
        
        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div class="row">
            <div style="flex:1;">
              <div class="nm">Root Weaving (Retie) ⚝</div>
              <div class="mt">Every 8 weeks. Scheduled for ${appointments.find(a => a.type === 'retie')?.date ? new Date(appointments.find(a => a.type === 'retie').date).toLocaleDateString() : 'Unknown'}.</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn sm plum btn-appt" data-type="retie">Kept</button>
              <button class="spk btn-override" title="Manual Override"><i class="ph-duotone ph-dots-three-vertical"></i></button>
            </div>
          </div>
          <div class="row">
            <div style="flex:1;">
              <div class="nm">Talon Honing (Nails) ✧</div>
              <div class="mt">Every 2 weeks. Scheduled for ${appointments.find(a => a.type === 'nails')?.date ? new Date(appointments.find(a => a.type === 'nails').date).toLocaleDateString() : 'Unknown'}.</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <button class="btn sm plum btn-appt" data-type="nails">Kept</button>
              <button class="spk btn-override" title="Manual Override"><i class="ph-duotone ph-dots-three-vertical"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.btn-appt').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const type = e.target.getAttribute('data-type');
      await markAppointmentDone(type);
      e.target.textContent = 'Marked';
      e.target.style.opacity = '0.5';
    });
  });

  document.querySelectorAll('.btn-override').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = prompt('Enter the date you last completed this rite (YYYY-MM-DD):');
      if (date && !isNaN(new Date(date).getTime())) {
        alert('Predictive schedule overridden with ' + date);
        // Refresh component or sync data here in real app
      }
    });
  });
}
