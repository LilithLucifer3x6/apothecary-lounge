import { go } from '../main.js';
import { generateAvatarSVG, AVO, getAvatarConfig } from '../lib/avatar.js';
import { render as renderLanding } from './landing.js';

export function render(container) {
  container.innerHTML = `
  <!-- Cottage Background Immersion -->
  <div style="position:absolute; inset:0; z-index:-1; overflow:hidden;">
    <img src="/assets/cottage_room.jpg" style="width:100%; height:100%; object-fit:cover; filter:blur(4px) brightness(0.5);" />
  </div>
  <main style="padding-top:1.5rem;">
    <div class="card" style="background:transparent; box-shadow:none; border:none; padding:0;">
      <h2 class="t" style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">Who Keeps This Place?</h2>
      <div class="flourish">✧ ✦ ✧</div>
      
      <div class="scene" style="background:transparent; box-shadow:none; border:none; margin-bottom:1rem; position:relative;">
        <svg id="avsvg" viewBox="0 0 150 195" width="170" height="220"></svg>
      </div>
      <div id="avopts"></div>
      <button class="btn full plum" id="btn-save-av">The Keeper stands ready</button>
    </div>
  </main>
  `;

  let currentConfig = getAvatarConfig();

  function drawAv() {
    document.getElementById('avsvg').innerHTML = 
      `<ellipse cx="75" cy="184" rx="42" ry="7" fill="#000" opacity=".45"/>` + 
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
