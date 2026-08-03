import React, { useRef, useState, useEffect } from 'react';

export default function VoiceInput({ className = '', value, onChange, placeholder, disabled, style, onKeyDown, isTextArea = false }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interimTranscript += event.results[i][0].transcript;
        }
        
        const newValue = finalTranscript || interimTranscript;
        
        // Create synthetic event to trigger onChange
        if (onChange) {
          onChange({ target: { value: newValue } });
        } else if (inputRef.current) {
          inputRef.current.value = newValue;
        }
      };

      recognitionRef.current = recognition;
    }
  }, [onChange]);

  const toggleMic = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <Component
        ref={inputRef}
        type={isTextArea ? undefined : 'text'}
        className={`${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ 
          ...style, 
          width: '100%', 
          padding: '1rem 3rem 1rem 1.25rem', 
          fontSize: '1.1rem', 
          borderRadius: '8px', 
          border: isListening ? '2px solid var(--rose)' : '2px solid var(--border)', 
          background: 'var(--card2)', 
          color: 'var(--rose)',
          transition: 'border-color 0.2s'
        }}
        onKeyDown={onKeyDown}
        rows={isTextArea ? 3 : undefined}
      />
      <button 
        type="button"
        onClick={toggleMic}
        title="Dictate"
        style={{
          position: 'absolute',
          right: '8px',
          top: isTextArea ? '8px' : '50%',
          transform: isTextArea ? 'none' : 'translateY(-50%)',
          color: isListening ? 'var(--bg)' : 'var(--rose)',
          background: isListening ? 'var(--rose)' : 'transparent',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          padding: 0
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm104,64a8,8,0,0,1-16,0,56,56,0,0,1-112,0,8,8,0,0,1-16,0,72.08,72.08,0,0,0,64,71.49V232a8,8,0,0,0,16,0V199.49A72.08,72.08,0,0,0,200,128Z"></path>
        </svg>
      </button>
    </div>
  );
}
