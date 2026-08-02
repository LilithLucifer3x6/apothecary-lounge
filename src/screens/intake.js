import { supabase } from '../lib/supabase.js';
import { go } from '../main.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';
import { speakerMarkup } from '../lib/tts.js';

export function render(container) {
  container.innerHTML = `
    <div class="card" style="max-width:700px; margin: 2rem auto;">
      <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
      <h2 style="text-align:center; font-family:'Pinyon Script', cursive; font-size:2.5rem; color:var(--parch);">The First Inscription</h2>
      
      <div id="ins-steps">
        <!-- Step 1 -->
        <div class="ins-step" data-step="1">
          <h3>What brings you to this place? ${speakerMarkup('What brings you to this place?')}</h3>
          <div class="mt">Select all that weigh upon you.</div>
          <div class="chips" id="ins-concerns">
            <div class="chip" data-val="relaxation">Nothing — I came for the quiet</div>
            <div class="chip" data-val="acne">Acne</div>
            <div class="chip" data-val="scarring">Scarring</div>
            <div class="chip" data-val="dryness">Dryness</div>
            <div class="chip" data-val="oiliness">Oiliness</div>
            <div class="chip" data-val="hyperpigmentation">Hyperpigmentation</div>
            <div class="chip" data-val="sensitivity">Sensitivity</div>
            <div class="chip" data-val="sebopsoriasis">Sebopsoriasis</div>
            <div class="chip" data-val="eczema">Eczema</div>
            <div class="chip" data-val="rosacea">Rosacea</div>
            <div class="chip" data-val="aging">Aging</div>
            <div class="chip" data-val="texture">Texture</div>
            <div class="chip" data-val="dark_spots">Dark spots</div>
            <div class="chip" data-val="moisture">Moisture</div>
            <div class="chip" data-val="breakouts">Breakouts</div>
            <div class="chip" data-val="barrier_repair">Barrier repair</div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="ins-step" data-step="2" style="display:none;">
          <h3>What must the Lounge protect? ${speakerMarkup('What must the Lounge protect?')}</h3>
          <div class="mt">Conditions that shape how you care for yourself.</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;">
            <label><input type="checkbox" value="fibromyalgia" class="cond-chk"> Fibromyalgia</label>
            <label><input type="checkbox" value="arthritis" class="cond-chk"> Arthritis</label>
            <label><input type="checkbox" value="adhd" class="cond-chk"> ADHD</label>
            <label><input type="checkbox" value="chronic_pain" class="cond-chk"> Chronic Pain</label>
            <label><input type="checkbox" value="fatigue" class="cond-chk"> Chronic Fatigue</label>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="ins-step" data-step="3" style="display:none;">
          <h3>Name the Master Invocations ${speakerMarkup('Name the Master Invocations')}</h3>
          <div class="mt">Topical prescriptions.</div>
          <div id="rx-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
            <!-- Pre-filled Tretinoin -->
            <div class="card2" style="padding:1rem;">
              <div class="field">
                <label>Name</label>
                <div class="ip mic">
                  <input type="text" class="rx-name" value="Tretinoin">
                </div>
              </div>
              <div style="display:flex; gap:1rem;">
                <div class="field" style="flex:1;"><label>Strength</label><input type="text" class="rx-strength" value="0.05%"></div>
                <div class="field" style="flex:1;"><label>Zone</label><input type="text" class="rx-zone" value="Face"></div>
                <div class="field" style="flex:1;"><label>Frequency</label><input type="text" class="rx-freq" value="Nightly"></div>
              </div>
            </div>
            <!-- Pre-filled Tacrolimus -->
            <div class="card2" style="padding:1rem;">
              <div class="field">
                <label>Name</label>
                <div class="ip mic">
                  <input type="text" class="rx-name" value="Tacrolimus">
                </div>
              </div>
              <div style="display:flex; gap:1rem;">
                <div class="field" style="flex:1;"><label>Strength</label><input type="text" class="rx-strength" value="0.1%"></div>
                <div class="field" style="flex:1;"><label>Zone</label><input type="text" class="rx-zone" value="Face/Neck"></div>
                <div class="field" style="flex:1;"><label>Frequency</label><input type="text" class="rx-freq" value="As needed"></div>
              </div>
            </div>
            <!-- Pre-filled Drysol -->
            <div class="card2" style="padding:1rem;">
              <div class="field">
                <label>Name</label>
                <div class="ip mic">
                  <input type="text" class="rx-name" value="Drysol">
                </div>
              </div>
              <div style="display:flex; gap:1rem;">
                <div class="field" style="flex:1;"><label>Strength</label><input type="text" class="rx-strength" value="20%"></div>
                <div class="field" style="flex:1;"><label>Zone</label><input type="text" class="rx-zone" value="Underarms"></div>
                <div class="field" style="flex:1;"><label>Frequency</label><input type="text" class="rx-freq" value="Weekly"></div>
              </div>
            </div>
          </div>
          <button class="btn sm mt-4" id="add-rx">+ Add Invocation</button>
        </div>

        <!-- Step 4 -->
        <div class="ins-step" data-step="4" style="display:none;">
          <h3>What passes through the body? ${speakerMarkup('What passes through the body?')}</h3>
          <div class="mt">Oral medications that affect the skin or routines.</div>
          <div id="oral-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
            <div class="field"><input type="text" class="oral-med" value="Methotrexate"></div>
            <div class="field"><input type="text" class="oral-med" value="Etanercept"></div>
          </div>
          <button class="btn sm mt-4" id="add-oral">+ Add Medication</button>
        </div>

        <!-- Step 5 -->
        <div class="ins-step" data-step="5" style="display:none;">
          <h3>The ingredients to never touch ${speakerMarkup('The ingredients to never touch')}</h3>
          <div class="mt">Allergies and sensitivities.</div>
          <div id="alg-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
            <div class="field"><input type="text" class="alg-item" value="Lavender" disabled style="opacity:0.7"></div>
          </div>
          <div class="field mt-4">
            <div class="ip mic"><input type="text" id="new-alg" placeholder="Add ingredient..."></div>
          </div>
          <button class="btn sm" id="add-alg">+ Add</button>
        </div>

        <!-- Step 6 -->
        <div class="ins-step" data-step="6" style="display:none;">
          <h3>Which traditions call to you? ${speakerMarkup('Which traditions call to you?')}</h3>
          <div class="mt">Your preferred approaches to care.</div>
          <div class="chips" id="ins-trad">
            <div class="chip" data-val="kbeauty">K-beauty</div>
            <div class="chip" data-val="jbeauty">J-beauty</div>
            <div class="chip" data-val="ayurvedic">Ayurvedic</div>
            <div class="chip" data-val="caribbean">Caribbean / West Indian</div>
            <div class="chip" data-val="african">African</div>
            <div class="chip" data-val="french">French Pharmacy</div>
            <div class="chip" data-val="clean">Clean Beauty</div>
            <div class="chip" data-val="hoodoo">Hoodoo / Rootwork</div>
          </div>
        </div>

        <!-- Final -->
        <div class="ins-step" data-step="7" style="display:none; text-align:center;">
          <h3 style="font-family:'Pinyon Script', cursive; font-size:3rem; color:var(--parch);">The First Inscription is sealed</h3>
          <div class="mt" style="font-size:1.2rem; margin-top:2rem;">Your chamber awaits.</div>
        </div>

      </div>

      <div style="display:flex; justify-content:space-between; margin-top:2rem; border-top:1px solid var(--border); padding-top:1rem;">
        <button id="btn-ins-prev" class="btn" style="visibility:hidden;">Previous</button>
        <div id="ins-dots" style="display:flex; gap:0.5rem; align-items:center;">
          <!-- dots generated -->
        </div>
        <button id="btn-ins-next" class="btn plum">Next</button>
      </div>
    </div>
  `;

  attachVoice();

  const totalSteps = 7;
  let currentStep = 1;

  // Dots
  const dotsContainer = document.getElementById('ins-dots');
  for(let i=1; i<=totalSteps; i++) {
    dotsContainer.innerHTML += `<div class="dot ${i===1?'active':''}" id="dot-${i}" style="width:8px; height:8px; border-radius:50%; background:${i===1?'var(--plum)':'var(--border)'}"></div>`;
  }

  // Chips toggle
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.target.classList.toggle('active');
    });
  });

  // Add Rx
  document.getElementById('add-rx').addEventListener('click', () => {
    const list = document.getElementById('rx-list');
    list.insertAdjacentHTML('beforeend', `
      <div class="card2" style="padding:1rem;">
        <div class="field">
          <label>Name</label>
          <div class="ip mic"><input type="text" class="rx-name" placeholder="Name"></div>
        </div>
        <div style="display:flex; gap:1rem;">
          <div class="field" style="flex:1;"><label>Strength</label><input type="text" class="rx-strength"></div>
          <div class="field" style="flex:1;"><label>Zone</label><input type="text" class="rx-zone"></div>
          <div class="field" style="flex:1;"><label>Frequency</label><input type="text" class="rx-freq"></div>
        </div>
      </div>
    `);
    attachVoice();
  });

  // Add Oral
  document.getElementById('add-oral').addEventListener('click', () => {
    document.getElementById('oral-list').insertAdjacentHTML('beforeend', `<div class="field"><input type="text" class="oral-med" placeholder="Medication"></div>`);
  });

  // Add Alg
  document.getElementById('add-alg').addEventListener('click', () => {
    const val = document.getElementById('new-alg').value.trim();
    if(val) {
      document.getElementById('alg-list').insertAdjacentHTML('beforeend', `<div class="field"><input type="text" class="alg-item" value="${val}"></div>`);
      document.getElementById('new-alg').value = '';
    }
  });

  const btnPrev = document.getElementById('btn-ins-prev');
  const btnNext = document.getElementById('btn-ins-next');

  function updateView() {
    document.querySelectorAll('.ins-step').forEach(el => el.style.display = 'none');
    document.querySelector(`.ins-step[data-step="${currentStep}"]`).style.display = 'block';
    
    for(let i=1; i<=totalSteps; i++) {
      document.getElementById(`dot-${i}`).style.background = i===currentStep ? 'var(--plum)' : 'var(--border)';
    }

    btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    
    if(currentStep === totalSteps) {
      btnNext.textContent = 'Enter the Lounge';
    } else {
      btnNext.textContent = 'Next';
    }
  }

  btnPrev.addEventListener('click', () => {
    if(currentStep > 1) {
      currentStep--;
      updateView();
    }
  });

  btnNext.addEventListener('click', async () => {
    if (currentStep < totalSteps) {
      currentStep++;
      updateView();
    } else {
      // Collect and save
      const concerns = Array.from(document.querySelectorAll('#ins-concerns .chip.active')).map(c => c.dataset.val);
      const conditions = Array.from(document.querySelectorAll('.cond-chk:checked')).map(c => c.value);
      
      const rxs = Array.from(document.querySelectorAll('#rx-list .card2')).map(c => ({
        name: c.querySelector('.rx-name').value,
        strength: c.querySelector('.rx-strength').value,
        zone: c.querySelector('.rx-zone').value,
        frequency: c.querySelector('.rx-freq').value
      }));

      const orals = Array.from(document.querySelectorAll('.oral-med')).map(i => i.value).filter(Boolean);
      const allergies = Array.from(document.querySelectorAll('.alg-item')).map(i => i.value).filter(Boolean);
      const traditions = Array.from(document.querySelectorAll('#ins-trad .chip.active')).map(c => c.dataset.val);

      await supabase.from('user_profile').update({
        intake_completed: true,
        concerns,
        conditions,
        traditions
      }).eq('id', 'default-user');

      // (In real app, we would insert rx, orals, allergies into respective tables, skipping for this demo to just navigate)
      
      go('s-app');
      document.querySelector('.tb[data-target="rites"]')?.click();
    }
  });
}
