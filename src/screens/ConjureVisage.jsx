import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import { supabase } from '../lib/supabase.js';

export default function ConjureVisage({ onComplete }) {
  const [name, setName] = useState('The Keeper');
  const [avatarVibe, setAvatarVibe] = useState('alchemist');
  const [familiar, setFamiliar] = useState('cat');

  const avatars = [
    { id: 'alchemist', label: 'The Alchemist', img: '/assets/avatar_alchemist.jpg', desc: 'Masters of transmutation and potion crafting.' },
    { id: 'diviner', label: 'The Diviner', img: '/assets/avatar_diviner.jpg', desc: 'Seers who draw truth from the stars and shadows.' },
    { id: 'oracle', label: 'The Oracle', img: '/assets/avatar_oracle.jpg', desc: 'Speakers of ancient rites and forgotten truths.' },
    { id: 'rootworker', label: 'The Rootworker', img: '/assets/avatar_rootworker.jpg', desc: 'Bound to the earth, flora, and natural remedies.' },
    { id: 'shadowwalker', label: 'The Shadow-Walker', img: '/assets/avatar_shadowwalker.jpg', desc: 'Traversers of the veil and silent sanctuaries.' }
  ];

  const familiars = [
    { id: 'cat', label: 'Midnight Cat', img: '/assets/familiar_cat.jpg' },
    { id: 'raven', label: 'Watchful Raven', img: '/assets/familiar_raven.jpg' },
    { id: 'moth', label: 'Luna Moth', img: '/assets/familiar_moth.jpg' },
    { id: 'hound', label: 'Shadow Hound', img: '/assets/familiar_hound.jpg' },
    { id: 'toad', label: 'Forest Toad', img: '/assets/familiar_toad.jpg' },
    { id: 'spider', label: 'Weaver Spider', img: '/assets/familiar_spider.jpg' },
    { id: 'serpent', label: 'Garden Serpent', img: '/assets/familiar_serpent.jpg' }
  ];

  const handleFinish = async () => {
    if (!avatarVibe || !familiar) return;
    const config = { name, avatarVibe, familiar };
    localStorage.setItem('avatar_config', JSON.stringify(config));
    
    try {
      const { data: profile } = await supabase.from('user_profile').select('id').maybeSingle();
      if (profile) {
        await supabase.from('user_profile').update({ avatar_config: config }).eq('id', profile.id);
      }
    } catch(e) {
      console.warn('Could not sync avatar to backend', e);
    }
    
    if (onComplete) onComplete(config);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', color: 'var(--rose)' }}>
      <h2 style={{ fontSize: '2.5rem', textAlign: 'center', color: 'var(--rose)', marginBottom: '1rem' }}>
        Conjure Your Visage
      </h2>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3 style={{ color: 'var(--rose)' }}>The Keeper's Form</h3>
        <div className="mt mb-4" style={{ color: 'var(--rose)' }}>Select the visage that best reflects your practice.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {avatars.map(av => (
            <div 
              key={av.id}
              onClick={() => setAvatarVibe(av.id)}
              style={{ 
                border: avatarVibe === av.id ? '2px solid var(--rose)' : '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: 'var(--card2)',
                boxShadow: avatarVibe === av.id ? '0 0 15px rgba(176,132,148,0.4)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.5rem',
                textAlign: 'center'
              }}
            >
              <img src={av.img} alt={av.label} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '1rem', color: 'var(--rose)', lineHeight: '1.2' }}>{av.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3 style={{ color: 'var(--rose)' }}>The Name</h3>
        <VoiceInput 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="By what name shall the lounge address you?" 
          style={{ width: '100%', padding: '1rem', marginTop: '1rem', color: 'var(--rose)' }}
        />

        <h3 style={{ marginTop: '2rem', color: 'var(--rose)' }}>The Familiar</h3>
        <div className="mt mb-4" style={{ color: 'var(--rose)' }}>Select a companion to share your sanctuary.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
          {familiars.map(f => (
            <div 
              key={f.id}
              onClick={() => setFamiliar(f.id)}
              style={{
                border: familiar === f.id ? '2px solid var(--rose)' : '1px solid var(--border)',
                background: 'var(--card2)',
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: familiar === f.id ? '0 0 10px rgba(176,132,148,0.3)' : 'none',
                alignItems: 'center',
                padding: '0.5rem'
              }}
            >
              <img src={f.img} alt={f.label} style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.5rem' }} />
              <div style={{ textAlign: 'center', color: 'var(--rose)', fontSize: '0.9rem', lineHeight: '1.2' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button 
            className="btn plum" 
            style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }} 
            onClick={handleFinish}
            disabled={!avatarVibe || !familiar}
          >
            Manifest the Keeper
          </button>
        </div>
      </div>
    </div>
  );
}

