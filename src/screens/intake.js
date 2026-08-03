import { supabase } from '../lib/supabase.js';
import { go } from '../main.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';
import { speakerMarkup } from '../lib/tts.js';
import * as AI from '../lib/ai-service.js';
export function render(container) {
  container.innerHTML = `
    <div class="card" style="max-width:700px; margin: 2rem auto;">
      <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
      <h2 style="text-align:center; font-family:'Pinyon Script', cursive; font-size:2.5rem; color:var(--parch);">The First Inscription</h2>
      <div id="path-toggle" style="text-align:center; margin-bottom:1rem;">
        <button class="btn sm" id="btn-path-ai" style="background:var(--plum); color:var(--white); border-color:var(--plum);">The Guardian's Inquiry</button>
        <button class="btn sm" id="btn-path-fast">The Fast Route</button>
      </div>

      <div id="ai-path" style="display:block;">
        <div id="ai-chat-log" style="height:350px; overflow-y:auto; border:1px solid var(--border); padding:1rem; margin-bottom:1rem; background:rgba(0,0,0,0.1); border-radius:4px; font-family:'IM Fell English', serif; font-size:1.1rem; line-height:1.5;">
          <div class="msg ai" style="color:var(--parch); margin-bottom:1rem;">
            Greetings. I am the Keeper of The Lounge. Let us prepare your chamber. What brings you to this place?
          </div>
        </div>
        <div class="field" style="display:flex; gap:0.5rem; align-items:flex-end;">
          <div class="ip mic" style="flex:1;">
            <input type="text" id="ai-chat-input" placeholder="Speak your mind...">
          </div>
          <button id="btn-chat-send" class="btn plum">Send</button>
        </div>
        <div id="ai-status" style="margin-top:0.5rem; font-size:0.9rem; color:var(--rose); height:1rem;"></div>
      </div>

      <div id="ins-steps" style="display:none;">
        <!-- Step 1 -->
        <div class="ins-step" data-step="1">
          <h3>What brings you to this place? ${speakerMarkup('What brings you to this place?')}</h3>
          <div class="mt">Select all that weigh upon you.</div>
          <div class="chips" id="ins-concerns">
            <div style="opacity:0.5;">Divining concerns...</div>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="ins-step" data-step="2" style="display:none;">
          <h3>What must the Lounge protect? ${speakerMarkup('What must the Lounge protect?')}</h3>
          <div class="mt">Conditions that shape how you care for yourself.</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1rem;" id="ins-conditions">
            <div style="opacity:0.5;">Divining conditions...</div>
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
                <div class="field" style="flex:1;"><label>Strength</label><div class="ip mic"><input type="text" class="rx-strength" value="0.05%"></div></div>
                <div class="field" style="flex:1;"><label>Zone</label><div class="ip mic"><input type="text" class="rx-zone" value="Face"></div></div>
                <div class="field" style="flex:1;"><label>Frequency</label><div class="ip mic"><input type="text" class="rx-freq" value="Nightly"></div></div>
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
                <div class="field" style="flex:1;"><label>Strength</label><div class="ip mic"><input type="text" class="rx-strength" value="0.1%"></div></div>
                <div class="field" style="flex:1;"><label>Zone</label><div class="ip mic"><input type="text" class="rx-zone" value="Face/Neck"></div></div>
                <div class="field" style="flex:1;"><label>Frequency</label><div class="ip mic"><input type="text" class="rx-freq" value="As needed"></div></div>
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
                <div class="field" style="flex:1;"><label>Strength</label><div class="ip mic"><input type="text" class="rx-strength" value="20%"></div></div>
                <div class="field" style="flex:1;"><label>Zone</label><div class="ip mic"><input type="text" class="rx-zone" value="Underarms"></div></div>
                <div class="field" style="flex:1;"><label>Frequency</label><div class="ip mic"><input type="text" class="rx-freq" value="Weekly"></div></div>
              </div>
            </div>
          </div>
          <button class="btn sm mt-4" id="add-rx">+ Invoke</button>
        </div>

        <!-- Step 4 -->
        <div class="ins-step" data-step="4" style="display:none;">
          <h3>What passes through the body? ${speakerMarkup('What passes through the body?')}</h3>
          <div class="mt">Oral medications that affect the skin or routines.</div>
          <div id="oral-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
            <div class="field"><div class="ip mic"><input type="text" class="oral-med" value="Methotrexate"></div></div>
            <div class="field"><div class="ip mic"><input type="text" class="oral-med" value="Etanercept"></div></div>
          </div>
          <button class="btn sm mt-4" id="add-oral">+ Add Medication</button>
        </div>

        <!-- Step 5 -->
        <div class="ins-step" data-step="5" style="display:none;">
          <h3>The ingredients to never touch ${speakerMarkup('The ingredients to never touch')}</h3>
          <div class="mt">Allergies and sensitivities.</div>
          <div id="alg-list" style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
            <div class="field"><div class="ip mic"><input type="text" class="alg-item" value="Lavender" disabled style="opacity:0.7"></div></div>
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
            <div style="opacity:0.5;">Divining traditions...</div>
          </div>
        </div>

        <!-- Final -->
        <div class="ins-step" data-step="7" style="display:none; text-align:center;">
          <h3 style="font-family:'Pinyon Script', cursive; font-size:3rem; color:var(--parch);">The First Inscription is sealed</h3>
          <div class="mt" style="font-size:1.2rem; margin-top:2rem;">Your chamber awaits.</div>
        </div>

      </div>

      <div id="fast-route-controls" style="display:none; justify-content:space-between; margin-top:2rem; border-top:1px solid var(--border); padding-top:1rem;">
        <button id="btn-ins-prev" class="btn" style="visibility:hidden;">Step Back</button>
        <div id="ins-dots" style="display:flex; gap:0.5rem; align-items:center;">
          <!-- dots generated -->
        </div>
        <button id="btn-ins-next" class="btn plum">Continue</button>
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

  // Path toggling
  const btnPathAi = document.getElementById('btn-path-ai');
  const btnPathFast = document.getElementById('btn-path-fast');
  const aiPath = document.getElementById('ai-path');
  const insSteps = document.getElementById('ins-steps');
  const fastControls = document.getElementById('fast-route-controls');

  btnPathAi.addEventListener('click', () => {
    btnPathAi.style.background = 'var(--plum)';
    btnPathAi.style.color = 'var(--white)';
    btnPathFast.style.background = 'transparent';
    btnPathFast.style.color = 'var(--parch)';
    aiPath.style.display = 'block';
    insSteps.style.display = 'none';
    fastControls.style.display = 'none';
  });

  btnPathFast.addEventListener('click', () => {
    btnPathFast.style.background = 'var(--plum)';
    btnPathFast.style.color = 'var(--white)';
    btnPathAi.style.background = 'transparent';
    btnPathAi.style.color = 'var(--parch)';
    aiPath.style.display = 'none';
    insSteps.style.display = 'block';
    fastControls.style.display = 'flex';
  });

  function attachChipListeners(parent) {
    parent.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', (e) => e.target.classList.toggle('active'));
    });
  }

  AI.generateConcerns().then(list => {
    document.getElementById('ins-concerns').innerHTML = `<div class="chip" data-val="relaxation">Nothing — I came for the quiet</div>` + list.map(c => `<div class="chip" data-val="${c.id}">${c.label}</div>`).join('');
    attachChipListeners(document.getElementById('ins-concerns'));
  });
  AI.generateConditions().then(list => {
    document.getElementById('ins-conditions').innerHTML = list.map(c => `<label><input type="checkbox" value="${c.id}" class="cond-chk"> ${c.label}</label>`).join('');
  });
  AI.generateTraditions().then(list => {
    document.getElementById('ins-trad').innerHTML = list.map(c => `<div class="chip" data-val="${c.id}">${c.label}</div>`).join('');
    attachChipListeners(document.getElementById('ins-trad'));
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
          <div class="field" style="flex:1;"><label>Strength</label><div class="ip mic"><input type="text" class="rx-strength"></div></div>
          <div class="field" style="flex:1;"><label>Zone</label><div class="ip mic"><input type="text" class="rx-zone"></div></div>
          <div class="field" style="flex:1;"><label>Frequency</label><div class="ip mic"><input type="text" class="rx-freq"></div></div>
        </div>
      </div>
    `);
    attachVoice();
  });

  // Add Oral
  document.getElementById('add-oral').addEventListener('click', () => {
    document.getElementById('oral-list').insertAdjacentHTML('beforeend', `<div class="field"><div class="ip mic"><input type="text" class="oral-med" placeholder="Medication"></div></div>`);
  });

  // Add Alg
  document.getElementById('add-alg').addEventListener('click', () => {
    const val = document.getElementById('new-alg').value.trim();
    if(val) {
      document.getElementById('alg-list').insertAdjacentHTML('beforeend', `<div class="field"><div class="ip mic"><input type="text" class="alg-item" value="${val}"></div></div>`);
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
      btnNext.textContent = 'Continue';
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

      const avatarConfig = JSON.parse(localStorage.getItem('avatar_config') || '{}');
      await supabase.from('user_profile').insert({
        id: 'default-user',
        intake_completed: true,
        intake_answers: { concerns, conditions, traditions },
        avatar_config: avatarConfig
      });

      // (In real app, we would insert rx, orals, allergies into respective tables, skipping for this demo to just navigate)
      
      go('s-app');
      document.querySelector('.tb[data-target="rites"]')?.click();
    }
  });

  // AI Chat Logic
  import('../lib/ai-engine.js').then(({ isAiReady, conductIntake }) => {
    const status = document.getElementById('ai-status');
    if (!isAiReady()) {
      status.innerHTML = 'AI key missing. <a href="#" id="set-ai-key" style="color:var(--parch);text-decoration:underline;">Set API Key</a>';
      document.getElementById('set-ai-key').addEventListener('click', async (e) => {
        e.preventDefault();
        const key = prompt('Enter Anthropic API Key:');
        if (key) {
          const { initAnthropic } = await import('../lib/ai-engine.js');
          initAnthropic(key);
          status.innerHTML = 'AI activated.';
          setTimeout(() => status.innerHTML='', 2000);
        }
      });
    }

    let messageHistory = [];
    
    document.getElementById('btn-chat-send').addEventListener('click', async () => {
      const input = document.getElementById('ai-chat-input');
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      const chatLog = document.getElementById('ai-chat-log');
      
      chatLog.insertAdjacentHTML('beforeend', `<div class="msg user" style="color:var(--white); margin-bottom:1rem; text-align:right;">${text}</div>`);
      chatLog.scrollTop = chatLog.scrollHeight;
      
      messageHistory.push({ role: 'user', content: text });
      status.textContent = 'The Keeper is listening...';

      try {
        const { reply, extractedData } = await conductIntake(messageHistory);
        status.textContent = '';
        
        messageHistory.push({ role: 'assistant', content: reply });
        chatLog.insertAdjacentHTML('beforeend', `<div class="msg ai" style="color:var(--parch); margin-bottom:1rem;">${reply}</div>`);
        chatLog.scrollTop = chatLog.scrollHeight;

        if (extractedData) {
          status.textContent = 'The Keeper has finished divining your answers.';
          // Save and route automatically
          const avatarConfig = JSON.parse(localStorage.getItem('avatar_config') || '{}');
          await supabase.from('user_profile').insert({
            id: 'default-user',
            intake_completed: true,
            intake_answers: extractedData,
            avatar_config: avatarConfig
          });
          
          setTimeout(() => {
            go('s-app');
            document.querySelector('.tb[data-target="rites"]')?.click();
          }, 2000);
        }
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
        messageHistory.pop(); // Revert user message from history on error
      }
    });
  });
}
