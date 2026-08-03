
import { go } from '../main.js';
import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';
import { attachVoice } from '../lib/voice.js';

export function render(container) {
  container.innerHTML = `
    <div class="card" style="max-width:600px; margin: 2rem auto;">
      <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
      <h2 style="text-align:center; font-family:'Pinyon Script', cursive; font-size:2.5rem; color:var(--parch);">Who Keeps This Place?</h2>
      
      <div style="display:flex; gap:2rem; flex-wrap:wrap; margin-top:2rem;">
        <div style="flex:1; min-width:200px;">
          <svg id="av-preview" viewBox="0 0 150 195" style="width:100%; max-width:200px; background:var(--card2); border:1px solid var(--border); border-radius:8px;">
            <!-- Rendered via JS -->
          </svg>
        </div>
        <div style="flex:2; min-width:300px;">
          <div class="field">
            <label class="fl">The Skin ${speakerMarkup('The Skin')}</label>
            <select id="av-skin">
              <option value="#5c3a21">Deep Chestnut</option>
              <option value="#4a2a18">Dark Mahogany</option>
              <option value="#3b1f0f">Espresso</option>
              <option value="#7c4f35">Warm Copper</option>
            </select>
          </div>
          <div class="field">
            <label class="fl">The Crown ${speakerMarkup('The Crown')}</label>
            <select id="av-hair">
              <option value="shoulder">Shoulder Locs</option>
              <option value="waist">Waist-Length Locs</option>
              <option value="buns">Twin Buns</option>
              <option value="updo">Crown Updo</option>
              <option value="short">Short Locs</option>
              <option value="wrapped">Wrapped</option>
            </select>
          </div>
          <div class="field">
            <label class="fl">The Gaze ${speakerMarkup('The Gaze')}</label>
            <select id="av-eyes">
              <option value="#c4243a">Red Cat (Default)</option>
              <option value="#b8860b">Amber</option>
              <option value="#8a2be2">Violet</option>
              <option value="#50c878">Emerald</option>
              <option value="#c0c0c0">Silver</option>
            </select>
          </div>
          <div class="field">
            <label class="fl">The Garment ${speakerMarkup('The Garment')}</label>
            <select id="av-garment">
              <option value="#5a0a10">Crimson</option>
              <option value="#3a1148">Plum</option>
              <option value="#0a0810">Obsidian</option>
              <option value="#b9bcc4">Silver</option>
              <option value="#3d4438">Forest</option>
            </select>
          </div>
          <div class="field">
            <label class="fl">The Familiar ${speakerMarkup('The Familiar')}</label>
            <select id="av-familiar">
              <option value="cat">Black Cat</option>
              <option value="raven">Raven</option>
              <option value="toad">Toad</option>
              <option value="moth">Moth</option>
              <option value="snake">Snake</option>
            </select>
          </div>
        </div>
      </div>
      
      <div style="margin-top:2rem; text-align:right;">
        <button id="btn-save-av" class="btn plum">The Keeper stands ready</button>
      </div>
    </div>
  `;

  const skinSel = document.getElementById('av-skin');
  const hairSel = document.getElementById('av-hair');
  const eyesSel = document.getElementById('av-eyes');
  const garmentSel = document.getElementById('av-garment');
  const familiarSel = document.getElementById('av-familiar');
  const preview = document.getElementById('av-preview');

  function updatePreview() {
    const skin = skinSel.value;
    const hair = hairSel.value;
    const eyes = eyesSel.value;
    const garment = garmentSel.value;
    const familiar = familiarSel.value;

    let hairSVG = '';
    if (hair === 'shoulder') {
      hairSVG = `<path d="M 45 40 Q 30 70 40 100 Q 50 110 50 80 Z M 105 40 Q 120 70 110 100 Q 100 110 100 80 Z" fill="#111" stroke="#222" stroke-width="2"/>`;
    } else if (hair === 'waist') {
      hairSVG = `<path d="M 45 40 Q 20 90 35 150 Q 50 140 50 80 Z M 105 40 Q 130 90 115 150 Q 100 140 100 80 Z" fill="#111" stroke="#222" stroke-width="2"/>`;
    } else if (hair === 'buns') {
      hairSVG = `<circle cx="45" cy="40" r="20" fill="#111" /><circle cx="105" cy="40" r="20" fill="#111" />`;
    } else if (hair === 'updo') {
      hairSVG = `<ellipse cx="75" cy="20" rx="30" ry="20" fill="#111" />`;
    } else if (hair === 'short') {
      hairSVG = `<path d="M 50 40 Q 75 10 100 40 Q 75 25 50 40 Z" fill="#111" stroke="#222" stroke-width="2" />`;
    } else if (hair === 'wrapped') {
      hairSVG = `<path d="M 40 50 Q 75 0 110 50 Z" fill="${garment}" />`;
    }

    let familiarSVG = '';
    if (familiar === 'cat') {
      familiarSVG = `<path d="M 120 160 Q 125 140 135 150 L 140 160 Z" fill="#111"/><circle cx="128" cy="152" r="2" fill="var(--gold)"/>`;
    } else if (familiar === 'raven') {
      familiarSVG = `<path d="M 120 150 L 135 140 L 140 160 Z" fill="#111"/>`;
    } else if (familiar === 'toad') {
      familiarSVG = `<ellipse cx="130" cy="170" rx="10" ry="8" fill="#3d4438"/>`;
    } else if (familiar === 'moth') {
      familiarSVG = `<path d="M 120 140 L 130 130 L 140 140 L 130 150 Z" fill="var(--silver)"/>`;
    } else if (familiar === 'snake') {
      familiarSVG = `<path d="M 120 170 Q 130 160 140 170 Q 135 180 120 175" fill="#3d4438" stroke="var(--gold)" stroke-width="1"/>`;
    }

    preview.innerHTML = `
      <!-- Background / Base -->
      <rect width="150" height="195" fill="var(--card2)" />
      
      <!-- Hair Back -->
      ${hairSVG}

      <!-- Body / Garment -->
      <path d="M 40 100 C 40 90, 110 90, 110 100 L 140 195 L 10 195 Z" fill="${garment}" />
      
      <!-- Head / Skin -->
      <circle cx="75" cy="65" r="30" fill="${skin}" />
      <path d="M 65 90 L 75 110 L 85 90 Z" fill="${skin}" /> <!-- Neck -->

      <!-- Eyes -->
      <circle cx="62" cy="60" r="4" fill="${eyes}" />
      <circle cx="88" cy="60" r="4" fill="${eyes}" />
      <!-- Slit pupils for default red cat eyes, else round -->
      ${eyes === '#c4243a' ? `
        <ellipse cx="62" cy="60" rx="1" ry="3" fill="#000" />
        <ellipse cx="88" cy="60" rx="1" ry="3" fill="#000" />
      ` : `
        <circle cx="62" cy="60" r="2" fill="#000" />
        <circle cx="88" cy="60" r="2" fill="#000" />
      `}
      
      <!-- Familiar -->
      ${familiarSVG}
    `;
  }

  [skinSel, hairSel, eyesSel, garmentSel, familiarSel].forEach(el => {
    el.addEventListener('change', updatePreview);
  });

  updatePreview();

  document.getElementById('btn-save-av').addEventListener('click', async () => {
    const prefs = {
      skin: skinSel.value,
      hair: hairSel.value,
      eyes: eyesSel.value,
      garment: garmentSel.value,
      familiar: familiarSel.value
    };
    
    localStorage.setItem('avatar_config', JSON.stringify(prefs));
    
    go('s-land');
  });
}
