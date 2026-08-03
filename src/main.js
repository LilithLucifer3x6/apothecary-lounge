import '../design-tokens.css';

import { supabase } from './lib/supabase.js';
import { ic, G, cor, verifyGlyphs } from './lib/icons.js';

import { getAvatarConfig, generateAvatarSVG } from './lib/avatar.js';
import { getTtsEnabled, getTtsRate, getTtsPitch, getTtsVoiceURI, setTtsEnabled, setTtsRate, setTtsPitch, setTtsVoiceURI, getFeminineVoices } from './lib/tts.js';
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
  { id: 'rites', label: 'The Mortal Rites', glyph: G.tabRites, render: renderRites, bg: '/assets/room_land.jpg', pose: 'working' },
  { id: 'grim', label: 'The Grimoire', glyph: G.tabGrim, render: renderGrimoire, bg: '/assets/room_grim.jpg', pose: 'reading' },
  { id: 'altars', label: 'The Altars', glyph: G.tabAltars, render: renderAltars, bg: '/assets/room_altars.jpg', pose: 'meditating' },
  { id: 'root', label: 'The Rootwork', glyph: G.tabRoot, render: renderRootwork, bg: '/assets/room_root.jpg', pose: 'working' },
  { id: 'pool', label: 'The Scrying Pool', glyph: G.tabPool, render: renderScrying, bg: '/assets/room_pool.jpg', pose: 'scrying' },
  { id: 'tome', label: 'The Shadow Tome', glyph: G.tabTome, render: renderShadowTome, bg: '/assets/room_tome.jpg', pose: 'reading' }
];

let currentScreen = null;

export function setRoomBackground(bgUrl) {
  document.body.style.backgroundImage = `url('${bgUrl}')`;
}

function buildAppShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div id="s-splash" class="land" style="display: none;">
      <h1 style="text-shadow: 0 0 20px rgba(0,0,0,0.8);">The Apothecary Lounge</h1>
      <div class="tag" style="text-shadow: 0 0 10px rgba(0,0,0,0.8);">A sanctuary of self-care.</div>
      <button id="btn-enter" class="btn" style="font-size:1.1rem; padding: 0.8rem 1.5rem; margin-top:2rem;">Approach the Cottage ➔</button>
      <button id="btn-reset" class="btn g sm" style="margin-top:2rem; font-size:0.7rem; opacity:0.6;">Reset Avatar</button>
    </div>
    <div id="s-av" class="land" style="display: none;"></div>
    <div id="s-land" class="land" style="display: none;"></div>
    <div id="s-ins" class="land" style="display: none;"></div>
    
    <div id="s-app" style="display: none; position: relative; min-height: 100vh;">
      <div style="position: relative; z-index: 5;">
        <div class="topbar">
          <div class="brand">The Apothecary Lounge</div>
          <div class="datemark" id="top-date"></div>
          <button id="btn-settings" class="btn sm" title="Settings">${ic(G.settings)}</button>
        </div>
        <div class="tabs" id="app-tabs"></div>
        <div id="main-content"></div>
      </div>
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
          <div id="tts-controls" style="display:none; margin-top:0.5rem; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.8rem;">Voice
              <select id="setting-tts-voice" style="width:100%; margin-top:0.2rem;"></select>
            </label>
            <label style="font-size:0.8rem;">Speed
              <input type="range" id="setting-tts-rate" min="0.5" max="2.0" step="0.1" value="1.0" style="width:100%;">
            </label>
            <label style="font-size:0.8rem;">Pitch
              <input type="range" id="setting-tts-pitch" min="0.5" max="2.0" step="0.1" value="1.0" style="width:100%;">
            </label>
          </div>
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
      document.querySelectorAll('.tb').forEach(b => b.classList.remove('active', 'on'));
      const targetBtn = e.currentTarget;
      targetBtn.classList.add('active', 'on');
      const targetId = targetBtn.getAttribute('data-target');
      
      const tab = TABS.find(t => t.id === targetId);
      if (tab) {
        setRoomBackground(tab.bg);
        tab.render(document.getElementById('main-content'), tab.pose);
      }
    });
  });

  document.getElementById('btn-enter').addEventListener('click', async () => {
    // Check auth/intake status on click
    const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
    
    if (profile && profile.avatar_config) {
      localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
    }

    let avatarConfigStr = localStorage.getItem('avatar_config');
    let avatarConfig = avatarConfigStr ? JSON.parse(avatarConfigStr) : null;
    
    if (avatarConfig && !avatarConfig.fam) {
      localStorage.removeItem('avatar_config');
      avatarConfig = null;
    }

    if (!profile && !avatarConfig) {
      setRoomBackground('/assets/room_dress.jpg');
      const avContainer = document.getElementById('s-av');
      renderAvatar(avContainer);
      go('s-av');
    } else if (!profile && avatarConfig) {
      setRoomBackground('/assets/room_land.jpg');
      const landContainer = document.getElementById('s-land');
      renderLanding(landContainer);
      go('s-land');
    } else if (profile && !profile.intake_completed) {
      setRoomBackground('/assets/room_land.jpg');
      const insContainer = document.getElementById('s-ins');
      renderIntake(insContainer);
      go('s-ins');
    } else {
      go('s-app');
      document.querySelector('.tb[data-target="rites"]')?.click();
    }
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    localStorage.removeItem('avatar_config');
    alert('Avatar data cleared! You can now approach the cottage to build a new one.');
  });

  // Settings Modal
  const modal = document.getElementById('setmodal');
  const btnSet = document.getElementById('btn-settings');
  const btnClose = document.getElementById('btn-close-settings');
  
  const fontSizeInput = document.getElementById('setting-fontsize');
  const fontSelect = document.getElementById('setting-font');
  
  const ttsCheckbox = document.getElementById('setting-tts');
  const ttsControls = document.getElementById('tts-controls');
  const ttsVoice = document.getElementById('setting-tts-voice');
  const ttsRate = document.getElementById('setting-tts-rate');
  const ttsPitch = document.getElementById('setting-tts-pitch');

  ttsCheckbox.checked = getTtsEnabled();
  ttsControls.style.display = getTtsEnabled() ? 'flex' : 'none';
  ttsRate.value = getTtsRate();
  ttsPitch.value = getTtsPitch();

  // Populate voices when they load
  function populateVoices() {
    const voices = getFeminineVoices();
    ttsVoice.innerHTML = voices.map(v => `<option value="${v.voiceURI}">${v.displayName}</option>`).join('');
    const currentUri = getTtsVoiceURI();
    if (currentUri && voices.some(v => v.voiceURI === currentUri)) {
      ttsVoice.value = currentUri;
    } else if (voices.length > 0) {
      ttsVoice.value = voices[0].voiceURI;
      setTtsVoiceURI(voices[0].voiceURI);
    }
  }
  
  if (window.speechSynthesis) {
    if (window.speechSynthesis.getVoices().length > 0) populateVoices();
    else window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  ttsCheckbox.addEventListener('change', (e) => {
    setTtsEnabled(e.target.checked);
    ttsControls.style.display = e.target.checked ? 'flex' : 'none';
  });
  ttsVoice.addEventListener('change', (e) => setTtsVoiceURI(e.target.value));
  ttsRate.addEventListener('input', (e) => setTtsRate(parseFloat(e.target.value)));
  ttsPitch.addEventListener('input', (e) => setTtsPitch(parseFloat(e.target.value)));
  
  const healthCheckbox = document.getElementById('setting-health');
  const calCheckbox = document.getElementById('setting-cal');

  // Load settings async in the background
  supabase.from('user_profile').select('*').maybeSingle().then(({ data: profile }) => {
    if (profile && profile.settings) {
      localStorage.setItem('app_settings', JSON.stringify(profile.settings));
    }
    if (profile && profile.avatar_config) {
      localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
    }
  });
  
  // Load Settings
  const settings = JSON.parse(localStorage.getItem('app_settings') || '{"fontSize":"16","fontFamily":"IM Fell English","tts":false,"health":false,"cal":false}');
  fontSizeInput.value = settings.fontSize || '16';
  fontSelect.value = settings.fontFamily || 'IM Fell English';
  healthCheckbox.checked = settings.health || false;
  calCheckbox.checked = settings.cal || false;
  if (settings.tts !== undefined) {
    ttsCheckbox.checked = settings.tts;
    setTtsEnabled(settings.tts);
  }

  applySettings(settings);

  healthCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      alert("Opening Android Health Connect permission flow...\\n(Simulated: Authorization granted to read Readiness Data)");
    }
  });

  calCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      alert("Opening Google Calendar OAuth flow...\\n(Simulated: Access granted to read/write Appointments)");
    }
  });

  btnSet.addEventListener('click', () => modal.style.display = 'block');
  btnClose.addEventListener('click', async () => {
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
    
    // Save to Supabase
    if (profile) {
      await supabase.from('user_profile').update({ settings: newSettings }).eq('id', profile.id);
    }
  });

  // Update date
  document.getElementById('top-date').textContent = getRitualDate();
  
  // Always boot to the splash screen
  setRoomBackground('/assets/app_bg.jpg');
  go('s-splash');
}

function applySettings(settings) {
  document.documentElement.style.setProperty('--fs', settings.fontSize + 'px');
  document.documentElement.style.setProperty('--ff', `"${settings.fontFamily}", serif`);
  
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
  
  // Always boot to the splash screen
  setRoomBackground('/assets/app_bg.jpg');
  go('s-splash');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
