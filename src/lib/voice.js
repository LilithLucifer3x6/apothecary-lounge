export function attachVoice(inputEl) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Speech Recognition API is not supported in this browser.');
    return;
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'mic';
  btn.innerHTML = '<i class="ph-duotone ph-microphone"></i>';
  
  if (inputEl.parentNode) {
    inputEl.parentNode.insertBefore(btn, inputEl.nextSibling);
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let isListening = false;

  recognition.onstart = () => {
    isListening = true;
    btn.classList.add('listening');
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    // Combine any final transcript with the interim updates
    inputEl.value = finalTranscript || interimTranscript;
    
    // Trigger input event to update any tied reactive frameworks/listeners
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    isListening = false;
    btn.classList.remove('listening');
  };

  recognition.onend = () => {
    isListening = false;
    btn.classList.remove('listening');
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  });
}
