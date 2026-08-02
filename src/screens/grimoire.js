import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';

export function render(container) {
  // Generate basic calendar data
  const d = new Date();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  
  let calHTML = '';
  for(let i=1; i<=daysInMonth; i++) {
    const isToday = i === d.getDate() ? 'today' : '';
    const hasEvent = i % 5 === 0 ? `<div class="ce" title="Root Weaving">${ic(G.tabAltars)}</div>` : '';
    calHTML += `<div class="cd ${isToday}">${i}${hasEvent}</div>`;
  }

  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Grimoire</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Turning Week ${speakerMarkup('The Turning Week')}</h3>
        <div class="mt mb-4">Rhythms and cycles.</div>
        
        <div class="wheel">
          <div class="d"><div class="dn">Mon</div><div class="tg">${ic(G.tabAltars)}</div></div>
          <div class="d"><div class="dn">Tue</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Wed</div><div class="tg">${ic(G.tabGrim)}</div></div>
          <div class="d"><div class="dn">Thu</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Fri</div><div class="tg">${ic(G.tabPool)}</div></div>
          <div class="d"><div class="dn">Sat</div><div class="tg"></div></div>
          <div class="d"><div class="dn">Sun</div><div class="tg">${ic(G.tabRites)}</div></div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Almanac ${speakerMarkup('The Almanac')}</h3>
        <div class="mt mb-4">The long count.</div>
        
        <div class="cal">
          <div class="ch">S</div><div class="ch">M</div><div class="ch">T</div><div class="ch">W</div><div class="ch">T</div><div class="ch">F</div><div class="ch">S</div>
          <!-- offset for 1st of month (simplification) -->
          <div></div><div></div><div></div>
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
              <div class="nm">Root Weaving</div>
              <div class="mt">Every 8 weeks. Last kept 3 weeks ago.</div>
            </div>
            <button class="btn sm plum">Kept</button>
          </div>
          <div class="row">
            <div style="flex:1;">
              <div class="nm">Talon Honing</div>
              <div class="mt">Every 2 weeks. Last kept 12 days ago.</div>
            </div>
            <button class="btn sm">Draw one</button>
          </div>
          <div class="row">
            <div style="flex:1;">
              <div class="nm">Soaking</div>
              <div class="mt">Every 2 weeks. Last kept 5 days ago.</div>
            </div>
            <button class="btn sm">Kept</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
