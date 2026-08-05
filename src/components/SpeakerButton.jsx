import React, { useState, useEffect } from 'react';
import { speak, getTtsEnabled } from '../lib/tts.js';

export default function SpeakerButton({ text, style }) {
  const [enabled, setEnabled] = useState(false);
  
  useEffect(() => {
    setEnabled(getTtsEnabled());
    const handleStorageChange = () => setEnabled(getTtsEnabled());
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => setEnabled(getTtsEnabled()), 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!enabled || !window.speechSynthesis) return null;

  return (
    <button 
      type="button" 
      className="spk" 
      style={style} 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        speak(text);
      }}
    >
      <i className="ph-duotone ph-speaker-high"></i>
    </button>
  );
}

