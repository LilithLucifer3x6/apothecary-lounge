import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.js';

export default function AvatarBuilder({ onComplete }) {
  const [name, setName] = useState('The Keeper');
  const [avatarVibe, setAvatarVibe] = useState('locs');
  const [familiar, setFamiliar] = useState('none');

  const avatars = [
    { id: 'locs', label: 'The Alchemist', img: '/assets/avatar_locs.jpg', desc: 'Microlocs, Crimson Robes, Grimoire' },
    { id: 'buns', label: 'The Diviner', img: '/assets/avatar_buns.jpg', desc: 'Twin Buns, Plum Outfit, Glowing Potion' }
  ];

  const familiars = [
    { id: 'none', label: 'None', glyph: G.optNone },
    { id: 'cat', label: 'Black Cat', glyph: 'ph-duotone ph-cat' },
    { id: 'raven', label: 'Raven', glyph: 'ph-duotone ph-bird' },
    { id: 'moth', label: 'Luna Moth', glyph: 'ph-duotone ph-butterfly' },
    { id: 'hound', label: 'Hound', glyph: 'ph-duotone ph-dog' }
  ];

  const handleFinish = () => {
    const config = { name, avatarVibe, familiar };
    localStorage.setItem('avatar_config', JSON.stringify(config));
    if (onComplete) onComplete(config);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '3.5rem', textAlign: 'center', color: 'var(--rose)', marginBottom: '2rem' }}>
        Who enters the Lounge?
      </h2>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Keeper's Visage</h3>
        <div className="mt mb-4">Select the form that best reflects your practice.</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {avatars.map(av => (
            <div 
              key={av.id}
              onClick={() => setAvatarVibe(av.id)}
              style={{ 
                border: avatarVibe === av.id ? '2px solid var(--gold)' : '2px solid transparent',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                background: 'var(--bg)',
                boxShadow: avatarVibe === av.id ? '0 0 15px rgba(128,96,21,0.4)' : 'none'
              }}
            >
              <img src={av.img} alt={av.label} style={{ width: '120px', height: '160px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--rose)', fontWeight: 'bold' }}>{av.label}</div>
                <div className="mt">{av.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Name</h3>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)}
          placeholder="By what name are you known?" 
          style={{ width: '100%', padding: '1rem', marginTop: '1rem' }}
        />

        <h3 style={{ marginTop: '2rem' }}>The Familiar</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          {familiars.map(f => (
            <div 
              key={f.id}
              onClick={() => setFamiliar(f.id)}
              style={{
                padding: '1rem',
                border: familiar === f.id ? '2px solid var(--crimson-b)' : '1px solid var(--border)',
                background: familiar === f.id ? 'var(--card2)' : 'var(--bg)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '1 1 calc(33% - 1rem)',
                minWidth: '100px',
                color: familiar === f.id ? 'var(--crimson-b)' : 'var(--ash)'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                <Icon name={f.glyph} />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button className="btn plum" style={{ fontSize: '1.5rem', padding: '1rem 3rem' }} onClick={handleFinish}>
          The Keeper is Ready
        </button>
      </div>
    </div>
  );
}
