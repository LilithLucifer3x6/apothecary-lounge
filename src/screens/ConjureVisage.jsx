import React, { useState } from 'react';

const KEEPERS = [
  { id: 'k1', img: 'keeper_portrait_1_1785951140282.jpg', label: 'Twin Buns' },
  { id: 'k2', img: 'keeper_portrait_2_1785951172627.jpg', label: 'Crown Braid' },
  { id: 'k3', img: 'keeper_portrait_plus_1_1785951208706.jpg', label: 'Plus Size Locs' },
  { id: 'k4', img: 'keeper_portrait_plus_2_1785951224612.jpg', label: 'Plus Size Crown' }
];

const FAMILIARS = [
  { id: 'cat', img: 'familiar_cat.jpg', label: 'Midnight Cat' },
  { id: 'raven', img: 'familiar_raven.jpg', label: 'Shadow Raven' },
  { id: 'bat', img: 'fam_bat.jpg', label: 'Cave Bat' },
  { id: 'owl', img: 'fam_owl.jpg', label: 'Barn Owl' },
  { id: 'snake', img: 'familiar_serpent.jpg', label: 'Emerald Serpent' }
];

export default function ConjureVisage({ onFinish }) {
  const [name, setName] = useState('');
  const [robeColor, setRobeColor] = useState('');
  const [keeper, setKeeper] = useState('');
  const [familiar, setFamiliar] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genPhase, setGenPhase] = useState('');

  const handleFinish = () => {
    const config = { name, robeColor, keeper, familiar };
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
      <div className="land" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundImage: "url('/assets/scrying_room_integrated_1785951349035.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', color: 'var(--rose)' }}>
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '2rem 4rem', borderRadius: '8px', border: '1px solid var(--plum)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--plum)' }}>{genPhase}</h2>
          <p style={{ color: 'var(--silver)' }}>Integrating your essence into the rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="land" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundImage: "url('/assets/landing_room_integrated_1785951335942.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', color: 'var(--rose)' }}>
      <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', width: '90%', background: 'rgba(5, 3, 10, 0.92)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2.5rem' }}>Reshape Visage</h1>
        <p style={{ textAlign: 'center', color: 'var(--silver)', marginBottom: '2rem' }}>
          Define your Keeper. The system will dynamically integrate your presence into every room.
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

        <h3 style={{ marginTop: '2rem', color: 'var(--plum)' }}>The Keeper</h3>
        <div className="mt mb-4" style={{ color: 'var(--silver)' }}>Select your base essence.</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {KEEPERS.map(k => (
            <div 
              key={k.id}
              onClick={() => setKeeper(k.id)}
              style={{
                border: keeper === k.id ? '2px solid var(--plum)' : '1px solid var(--border)',
                background: 'var(--card2)',
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: keeper === k.id ? '0 0 15px rgba(176,132,148,0.3)' : 'none',
              }}
            >
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#000' }}>
                <img src={`/assets/${k.img}`} alt={k.label} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: keeper === k.id ? 1 : 0.7 }} />
              </div>
              <div style={{ padding: '0.8rem', textAlign: 'center', color: keeper === k.id ? 'var(--plum)' : 'var(--silver)', fontSize: '0.9rem', fontWeight: keeper === k.id ? 'bold' : 'normal' }}>
                {k.label}
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

        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button 
            className="btn plum" 
            style={{ fontSize: '1.2rem', padding: '1rem 3rem', width: '100%' }} 
            onClick={handleFinish}
            disabled={!name || !keeper || !familiar || !robeColor}
          >
            Generate Integrated Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
}
