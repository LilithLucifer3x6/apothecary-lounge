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
      <h1 style={{ fontFamily: "'Allura', cursive", fontSize: '2.8rem', lineHeight: '1.5', padding: '0.2em 0.2em 0.4em 0.2em', margin: '0', color: 'var(--rose)' }}>
        Shadow & Sanctuary
      </h1>
      <div className="tag" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--rose)', fontSize: '1.06em', marginBottom: '1.2rem' }}>
        a place to keep the work of caring for yourself
      </div>
      
      {/* Background Avatar & Familiar Layer */}
      {hasProfile && avatarConfig && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', opacity: 0.85 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '600px', height: '600px' }}>
            <img 
              src={`/assets/avatar_${avatarConfig.avatarVibe}.jpg`} 
              alt="Avatar" 
              style={{ 
                position: 'absolute',
                bottom: 0,
                right: '10%',
                width: '350px', 
                height: '500px', 
                objectFit: 'cover', 
                WebkitMaskImage: 'radial-gradient(circle at center, black 20%, rgba(0,0,0,0.6) 50%, transparent 80%)',
                maskImage: 'radial-gradient(circle at center, black 20%, rgba(0,0,0,0.6) 50%, transparent 80%)',
                opacity: 0.7
              }} 
            />
            <img 
              src={`/assets/fam_${avatarConfig.familiar}.jpg`} 
              alt="Familiar" 
              style={{ 
                position: 'absolute', 
                bottom: '50px', 
                left: '20%', 
                width: '180px', 
                height: '180px', 
                objectFit: 'cover', 
                borderRadius: '50%',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
                opacity: 0.8
              }} 
            />
          </div>
        </div>
      )}

      {hasProfile && avatarConfig && (
        <div style={{ marginTop: '2rem', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: 'var(--rose)', fontStyle: 'italic', textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}>
          Welcome back, {avatarConfig.name}.
        </div>
      )}
      
      {hasProfile && (
        <button 
          onClick={onOpenAvatar} 
          style={{ 
            marginTop: '3rem', 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--dim)', 
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'color 0.2s',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--rose)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--dim)'}
          title="Reshape Your Visage"
        >
          <Icon name="ph-user" /> Reshape Visage
        </button>
      )}

      {!hasProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn plum" onClick={onOpenAvatar}>
            <Icon name="ph-user" /> Conjure Your Visage
          </button>
          <button className="btn" onClick={() => onProceed(false)}>
            <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
          </button>
        </div>
      )}
    </div>
  );
}
