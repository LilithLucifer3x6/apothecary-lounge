let ttsEnabled = localStorage.getItem('tts_enabled') === 'true';
let ttsRate = parseFloat(localStorage.getItem('tts_rate')) || 1.0;
let ttsPitch = parseFloat(localStorage.getItem('tts_pitch')) || 1.0;
let ttsVoiceURI = localStorage.getItem('tts_voice_uri') || '';

export function getTtsEnabled() { return ttsEnabled; }
export function getTtsRate() { return ttsRate; }
export function getTtsPitch() { return ttsPitch; }
export function getTtsVoiceURI() { return ttsVoiceURI; }

export function setTtsEnabled(enabled) {
  ttsEnabled = !!enabled;
  localStorage.setItem('tts_enabled', ttsEnabled);
  document.querySelectorAll('.spk').forEach(el => el.style.display = ttsEnabled ? '' : 'none');
}

export function setTtsRate(rate) {
  ttsRate = rate;
  localStorage.setItem('tts_rate', rate);
}

export function setTtsPitch(pitch) {
  ttsPitch = pitch;
  localStorage.setItem('tts_pitch', pitch);
}

export function setTtsVoiceURI(uri) {
  ttsVoiceURI = uri;
  localStorage.setItem('tts_voice_uri', uri);
}

export function getFeminineVoices() {
  if (!window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  // Filter out definitely male voices across all English variants
  return voices
    .filter(v => /^en/i.test(v.lang) && !/male|david|mark|guy|richard|arthur|brian|george|paul|peter|william|james|john|robert|michael|thomas|charles|daniel|matthew|anthony|donald|steven/i.test(v.name))
    .map(v => {
      let displayName = v.name;
      if (!/female/i.test(v.name)) displayName += ' (Female / Non-Male)';
      return { ...v, displayName, voiceURI: v.voiceURI };
    });
}

export function speak(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = ttsRate;
  utterance.pitch = ttsPitch;
  
  const voices = window.speechSynthesis.getVoices();
  if (ttsVoiceURI) {
    const selectedVoice = voices.find(v => v.voiceURI === ttsVoiceURI);
    if (selectedVoice) utterance.voice = selectedVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

export function createSpeakerButton(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'spk';
  btn.innerHTML = '<i class="ph-duotone ph-speaker-high"></i>';
  
  if (!window.speechSynthesis || !ttsEnabled) {
    btn.style.display = 'none';
  }
  if (!window.speechSynthesis) return btn;
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    speak(text);
  });
  
  return btn;
}

export function speakerMarkup(text) {
  if (!window.speechSynthesis) return '';
  return `<button type="button" class="spk" style="${ttsEnabled ? '' : 'display:none;'}" onclick="window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance('${text.replace(/'/g, "\\'")}'); u.rate = ${ttsRate}; u.pitch = ${ttsPitch}; const v = window.speechSynthesis.getVoices().find(x => x.voiceURI === '${ttsVoiceURI}'); if(v) u.voice = v; window.speechSynthesis.speak(u);"><i class="ph-duotone ph-speaker-high"></i></button>`;
}
