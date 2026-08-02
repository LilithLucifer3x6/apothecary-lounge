import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';

export async function render(container) {
  container.innerHTML = `
    <div style="padding:1rem; max-width:900px; margin:0 auto;">
      <h2 style="font-family:'Pinyon Script', cursive; font-size:2.5rem; text-align:center; color:var(--parch);">The Shadow Tome</h2>
      
      <div class="card mt-4">
        <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
        <div class="note mb-4">"The ink is your own. Nothing written here is read by any other part of this place."</div>
        
        <div class="field">
          <label>The Mood</label>
          <div class="chips" id="tome-moods">
            <div class="chip" data-val="serene">Serene</div>
            <div class="chip" data-val="heavy">Heavy</div>
            <div class="chip" data-val="restless">Restless</div>
            <div class="chip" data-val="tender">Tender</div>
            <div class="chip" data-val="fierce">Fierce</div>
            <div class="chip" data-val="grounded">Grounded</div>
            <div class="chip" data-val="raw">Raw</div>
            <div class="chip" data-val="weary">Weary</div>
          </div>
        </div>
        
        <div class="field mt-4">
          <label>The Entry</label>
          <div class="ip mic" style="height:auto;">
            <textarea id="tome-entry" rows="6" style="width:100%; background:transparent; border:none; color:var(--white); font-family:'IM Fell English', serif; font-size:1.1rem; padding:0.5rem; resize:vertical; outline:none;" placeholder="Inscribe your thoughts..."></textarea>
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

  // Mood chips
  document.querySelectorAll('#tome-moods .chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.target.classList.toggle('active');
    });
  });

  // Save entry
  document.getElementById('btn-save-tome').addEventListener('click', async () => {
    const text = document.getElementById('tome-entry').value;
    const moods = Array.from(document.querySelectorAll('#tome-moods .chip.active')).map(c => c.dataset.val);
    
    if (text || moods.length > 0) {
      await supabase.from('journal_entries').insert([{
        user_id: 'default-user',
        entry_text: text,
        mood_tags: moods
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
      inst.textContent = '';
      return;
    }
    
    isBreathing = true;
    btnBreath.textContent = 'End Breathwork';
    
    async function cycle() {
      if (!isBreathing) return;
      
      // Inhale 4s
      inst.textContent = 'Inhale...';
      circle.style.transition = 'transform 4s ease-in-out';
      circle.style.transform = 'scale(2)';
      await new Promise(r => setTimeout(r, 4000));
      
      if (!isBreathing) return;
      // Hold 7s
      inst.textContent = 'Hold...';
      circle.style.transition = 'none';
      await new Promise(r => setTimeout(r, 7000));
      
      if (!isBreathing) return;
      // Exhale 8s
      inst.textContent = 'Exhale...';
      circle.style.transition = 'transform 8s ease-in-out';
      circle.style.transform = 'scale(1)';
      await new Promise(r => setTimeout(r, 8000));
      
      if (isBreathing) cycle();
    }
    
    cycle();
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
        ${entry.mood_tags?.length ? `<div class="mb-2" style="color:var(--rose); font-size:0.9rem;">${entry.mood_tags.join(' &bull; ')}</div>` : ''}
        <div style="font-family:'IM Fell English', serif; font-size:1.1rem; line-height:1.5;">${entry.entry_text}</div>
      </div>
    `).join('');
  }
  
  loadHistory();
}
