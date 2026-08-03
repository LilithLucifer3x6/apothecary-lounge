import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

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
    { id: 'cat', label: 'Midnight Cat', img: '/assets/fam_cat.jpg' },
    { id: 'raven', label: 'Watchful Raven', img: '/assets/fam_raven.jpg' },
    { id: 'moth', label: 'Luna Moth', img: '/assets/fam_moth.jpg' },
    { id: 'hound', label: 'Shadow Hound', img: '/assets/fam_hound.jpg' },
    { id: 'toad', label: 'Forest Toad', img: '/assets/fam_toad.jpg' },
    { id: 'spider', label: 'Weaver Spider', img: '/assets/fam_spider.jpg' },
    { id: 'snake', label: 'Garden Serpent', img: '/assets/fam_snake.jpg' }
  ];

  const handleFinish = () => {
    if (!avatarVibe || !familiar) return;
    const config = { name, avatarVibe, familiar };
    localStorage.setItem('avatar_config', JSON.stringify(config));
    if (onComplete) onComplete(config);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--rose)' }}>
      <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '3.5rem', textAlign: 'center', color: 'var(--rose)', marginBottom: '2rem' }}>
        Conjure Your Visage
      </h2>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3 style={{ color: 'var(--rose)' }}>The Keeper's Form</h3>
        <div className="mt mb-4" style={{ color: 'var(--rose)' }}>Select the visage that best reflects your practice.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
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
                flexDirection: 'column'
              }}
            >
              <img src={av.img} alt={av.label} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--rose)', fontWeight: 'bold', marginBottom: '0.5rem' }}>{av.label}</div>
                <div className="mt" style={{ fontSize: '0.85rem', color: 'var(--rose)' }}>{av.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3 style={{ color: 'var(--rose)' }}>The Name</h3>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="By what name are you known?" 
          style={{ width: '100%', padding: '1rem', marginTop: '1rem', color: 'var(--rose)' }}
        />

        <h3 style={{ marginTop: '2rem', color: 'var(--rose)' }}>The Familiar</h3>
        <div className="mt mb-4" style={{ color: 'var(--rose)' }}>Select a companion to share your sanctuary.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
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
                boxShadow: familiar === f.id ? '0 0 10px rgba(176,132,148,0.3)' : 'none'
              }}
            >
              <img src={f.img} alt={f.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
              <div style={{ padding: '0.5rem', textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold', color: 'var(--rose)', fontSize: '0.9rem' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button 
            className="btn plum" 
            style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} 
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
