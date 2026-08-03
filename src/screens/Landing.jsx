import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { getAvatarConfig, generateAvatarSVG } from '../lib/avatar.js';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.js';

export default function Landing({ onProceed }) {
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

  function drawCottage() {
    if (!avatarConfig) return null;
    
    return (
      <>
        {/* AI-Generated 2D Cartoon Background */}
        <image href="/assets/cottage_room.jpg" width="520" height="340" preserveAspectRatio="xMidYMid slice" />
        
        {/* Avatar Builder replaces the SVG overlay */}
        
        {/* Familiar */}
        <defs>
          <clipPath id="landingFamClip"><circle cx="316" cy="266" r="22" /></clipPath>
        </defs>
        <circle cx="316" cy="266" r="24" fill="#1a1110" />
        {avatarConfig.fam && (
          <image href={`/assets/${avatarConfig.fam}`} x="294" y="244" width="44" height="44" clipPath="url(#landingFamClip)" />
        )}
      </>
    );
  }

  return (
    <div className="land">
      <div className="scene">
        <svg id="cottage" viewBox="0 0 520 340" width="100%">
          {drawCottage()}
        </svg>
      </div>
      <h1 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '3.1em', margin: '.7rem 0 .1rem', color: 'var(--white)' }}>
        Shadow & Sanctuary
      </h1>
      <div className="tag" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--silver)', fontSize: '1.06em', marginBottom: '1.2rem' }}>
        a place to keep the work of caring for yourself
      </div>
      {!hasProfile && (
        <button className="btn plum" onClick={() => onProceed(false)}>
          <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
        </button>
      )}
    </div>
  );
}
