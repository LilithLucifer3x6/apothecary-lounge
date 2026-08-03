import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.js';

export default function Landing({ onProceed, onOpenAvatar }) {
  const [hasProfile, setHasProfile] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState(null);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('avatar_config');
      if (savedConfig) {
        setAvatarConfig(JSON.parse(savedConfig));
      }
    } catch(e) {}
    
    const isCompletedLocally = localStorage.getItem('intake_completed') === 'true';
    if (isCompletedLocally) {
      setHasProfile(true);
    } else {
      supabase.from('user_profile').select('id').maybeSingle().then(({ data }) => {
        setHasProfile(!!data);
      });
    }
  }, []);

  return (
    <div className="land" style={{ paddingBottom: '2rem' }}>
      <h1 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.8rem', lineHeight: '1.5', padding: '0.2em 0.2em 0.4em 0.2em', margin: '0', color: 'var(--rose)' }}>
        Shadow & Sanctuary
      </h1>
      <div className="tag" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--rose)', fontSize: '1.06em', marginBottom: '1.2rem' }}>
        a place to keep the work of caring for yourself
      </div>
      
      <div style={{ marginTop: '2rem' }}></div>


      {!hasProfile && (
        <button className="btn plum" onClick={() => onProceed(false)}>
          <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
        </button>
      )}
      
      {hasProfile && (
        <button className="btn sm" onClick={onOpenAvatar} style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--rose)' }}>
          <Icon name="ph-user" /> Conjure Your Visage
        </button>
      )}
    </div>
  );
}
