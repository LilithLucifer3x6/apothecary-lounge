
import { go } from '../main.js';
import { ic, G } from '../lib/icons.js';
import { speakerMarkup } from '../lib/tts.js';
import { attachVoice } from '../lib/voice.js';
import { generateAvatarSVG } from '../lib/avatar.js';

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

    preview.innerHTML = `
      <!-- Background / Base -->
      <rect width="150" height="195" fill="var(--card2)" />
      ${generateAvatarSVG({ skin, hair, eyes, garment, familiar }, 1)}
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
