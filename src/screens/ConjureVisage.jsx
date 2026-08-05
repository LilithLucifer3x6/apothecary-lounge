import React, { useState } from 'react';
import { Icon } from '../lib/icons.jsx';

export default function ConjureVisage({ onFinish }) {
  const [name, setName] = useState('');
  const [locStyle, setLocStyle] = useState('');
  const [bodyType, setBodyType] = useState('plus');
  const [robeColor, setRobeColor] = useState('');
  const [familiar, setFamiliar] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState('');

  const familiars = [
    { id: 'cat', label: 'Midnight Cat', icon: 'ph-cat' },
    { id: 'raven', label: 'Shadow Raven', icon: 'ph-bird' },
    { id: 'bat', label: 'Cave Bat', icon: 'ph-bat' },
    { id: 'owl', label: 'Barn Owl', icon: 'ph-owl' },
    { id: 'snake', label: 'Emerald Serpent', icon: 'ph-bug' }
  ];

  const handleFinish = () => {
    const config = { name, locStyle, bodyType, robeColor, familiar };
    const lowerRobe = robeColor.toLowerCase();
    
    if (lowerRobe.includes('pink') || lowerRobe.includes('blue')) {
      alert("The Keeper's Code: Pink and Blue are forbidden for the robe itself, though they may appear in atmospheric lighting. Please choose another color.");
      return;
    }

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
    <div className="land" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)', color: 'var(--rose)' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', width: '90%', background: 'rgba(5, 3, 10, 0.92)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>Reshape Visage</h1>
        <p style={{ textAlign: 'center', color: 'var(--silver)', marginBottom: '2rem' }}>
          Describe your Keeper's true form. Upon generation, the AI will dynamically paint your unique presence into every room of the Sanctuary.
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
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{color: 'var(--plum)'}}>Describe your Locs</label>
          <input 
            type="text" 
            value={locStyle} 
            onChange={e => setLocStyle(e.target.value)} 
            placeholder="e.g. Microlocs with silver cuffs" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{color: 'var(--plum)'}}>Body Type</label>
          <select 
            value={bodyType} 
            onChange={e => setBodyType(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          >
            <option value="plus">Plus Size / Full Figure</option>
            <option value="curvy">Curvy</option>
            <option value="slender">Slender</option>
            <option value="athletic">Athletic</option>
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{color: 'var(--plum)'}}>Robe Color</label>
          <div style={{ color: 'var(--dim)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Note: Pink and Blue are forbidden for the robe.</div>
          <input 
            type="text" 
            value={robeColor} 
            onChange={e => setRobeColor(e.target.value)} 
            placeholder="e.g. Crimson, Emerald, Obsidian" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>

        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>The Familiar</h3>
        <div className="mt mb-4" style={{ color: 'var(--silver)' }}>Select a companion to share your sanctuary.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {familiars.map(f => (
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
                alignItems: 'center',
                padding: '1.5rem 1rem',
                boxShadow: familiar === f.id ? '0 0 15px rgba(176,132,148,0.3)' : 'none',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: familiar === f.id ? 1 : 0.6 }}>
                <Icon name={f.icon} style={{fontSize: '2.5rem', color: familiar === f.id ? 'var(--plum)' : 'var(--silver)'}} />
              </div>
              <div style={{ padding: '0.6rem', textAlign: 'center', color: familiar === f.id ? 'var(--plum)' : 'var(--silver)', fontSize: '0.85rem', fontWeight: familiar === f.id ? 'bold' : 'normal' }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            className="btn plum" 
            style={{ fontSize: '1.2rem', padding: '1rem 3rem', width: '100%' }} 
            onClick={handleFinish}
            disabled={!name || !locStyle || !familiar || !robeColor}
          >
            Generate Integrated Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
}
