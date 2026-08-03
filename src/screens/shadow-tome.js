import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';
import * as AI from '../lib/ai-service.js';
import { getReadiness } from '../lib/health-connect.js';

export async function render(container) {
  const settingsStr = localStorage.getItem('app_settings');
  const settings = settingsStr ? JSON.parse(settingsStr) : {};
  let readinessMarkup = '';
  if (settings.health) {
    const readiness = await getReadiness();
    readinessMarkup = `
      <div style="margin-top:1rem; padding:1rem; background:var(--card3); border-radius:8px; display:flex; align-items:center; gap:1rem;">
        <div style="font-size:2rem; font-family:'IM Fell English', serif;">${readiness.score}</div>
        <div>
          <div style="font-weight:bold; color:var(--gold);">Readiness: ${readiness.state.charAt(0).toUpperCase() + readiness.state.slice(1)}</div>
          <div style="font-size:0.9rem; color:var(--dim);">Data from Android Health Connect</div>
        </div>
      </div>
    `;
  } else {
    readinessMarkup = `
      <div style="margin-top:1rem; padding:1rem; background:rgba(17,14,21,0.5); border:1px dashed var(--border); border-radius:8px; display:flex; align-items:center; justify-content:center; gap:1rem; color:var(--dim);">
        Enable Health Connect in Settings to divine your physical readiness.
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Shadow Tome</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Inner Sanctum</h3>
        <div class="note mb-4">"The ink is your own. Nothing written here is read by any other part of this place."</div>
        
        ${readinessMarkup}
        
        <div class="field">
          <label>The Mood</label>
          <div class="chips" id="tome-moods">
            <div style="opacity:0.5;">Divining moods...</div>
          </div>
        </div>
        
        <div class="field mt-4">
          <label>The Entry</label>
          <div class="ip mic" style="height:auto;">
            <textarea id="tome-entry" rows="12" style="width:100%; min-height:200px; background:transparent; border:none; color:var(--white); font-family:'IM Fell English', serif; font-size:1.1rem; padding:0.5rem; resize:vertical; outline:none;" placeholder="Inscribe your thoughts..."></textarea>
          </div>
        </div>
        
        <div style="text-align:right; margin-top:1rem;">
          <button id="btn-save-tome" class="btn plum">Seal the Page</button>
        </div>
      </div>

      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <h3>The Breathing Space</h3>
        <div class="mt mb-4">Inhale 4s &bull; Hold 7s &bull; Exhale 8s</div>
        
        <div style="display:flex; flex-direction:column; align-items:center; gap:2rem; padding:2rem 0;">
          <div id="breath-circle" style="width:100px; height:100px; border-radius:50%; border:2px solid var(--plum); transition: all 1s linear;"></div>
          <button id="btn-breath" class="btn">Begin Breathwork</button>
          <div id="breath-inst" style="font-family:'Cormorant Garamond', serif; font-size:1.5rem; color:var(--rose); height:2rem;"></div>
        </div>
      </div>
      
      <div id="tome-history" class="mt-4">
        <!-- History rendered here -->
      </div>
    </div>
  `;

  attachVoice();

  AI.generateMoods().then(list => {
    document.getElementById('tome-moods').innerHTML = list.map(m => `<div class="chip" data-val="${m.id}">${m.label}</div>`).join('');
    document.querySelectorAll('#tome-moods .chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.target.classList.toggle('active');
      });
    });
  });

  // Save entry
  document.getElementById('btn-save-tome').addEventListener('click', async () => {
    const text = document.getElementById('tome-entry').value;
    const moods = Array.from(document.querySelectorAll('#tome-moods .chip.active')).map(c => c.dataset.val);
    
    if (text || moods.length > 0) {
      await supabase.from('journal_entries').insert([{
        body_text: text,
        moods: moods
      }]);
      
      document.getElementById('tome-entry').value = '';
      document.querySelectorAll('#tome-moods .chip').forEach(c => c.classList.remove('active'));
      loadHistory();
    }
  });

  // Breathing Space
  let breathInterval;
  const btnBreath = document.getElementById('btn-breath');
  const circle = document.getElementById('breath-circle');
  const inst = document.getElementById('breath-inst');
  let isBreathing = false;

  btnBreath.addEventListener('click', () => {
    if (isBreathing) {
      clearInterval(breathInterval);
      isBreathing = false;
      btnBreath.textContent = 'Begin Breathwork';
      circle.style.transform = 'scale(1)';
      circle.style.borderColor = 'var(--plum)';
      inst.textContent = '';
      return;
    }
    
    isBreathing = true;
    btnBreath.textContent = 'End Breathwork';
    
    function breathCycle() {
      if (!isBreathing) return;
      
      // Inhale 4s
      inst.textContent = 'Inhale deeply...';
      circle.style.transition = 'transform 4s ease-in-out, border-color 4s ease';
      circle.style.transform = 'scale(2.5)';
      circle.style.borderColor = 'var(--rose)';
      
      // Hold 7s
      setTimeout(() => {
        if (!isBreathing) return;
        inst.textContent = 'Hold the breath...';
      }, 4000);
      
      // Exhale 8s
      setTimeout(() => {
        if (!isBreathing) return;
        inst.textContent = 'Exhale slowly...';
        circle.style.transition = 'transform 8s ease-in-out, border-color 8s ease';
        circle.style.transform = 'scale(1)';
        circle.style.borderColor = 'var(--plum)';
      }, 11000);
    }
    
    breathCycle();
    breathInterval = setInterval(breathCycle, 19000); // 4 + 7 + 8
  });

  async function loadHistory() {
    const { data } = await supabase.from('journal_entries').select('*').order('created_at', { ascending: false }).limit(5);
    const hist = document.getElementById('tome-history');
    if (!data || data.length === 0) {
      hist.innerHTML = '<div class="empty">No pages have been inscribed.</div>';
      return;
    }
    
    hist.innerHTML = data.map(entry => `
      <div class="card mb-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <div class="mt mb-2">${new Date(entry.created_at).toLocaleDateString()}</div>
        ${entry.moods?.length ? `<div class="mb-2" style="color:var(--rose); font-size:0.9rem;">${entry.moods.join(' &bull; ')}</div>` : ''}
        <div style="font-family:'IM Fell English', serif; font-size:1.1rem; line-height:1.5;">${entry.body_text}</div>
      </div>
    `).join('');
  }
  
  loadHistory();
}
