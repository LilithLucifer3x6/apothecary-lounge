import { go } from '../main.js';
import { generateAvatarSVG, AVO, getAvatarConfig } from '../lib/avatar.js';
import { render as renderLanding } from './landing.js';

export function render(container) {
  container.innerHTML = `
  <main style="padding-top:1.5rem;">
    <div class="card">
      <span class="corner tl">❧</span><span class="corner tr">☙</span><span class="corner bl">☙</span><span class="corner br">❧</span>
      <h2 class="t" style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">Who Keeps This Place?</h2>
      <div class="flourish">✦ ☾ ✦</div>
      <div style="display:flex;justify-content:center;margin-bottom:1rem;">
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
    renderLanding(document.getElementById('s-land'));
    go('s-land');
  });
}
