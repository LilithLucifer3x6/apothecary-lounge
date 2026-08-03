import React, { useRef, useEffect } from 'react';
import { attachVoice } from '../lib/voice.js';

export default function VoiceInput({ className = '', value, onChange, placeholder, disabled, style, onKeyDown, isTextArea = false }) {
  const ref = useRef(null);
  const attachedRef = useRef(false);

  useEffect(() => {
    if (ref.current && !attachedRef.current) {
      attachVoice(ref.current);
      attachedRef.current = true;
    }
  }, []);

  const Component = isTextArea ? 'textarea' : 'input';
  
  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
      <Component
        ref={ref}
        type={isTextArea ? undefined : 'text'}
        className={`voice-enabled ${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ ...style, width: '100%', padding: '1rem 3rem 1rem 1.25rem', fontSize: '1.1rem', borderRadius: '8px', border: '2px solid var(--border)', background: 'var(--card2)', color: 'var(--rose)' }}
        onKeyDown={onKeyDown}
        rows={isTextArea ? 3 : undefined}
      />
      <div 
        className="mic-icon-overlay"
        style={{
          position: 'absolute',
          right: '8px',
          top: isTextArea ? '8px' : '50%',
          transform: isTextArea ? 'none' : 'translateY(-50%)',
          color: 'var(--rose)',
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
          <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm104,64a8,8,0,0,1-16,0,56,56,0,0,1-112,0,8,8,0,0,1-16,0,72.08,72.08,0,0,0,64,71.49V232a8,8,0,0,0,16,0V199.49A72.08,72.08,0,0,0,200,128Z"></path>
        </svg>
      </div>
    </div>
  );
}
