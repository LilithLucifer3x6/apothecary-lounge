import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.jsx';

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
    <div className="land" style={{ 
        backgroundImage: 'url("/bg_cottage_exterior_1785969171117.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    }}>
      {/* Background Overlay to ensure text readability */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1 }}></div>

      {/* Avatar Dynamic Overlay */}
      {hasProfile && avatarConfig && avatarConfig.avatarVibe && (
        <div style={{ position: 'absolute', bottom: '5%', right: '10%', zIndex: 2, display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
          <img 
            src={`/assets/fam_${avatarConfig.familiar}.jpg`} 
            alt="Familiar" 
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', border: '2px solid var(--plum)', boxShadow: '0 4px 15px rgba(0,0,0,0.8)', marginBottom: '20px' }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <img 
            src={`/assets/avatar_${avatarConfig.avatarVibe}.jpg`} 
            alt="Avatar" 
            style={{ width: '200px', height: '300px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--plum)', boxShadow: '0 4px 15px rgba(0,0,0,0.8)' }} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Main UI Container */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', background: 'rgba(20, 15, 25, 0.7)', padding: '3rem 2rem', borderRadius: '12px', border: '1px solid var(--border)', backdropFilter: 'blur(4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 10vw, 3.5rem)', textShadow: '2px 2px 0 #0b090e, -1px -1px 0 #0b090e, 1px -1px 0 #0b090e, -1px 1px 0 #0b090e, 0 8px 30px rgba(0,0,0,1)', color: 'var(--plum)', margin: '0 0 0.5rem 0' }}>
            Shadow & Sanctuary
          </h1>
          <div className="tag" style={{ fontSize: '1rem', textShadow: '1px 1px 0 #0b090e, 0 4px 15px rgba(0,0,0,1)', color: 'var(--plum)', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)', padding: '0.6rem', display: 'inline-block', marginBottom: '2rem' }}>
            A sanctuary of self-care.
          </div>
          
          {hasProfile && avatarConfig && (
            <div style={{ fontSize: '1.4rem', color: 'var(--gold)', textShadow: '0 2px 5px rgba(0,0,0,0.9)', marginBottom: '2rem' }}>
              Welcome back, {avatarConfig.name}.
            </div>
          )}

          {!hasProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <button className="btn plum" onClick={onOpenAvatar} style={{ fontSize: '1.2rem', padding: '0.8rem 2rem', width: '250px' }}>
                <Icon name="ph-user" /> Conjure Your Visage
              </button>
              <button className="btn" onClick={() => onProceed(false)} style={{ fontSize: '1.2rem', padding: '0.8rem 2rem', width: '250px' }}>
                <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onProceed(true)} 
              className="btn" 
              style={{ fontSize: '1.3rem', padding: '0.8rem 1.5rem', background: 'var(--card2)', borderColor: 'var(--plum)', color: 'var(--plum)', boxShadow: '0 4px 15px rgba(0,0,0,0.8)', width: '250px' }}
            >
              Enter the Sanctuary
            </button>
          )}
      </div>
    </div>
  );
}

