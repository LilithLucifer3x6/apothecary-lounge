import { go } from '../main.js';
import { getAvatarConfig, generateAvatarSVG } from '../lib/avatar.js';
import { render as renderIntake } from './intake.js';

export function render(container) {
  const avatarConfig = getAvatarConfig();

  function drawCottage() {
    return `
      <!-- AI-Generated 2D Cartoon Background -->
      <image href="/assets/cottage_room.jpg" width="520" height="340" preserveAspectRatio="xMidYMid slice" />
      
      <!-- Dynamic SVG Avatar Overlay -->
      <g transform="translate(196,152) scale(0.7)">
        ${generateAvatarSVG(avatarConfig)}
      </g>
      
      <!-- Familiar -->
      <defs>
        <clipPath id="landingFamClip"><circle cx="316" cy="266" r="22"/></clipPath>
      </defs>
      <circle cx="316" cy="266" r="24" fill="#1a1110"/>
      <image href="/assets/${avatarConfig.fam}" x="294" y="244" width="44" height="44" clip-path="url(#landingFamClip)"/>
    `;
  }

  container.innerHTML = `
    <div class="land">
      <div class="scene"><svg id="cottage" viewBox="0 0 520 340" width="100%">${drawCottage()}</svg></div>
      <h1 style="font-family:'Pinyon Script', cursive; font-size:3.1em; margin:.7rem 0 .1rem; color:var(--parch);">The Apothecary Lounge</h1>
      <div class="tag" style="font-family:'Cormorant Garamond', serif; font-style:italic; color:var(--silver); font-size:1.06em; margin-bottom:1.2rem;">a place to keep the work of caring for yourself</div>
      <button class="btn plum" id="btn-cross">Cross the Threshold</button>
    </div>
  `;

  document.getElementById('btn-cross').addEventListener('click', () => {
    renderIntake(document.getElementById('s-ins'));
    go('s-ins');
  });
}
