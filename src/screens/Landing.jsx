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

      {hasProfile && avatarConfig && (
        <div style={{ position: 'relative', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '300px', height: '400px' }}>
            {/* Avatar */}
            <img 
              src={`/assets/avatar_${avatarConfig.avatarVibe}.jpg`} 
              alt={avatarConfig.name} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: '12px', 
                WebkitMaskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 60%, transparent 100%)',
                maskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 60%, transparent 100%)'
              }} 
            />
            {/* Familiar */}
            <img 
              src={`/assets/fam_${avatarConfig.familiar}.jpg`} 
              alt="Familiar" 
              style={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-40px', 
                width: '180px', 
                height: '180px', 
                objectFit: 'cover', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
              }} 
            />
          </div>
          
          <div style={{ marginTop: '3rem', fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', color: 'var(--parch)', textShadow: '0 4px 10px rgba(0,0,0,0.9)' }}>
            Welcome back, {avatarConfig.name}.
          </div>
        </div>
      )}
      
      {hasProfile && (
        <button className="btn sm" onClick={onOpenAvatar} style={{ marginTop: '2rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--rose)', opacity: 0.7 }}>
          <Icon name="ph-user" /> Reshape Your Visage
        </button>
      )}
    </div>
  );
}
