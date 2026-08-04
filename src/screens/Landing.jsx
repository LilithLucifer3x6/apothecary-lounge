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

      
      {/* Clean, elegant centered avatar badge */}
      {hasProfile && avatarConfig && avatarConfig.avatarVibe && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ position: 'relative', width: '120px', height: '120px' }}>
            <img 
              src={`/assets/avatar_${avatarConfig.avatarVibe}.jpg`} 
              alt="Avatar" 
              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.8)' }} 
            />
            <img 
              src={`/assets/fam_${avatarConfig.familiar}.jpg`} 
              alt="Familiar" 
              style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--bg)', boxShadow: '0 2px 8px rgba(0,0,0,0.8)' }} 
            />
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', color: 'var(--gold)', fontStyle: 'italic', textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}>
            Welcome back, {avatarConfig.name}.
          </div>
        </div>
      )}
      
      {hasProfile && (
        <button 
          onClick={onOpenAvatar} 
          style={{ 
            marginTop: '2rem', 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--dim)', 
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            transition: 'color 0.2s',
            width: '100%',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--dim)'}
          title="Reshape Your Visage"
        >
          <Icon name="ph-user" /> Reshape Visage
        </button>
      )}

      {!hasProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
          <button className="btn plum" onClick={onOpenAvatar} style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}>
            <Icon name="ph-user" /> Conjure Your Visage
          </button>
          <button className="btn" onClick={() => onProceed(false)} style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}>
            <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
          </button>
        </div>
      )}
    </div>
  );
}
