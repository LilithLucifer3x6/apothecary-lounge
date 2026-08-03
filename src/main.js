import '../design-tokens.css';
import '@phosphor-icons/web/src/duotone/style.css';

import { supabase } from './lib/supabase.js';
import { ic, G, cor, verifyGlyphs } from './lib/icons.js';

import { render as renderAvatar } from './screens/avatar-builder.js';
import { render as renderLanding } from './screens/landing.js';
import { render as renderIntake } from './screens/intake.js';
import { render as renderRites } from './screens/rites.js';
import { render as renderGrimoire } from './screens/grimoire.js';
import { render as renderAltars } from './screens/altars.js';
import { render as renderRootwork } from './screens/rootwork.js';
import { render as renderScrying } from './screens/scrying.js';
import { render as renderShadowTome } from './screens/shadow-tome.js';

const TABS = [
  { id: 'rites', label: 'The Mortal Rites', glyph: G.tabRites, render: renderRites },
  { id: 'grim', label: 'The Grimoire', glyph: G.tabGrim, render: renderGrimoire },
  { id: 'altars', label: 'The Altars', glyph: G.tabAltars, render: renderAltars },
  { id: 'root', label: 'The Rootwork', glyph: G.tabRoot, render: renderRootwork },
  { id: 'pool', label: 'The Scrying Pool', glyph: G.tabPool, render: renderScrying },
  { id: 'tome', label: 'The Shadow Tome', glyph: G.tabTome, render: renderShadowTome }
];

let currentScreen = null;

function buildAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="s-av" class="land" style="display: none;"></div>
    <div id="s-land" class="land" style="display: none;"></div>
    <div id="s-ins" class="land" style="display: none;"></div>
    
    <div id="s-app" style="display: none;">
      <div class="topbar">
        <div class="brand">The Apothecary Lounge</div>
        <div class="datemark" id="top-date"></div>
        <button id="btn-settings" class="btn sm" title="Settings">${ic(G.settings)}</button>
      </div>
      <div class="tabs" id="app-tabs"></div>
      <div id="main-content"></div>
    </div>
    
    <div id="setmodal" class="modal" style="display:none;">
      <div class="modal-content card">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h2>Settings</h2>
        <div class="mt">Adjust the chamber's atmosphere.</div>
        <div class="field">
          <label>Font Size</label>
          <input type="range" id="setting-fontsize" min="14" max="24" value="16">
        </div>
        <div class="field">
          <label>Typeface</label>
          <select id="setting-font">
            <option value="IM Fell English">IM Fell English</option>
            <option value="Cormorant Garamond">Cormorant Garamond</option>
            <option value="system-ui">System</option>
          </select>
        </div>
        <div class="field">
          <label>Voice (TTS)</label>
          <input type="checkbox" id="setting-tts"> Enable Voice
        </div>
        <div class="field mt-4">
          <label>Integrations</label>
          <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;">
            <label><input type="checkbox" id="setting-health"> Android Health Connect</label>
            <label><input type="checkbox" id="setting-cal"> Google Calendar</label>
          </div>
        </div>
        <button id="btn-close-settings" class="btn mt-4">Close</button>
      </div>
    </div>
  `;

  // Render Tabs
  const tabsContainer = document.getElementById('app-tabs');
  tabsContainer.innerHTML = TABS.map(t => `
    <button class="tb" data-target="${t.id}" title="${t.label}">
      ${ic(t.glyph)}
      <span>${t.label}</span>
    </button>
  `).join('');

  // Tab switching
  document.querySelectorAll('.tb').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tb').forEach(b => b.classList.remove('active'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active');
      const targetId = targetBtn.getAttribute('data-target');
      
      const tab = TABS.find(t => t.id === targetId);
      if (tab) {
        tab.render(document.getElementById('main-content'));
      }
    });
  });

  // Settings Modal
  const modal = document.getElementById('setmodal');
  const btnSet = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings');
  
  const fontSizeInput = document.getElementById('setting-fontsize');
  const fontSelect = document.getElementById('setting-font');
  const ttsCheckbox = document.getElementById('setting-tts');
  const healthCheckbox = document.getElementById('setting-health');
  const calCheckbox = document.getElementById('setting-cal');

  // Load Settings
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{"fontSize":"16","fontFamily":"IM Fell English","tts":false,"health":false,"cal":false}');
  fontSizeInput.value = settings.fontSize;
  fontSelect.value = settings.fontFamily;
  ttsCheckbox.checked = settings.tts;
  healthCheckbox.checked = settings.health;
  calCheckbox.checked = settings.cal;

  applySettings(settings);

  btnSet.addEventListener('click', () => modal.style.display = 'block');
  btnClose.addEventListener('click', () => {
    modal.style.display = 'none';
    const newSettings = {
      fontSize: fontSizeInput.value,
      fontFamily: fontSelect.value,
      tts: ttsCheckbox.checked,
      health: healthCheckbox.checked,
      cal: calCheckbox.checked
    };
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    applySettings(newSettings);
  });

  // Update date
  document.getElementById('top-date').textContent = getRitualDate();
}

function applySettings(settings) {
  document.documentElement.style.setProperty('--base-font-size', settings.fontSize + 'px');
  document.documentElement.style.setProperty('--font-body', \`"\${settings.fontFamily}", serif\`);
  
  if (settings.tts) {
    document.body.classList.remove('tts-disabled');
  } else {
    document.body.classList.add('tts-disabled');
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

export function go(screenId) {
  document.querySelectorAll('#app > div:not(#setmodal)').forEach(el => el.style.display = 'none');
  const target = document.getElementById(screenId);
  if (target) target.style.display = 'block';
}

async function start() {
  verifyGlyphs();
  buildAppShell();

  // Check auth/intake status
  const { data: profile, error } = await supabase.from('user_profile').select('*').maybeSingle();
  if (error) console.error("Profile fetch error:", error);
  
  if (!profile) {
    const avContainer = document.getElementById('s-av');
    renderAvatar(avContainer);
    go('s-av');
  } else if (!profile.intake_completed) {
    const insContainer = document.getElementById('s-ins');
    renderIntake(insContainer);
    go('s-ins');
  } else {
    go('s-app');
    // Click first tab
    document.querySelector('.tb[data-target="rites"]')?.click();
  }
}

document.addEventListener('DOMContentLoaded', start);
