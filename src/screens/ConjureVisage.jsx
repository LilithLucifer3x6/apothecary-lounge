import React, { useState } from 'react';

const HAIRSTYLES = [
  { id: 'microlocs', label: 'Microlocs', img: 'hair_microlocs.jpg' },
  { id: 'crownbraid', label: 'Crown Braid', img: 'hair_crownbraid.jpg' },
  { id: 'freeform', label: 'Freeform Locs', img: 'hair_freeform.jpg' },
  { id: 'twinbuns', label: 'Twin Buns', img: 'hair_twinbuns.jpg' }
];

const FAMILIARS = [
  { id: 'cat', label: 'Midnight Cat', img: 'fam_cat_ghibli.jpg' },
  { id: 'raven', label: 'Shadow Raven', img: 'fam_raven_ghibli.jpg' },
  { id: 'bat', label: 'Cave Bat', img: 'fam_bat_ghibli.jpg' },
  { id: 'owl', label: 'Barn Owl', img: 'fam_owl_ghibli.jpg' },
  { id: 'snake', label: 'Emerald Serpent', img: 'fam_snake_ghibli.jpg' }
];

const ROBE_COLORS = [
  { id: 'obsidian', label: 'Obsidian', hex: '#111111' },
  { id: 'crimson', label: 'Crimson', hex: '#8B0000' },
  { id: 'emerald', label: 'Emerald', hex: '#0B3020' },
  { id: 'violet', label: 'Violet', hex: '#3B1E40' },
  { id: 'gold', label: 'Gold', hex: '#B8860B' }
];

export default function ConjureVisage({ onFinish }) {
  const [name, setName] = useState('');
  const [locStyle, setLocStyle] = useState('');
  const [bodyType, setBodyType] = useState('');
  const [robeColor, setRobeColor] = useState('');
  const [familiar, setFamiliar] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState('');

  const handleFinish = () => {
    const config = { name, locStyle, bodyType, robeColor, familiar };
    setGenerating(true);
    setGenPhase('Manifesting your sanctuary...');
    
    setTimeout(() => setGenPhase('Painting the Grimoire...'), 1500);
    setTimeout(() => setGenPhase('Integrating your Keeper...'), 3000);
    setTimeout(() => {
      localStorage.setItem('avatar_config', JSON.stringify(config));
      if (onFinish) onFinish(config);
    }, 4500);
  };

  if (generating) {
    return (
      <div className="land" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--rose)' }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem 4rem', borderRadius: '8px', border: '1px solid var(--plum)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--plum)' }}>{genPhase}</h2>
          <p style={{ color: 'var(--silver)' }}>Integrating your essence into the rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="land" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--rose)', overflowY: 'auto', paddingBottom: '4rem' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', width: '90%', background: 'rgba(5, 3, 10, 0.92)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>Reshape Visage</h1>
        <p style={{ textAlign: 'center', color: 'var(--silver)', marginBottom: '2rem' }}>
          Select your Keeper's true form. The AI will dynamically paint your unique presence into every room of the Sanctuary.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{color: 'var(--plum)'}}>What is your name?</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Name" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>
        
        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>Hairstyle / Locs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {HAIRSTYLES.map(h => (
            <div 
              key={h.id}
              onClick={() => setLocStyle(h.id)}
              style={{
                border: locStyle === h.id ? '2px solid var(--plum)' : '1px solid var(--border)',
                background: 'var(--card2)',
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: locStyle === h.id ? '0 0 15px rgba(176,132,148,0.3)' : 'none',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#000' }}>
                <img src={`/assets/${h.img}`} alt={h.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: locStyle === h.id ? 1 : 0.7 }} />
              </div>
              <div style={{ padding: '0.8rem', textAlign: 'center', color: locStyle === h.id ? 'var(--plum)' : 'var(--silver)', fontSize: '0.9rem', fontWeight: locStyle === h.id ? 'bold' : 'normal' }}>
                {h.label}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>Body Type</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['Plus Size', 'Curvy', 'Slender', 'Athletic'].map(type => (
            <div 
              key={type}
              onClick={() => setBodyType(type)}
              style={{
                border: bodyType === type ? '2px solid var(--plum)' : '1px solid var(--border)',
                background: bodyType === type ? 'rgba(176,132,148,0.2)' : 'var(--card2)',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                color: bodyType === type ? 'var(--plum)' : 'var(--silver)',
                fontWeight: bodyType === type ? 'bold' : 'normal',
                boxShadow: bodyType === type ? '0 0 10px rgba(176,132,148,0.2)' : 'none',
              }}
            >
              {type}
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>Robe Color</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {ROBE_COLORS.map(color => (
            <div 
              key={color.id}
              onClick={() => setRobeColor(color.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: color.hex,
                border: robeColor === color.id ? '3px solid var(--plum)' : '2px solid var(--border)',
                boxShadow: robeColor === color.id ? `0 0 15px ${color.hex}` : 'none',
                transition: 'all 0.2s ease'
              }} />
              <div style={{ fontSize: '0.8rem', color: robeColor === color.id ? 'var(--plum)' : 'var(--silver)' }}>
                {color.label}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>The Familiar</h3>
        <div className="mt mb-4" style={{ color: 'var(--silver)' }}>Select a companion to share your sanctuary.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {FAMILIARS.map(f => (
            <div 
              key={f.id}
              onClick={() => setFamiliar(f.id)}
              style={{
                border: familiar === f.id ? '2px solid var(--plum)' : '1px solid var(--border)',
                background: 'var(--card2)',
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: familiar === f.id ? '0 0 15px rgba(176,132,148,0.3)' : 'none',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#000' }}>
                <img src={`/assets/${f.img}`} alt={f.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: familiar === f.id ? 1 : 0.7 }} />
              </div>
              <div style={{ padding: '0.6rem', textAlign: 'center', color: familiar === f.id ? 'var(--plum)' : 'var(--silver)', fontSize: '0.85rem', fontWeight: familiar === f.id ? 'bold' : 'normal' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <button 
            className="btn plum" 
            style={{ fontSize: '1.2rem', padding: '1rem 3rem', width: '100%' }} 
            onClick={handleFinish}
            disabled={!name || !locStyle || !familiar || !robeColor || !bodyType}
          >
            Generate Integrated Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
}
