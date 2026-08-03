import { go } from '../main.js';
import { generateAvatarSVG, AVO, getAvatarConfig } from '../lib/avatar.js';
import { render as renderLanding } from './landing.js';

export function render(container) {
  container.innerHTML = `
  <!-- Cottage Background Immersion -->
  <div style="position:absolute; inset:0; z-index:-1; overflow:hidden;">
    <img src="/assets/cottage_room.jpg" style="width:100%; height:100%; object-fit:cover; filter:blur(3px) brightness(0.6) contrast(1.2);" />
  </div>
  <main style="padding-top:2rem; min-height:100vh; display:flex; flex-direction:column; align-items:center;">
    <div style="width:100%; max-width:600px; padding:1.5rem; background:rgba(13,10,16,0.5); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,0.1); border-radius:16px; box-shadow:0 12px 38px rgba(0,0,0,0.9);">
      <h2 class="t" style="font-family:'Pinyon Script', cursive; font-size:3rem; text-align:center; color:var(--parch); margin-bottom:0;">Who Keeps This Place?</h2>
      <div class="flourish" style="margin-bottom:1.5rem;">✧ ✦ ✧</div>
      
      <div class="scene" style="background:transparent; box-shadow:none; border:none; margin-bottom:1.5rem; position:relative; overflow:visible;">
        <svg id="avsvg" viewBox="0 0 170 210" width="100%" height="260" style="overflow:visible;"></svg>
      </div>
      <div id="avopts" style="background:rgba(5,3,8,0.4); padding:1.5rem; border-radius:12px; border:1px solid rgba(255,255,255,0.05);"></div>
      <button class="btn full plum" id="btn-save-av" style="margin-top:1.5rem; font-size:1.1rem; padding:1rem;">The Keeper stands ready</button>
    </div>
  </main>
  `;

  let currentConfig = getAvatarConfig();

  function drawAv() {
    document.getElementById('avsvg').innerHTML = 
      `<ellipse cx="75" cy="190" rx="48" ry="8" fill="#000" opacity=".5" filter="blur(2px)"/>` + 
      generateAvatarSVG(currentConfig);
  }

  function renderOptions() {
    const optsContainer = document.getElementById('avopts');
    optsContainer.innerHTML = AVO.map(o => `
      <label class="fl">${o.l}</label>
      <div class="opts">
        ${o.v.map(v => `<button class="opt2${currentConfig[o.k] === v[0] ? ' on' : ''}" data-k="${o.k}" data-v="${v[0]}">${v[1]}</button>`).join('')}
      </div>
    `).join('');

    optsContainer.querySelectorAll('.opt2').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const k = e.target.getAttribute('data-k');
        const v = e.target.getAttribute('data-v');
        currentConfig[k] = v;
        
        Array.from(e.target.parentNode.children).forEach(c => c.classList.remove('on'));
        e.target.classList.add('on');
        
        drawAv();
      });
    });
  }

  drawAv();
  renderOptions();

  document.getElementById('btn-save-av').addEventListener('click', () => {
    localStorage.setItem('avatar_config', JSON.stringify(currentConfig));
    import('../main.js').then(({ setRoomBackground }) => setRoomBackground('/assets/room_land.jpg'));
    renderLanding(document.getElementById('s-land'));
    go('s-land');
  });
}
