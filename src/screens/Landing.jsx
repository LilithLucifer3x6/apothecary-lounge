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
      
      <div className="scene" style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', marginBottom: '2rem' }}>
        <img src="/assets/bg_sanctuary.jpg" alt="Sanctuary Room" style={{ width: '100%', display: 'block' }} />
      </div>

      {avatarConfig && (
        <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'var(--card2)', border: '1px solid var(--border)' }}>
          <img 
            src={`/assets/avatar_${avatarConfig.avatarVibe}.jpg`} 
            alt="Avatar" 
            style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} 
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', color: 'var(--rose)', margin: 0, lineHeight: 1.2 }}>
              {avatarConfig.name || 'The Keeper'}
            </h2>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--ash)', fontStyle: 'italic' }}>
              The {avatarConfig.avatarVibe.charAt(0).toUpperCase() + avatarConfig.avatarVibe.slice(1)}
            </div>
          </div>
          {avatarConfig.familiar && avatarConfig.familiar !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img 
                src={`/assets/fam_${avatarConfig.familiar}.jpg`} 
                alt="Familiar" 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }} 
              />
              <div style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--ash)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Familiar
              </div>
            </div>
          )}
        </div>
      )}

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
