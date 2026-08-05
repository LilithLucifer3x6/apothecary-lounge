import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import { supabase } from '../lib/supabase.js';

export default function ConjureVisage({ onComplete }) {
  const [name, setName] = useState('The Keeper');
  const [bodyType, setBodyType] = useState('Plus Size');
  const [locStyle, setLocStyle] = useState('Microlocs');
  const [robeColor, setRobeColor] = useState('Crimson');
  const [familiar, setFamiliar] = useState('raven');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const familiars = [
    { id: 'cat', label: 'Midnight Cat', icon: 'cat' },
    { id: 'raven', label: 'Watchful Raven', icon: 'bird' },
    { id: 'bat', label: 'Shadow Bat', icon: 'bat' },
    { id: 'owl', label: 'Mystic Owl', icon: 'owl' },
    { id: 'serpent', label: 'Garden Serpent', icon: 'snake' }
  ];

  const handleFinish = async () => {
    if (!name || !robeColor || !familiar) return;
    
    // Enforce No Pink/Blue rule gracefully
    const lowerColor = robeColor.toLowerCase();
    if (lowerColor.includes('pink') || lowerColor.includes('blue')) {
      alert("Pink and blue are forbidden for the Keeper's Robe, though they may appear in the atmospheric lighting. Please choose another color.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Communing with the spirits of Studio Ghibli...');
    
    // Simulate the live AI image generation API
    await new Promise(r => setTimeout(r, 1500));
    setGenerationStep('Painting the Landing Room...');
    await new Promise(r => setTimeout(r, 1000));
    setGenerationStep('Painting the Grimoire...');
    await new Promise(r => setTimeout(r, 1000));
    setGenerationStep('Painting the Scrying Pool...');
    await new Promise(r => setTimeout(r, 1000));
    setGenerationStep('Integrating your Keeper and Familiar into the Sanctuary...');
    await new Promise(r => setTimeout(r, 1500));

    const config = { name, bodyType, locStyle, robeColor, familiar, style: 'Studio Ghibli / Castlevania' };
    localStorage.setItem('avatar_config', JSON.stringify(config));
    
    try {
      const { data: profile } = await supabase.from('user_profile').select('id').maybeSingle();
      if (profile) {
        await supabase.from('user_profile').update({ avatar_config: config }).eq('id', profile.id);
      }
    } catch(e) {
      console.warn('Could not sync avatar to backend', e);
    }
    
    setIsGenerating(false);
    if (onComplete) onComplete(config);
  };

  if (isGenerating) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '2rem', textAlign: 'center', color: 'var(--plum)' }}>
        <Icon name="sparkles" size={64} className="spin" style={{ color: 'var(--plum)', marginBottom: '2rem' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Manifesting the Sanctuary</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--silver)' }}>{generationStep}</p>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--dim)' }}>(Live AI Generation in Progress)</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', color: 'var(--plum)' }}>
      <h2 style={{ fontSize: '2.5rem', textAlign: 'center', color: 'var(--plum)', marginBottom: '1rem' }}>
        Conjure Your Visage
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--silver)', fontSize: '1.1rem' }}>
        The Sanctuary will be dynamically painted around you in a breathtaking Studio Ghibli style.
      </p>

      <div className="card">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3 style={{ color: 'var(--plum)' }}>The Keeper's Essence</h3>
        
        <div className="field mt-4">
          <label style={{color: 'var(--plum)'}}>By what name shall the lounge address you?</label>
          <VoiceInput 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="The Keeper" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>

        <div className="field">
          <label style={{color: 'var(--plum)'}}>Loc Style</label>
          <input 
            type="text" 
            value={locStyle} 
            onChange={e => setLocStyle(e.target.value)} 
            placeholder="e.g. Microlocs, Traditional Locs" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>

        <div className="field">
          <label style={{color: 'var(--plum)'}}>Body Type</label>
          <input 
            type="text" 
            value={bodyType} 
            onChange={e => setBodyType(e.target.value)} 
            placeholder="e.g. Plus Size, Petite" 
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }}
          />
        </div>

        <div className="field">
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
        <div className="mt mb-4" style={{ color: 'var(--silver)' }}>Select a companion to share your sanctuary. (No spiders allowed).</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {familiars.map(f => (
            <div 
              key={f.id}
              onClick={() => setFamiliar(f.id)}
              style={{
                border: familiar === f.id ? '1px solid var(--plum)' : '1px solid var(--border)',
                background: familiar === f.id ? 'rgba(0,0,0,0.4)' : 'var(--card2)',
                borderRadius: '8px',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: familiar === f.id ? '0 0 10px rgba(176,132,148,0.2)' : 'none',
                alignItems: 'center',
                padding: '1rem'
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', opacity: familiar === f.id ? 1 : 0.6 }}>
                <Icon name={f.icon === 'bird' ? 'ph-bird' : f.icon === 'bat' ? 'ph-bat' : f.icon === 'owl' ? 'ph-owl' : f.icon === 'snake' ? 'ph-bug' : 'ph-cat'} style={{fontSize: '2.5rem', color: familiar === f.id ? 'var(--plum)' : 'var(--silver)'}} />
              </div>
              <div style={{ textAlign: 'center', color: familiar === f.id ? 'var(--plum)' : 'var(--silver)', fontSize: '0.9rem', lineHeight: '1.2', fontWeight: familiar === f.id ? 'bold' : 'normal' }}>
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
