import React, { useState } from 'react';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';

const ALTARS = [
  { id: 'crown', name: 'Crown', icon: G.crown },
  { id: 'gaze', name: 'Gaze', icon: G.gaze },
  { id: 'grin', name: 'Grin', icon: G.grin },
  { id: 'visage', name: 'Visage', icon: G.visage },
  { id: 'vessel', name: 'Vessel', icon: G.vessel },
];

export default function Altars({ pose }) {
  const [activeAltarId, setActiveAltarId] = useState('crown');
  const [displayedAltar, setDisplayedAltar] = useState('Crown');
  const [opacity, setOpacity] = useState(1);

  const handleTabClick = (id, name) => {
    if (activeAltarId === id) return;
    setActiveAltarId(id);
    setOpacity(0);
    
    setTimeout(() => {
      setDisplayedAltar(name);
      setOpacity(1);
    }, 150);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '1rem' }}>
      <div className="sub" style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {ALTARS.map(altar => (
          <button
            key={altar.id}
            className={`st ${activeAltarId === altar.id ? 'active' : ''}`}
            onClick={() => handleTabClick(altar.id, altar.name)}
            style={{ textAlign: 'left', paddingLeft: '1rem' }}
          >
            <Icon name={altar.icon} /> {`The ${altar.name}`}
          </button>
        ))}
      </div>
      
      <div 
        className="card" 
        style={{ flex: 1, minHeight: '300px', transition: 'opacity 0.3s ease', opacity }}
      >
        <div className="corner tl"></div>
        <div className="corner tr"></div>
        <div className="corner bl"></div>
        <div className="corner br"></div>
        <h3>The {displayedAltar} is Still</h3>
        <div className="mt mb-4">No rites currently inscribed for this domain. The shelves are bare.</div>
      </div>
    </div>
  );
}
