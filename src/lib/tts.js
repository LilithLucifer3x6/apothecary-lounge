let ttsEnabled = true;

export function getTtsEnabled() {
  return ttsEnabled;
}

export function setTtsEnabled(enabled) {
  ttsEnabled = !!enabled;
}

export function speak(text) {
  if (!ttsEnabled || !window.speechSynthesis) return;
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

export function createSpeakerButton(text) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'spk';
  btn.innerHTML = '<i class="ph-duotone ph-speaker-high"></i>';
  
  if (!window.speechSynthesis) {
    btn.style.display = 'none';
    return btn;
  }
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    speak(text);
  });
  
  return btn;
}

export function speakerMarkup(text) {
  if (!window.speechSynthesis) return '';
  const safeText = text.replace(/"/g, '&quot;');
  return `<button type="button" class="spk" onclick="window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance('${text.replace(/'/g, "\\'")}'))"><i class="ph-duotone ph-speaker-high"></i></button>`;
}
