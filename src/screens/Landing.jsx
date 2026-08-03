import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { getAvatarConfig, generateAvatarSVG } from '../lib/avatar.js';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.js';

export default function Landing({ onProceed, onOpenAvatar }) {
  const [hasProfile, setHasProfile] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState(null);

  useEffect(() => {
    setAvatarConfig(getAvatarConfig());
    
    const isCompletedLocally = localStorage.getItem('intake_completed') === 'true';
    if (isCompletedLocally) {
      setHasProfile(true);
    } else {
      supabase.from('user_profile').select('id').maybeSingle().then(({ data }) => {
        setHasProfile(!!data);
      });
    }
  }, []);

        <img src="/assets/cottage_room.jpg" alt="Sanctuary Room" style={{ width: '100%', display: 'block', borderRadius: '4px' }} />

  return (
    <div className="land">
      <h1 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.8rem', lineHeight: '1.5', padding: '0.2em 0.2em 0.4em 0.2em', margin: '0', color: 'var(--white)' }}>
        Shadow & Sanctuary
      </h1>
      <div className="tag" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--silver)', fontSize: '1.06em', marginBottom: '1.2rem' }}>
        a place to keep the work of caring for yourself
      </div>
      <div className="scene" style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <img src="/assets/cottage_room.jpg" alt="Sanctuary Room" style={{ width: '100%', display: 'block' }} />
      </div>
      {!hasProfile && (
        <button className="btn plum" onClick={() => onProceed(false)}>
          <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
        </button>
      )}
      {hasProfile && (
        <button className="btn sm" onClick={onOpenAvatar} style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ash)' }}>
          <Icon name="ph-user" /> Avatar Builder
        </button>
      )}
    </div>
  );
}
