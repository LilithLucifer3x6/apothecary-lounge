import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { speakerMarkup } from '../lib/tts.js';
import { buildRoutines } from '../lib/routine-engine.js';

const ALTARS = [
  { id: 'crown', name: 'Crown', icon: G.crown },
  { id: 'gaze', name: 'Gaze', icon: G.gaze },
  { id: 'grin', name: 'Grin', icon: G.grin },
  { id: 'visage', name: 'Visage', icon: G.visage },
  { id: 'vessel', name: 'Vessel', icon: G.vessel },
];

const GRIN_SEQUENCE = [
  { id: 'grin-1', name: 'Floss Picks', desc: 'Clear the interdental spaces.', brand: 'Fixed Sequence' },
  { id: 'grin-2', name: 'Water Pick', desc: 'Flush the gumline.', brand: 'Fixed Sequence' },
  { id: 'grin-3', name: 'Mouthwash', desc: 'Purify the oral cavity.', brand: 'Fixed Sequence' },
  { id: 'grin-4', name: 'Brush Teeth', desc: 'Cleanse the enamel.', brand: 'Fixed Sequence' },
];

export default function Altars({ pose }) {
  const [activeAltarId, setActiveAltarId] = useState('crown');
  const [displayedAltar, setDisplayedAltar] = useState('Crown');
  const [opacity, setOpacity] = useState(1);
  const [items, setItems] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());
  
  useEffect(() => {
    supabase.from('items').select('*').in('lifecycle_state', ['stocked', 'ebbing', 'enshrined']).then(({ data }) => {
      if (data) setItems(data);
    });
  }, []);

  const handleTabClick = (id, name) => {
    if (activeAltarId === id) return;
    setActiveAltarId(id);
    setOpacity(0);
    setTimeout(() => {
      setDisplayedAltar(name);
      setOpacity(1);
    }, 150);
  };

  const handleCheck = (id) => {
    const next = new Set(checkedIds);
    if (next.has(id)) next.delete(id);
    else {
      next.add(id);
      supabase.from('routine_history').insert({ completed_at: new Date().toISOString(), items_used: [id] }).then();
    }
    setCheckedIds(next);
  };

  const renderStep = (item, isOpt = false, isAid = false) => (
    <div key={item.id} className={`step ${isOpt ? 'opt' : ''}`}>
      {isOpt ? (
        <label className="sw">
          <input type="checkbox" />
          <span className="sl"></span>
        </label>
      ) : (
        <input type="checkbox" className="step-chk" checked={checkedIds.has(item.id)} onChange={() => handleCheck(item.id)} />
      )}
      <div style={{ flex: 1 }}>
        <div className="nm" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {item.name} 
          <span style={{ marginLeft: '0.4rem' }} dangerouslySetInnerHTML={{ __html: speakerMarkup(item.name) }} />
          {isAid && <span className="aid" title="Partner Assisted"><Icon name={G.tabAltars} /></span>}
        </div>
        <div className="mt">{item.brand || 'Altar Step'} {item.desc ? `• ${item.desc}` : ''}</div>
      </div>
    </div>
  );

  const renderAltarContent = () => {
    if (activeAltarId === 'grin') {
      return (
        <div>
          <div className="mt mb-4">The Ritual of the Grin (Fixed Sequence)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {GRIN_SEQUENCE.map(i => renderStep(i))}
          </div>
        </div>
      );
    }
    
    // Sort items by weight using engine logic
    const { getWeight } = buildRoutines(items, {}, {});
    const domainItems = items
      .filter(i => (i.domain || '').toLowerCase() === activeAltarId)
      .sort((a, b) => getWeight(a) - getWeight(b));

    if (domainItems.length === 0 && activeAltarId !== 'vessel') {
      return <div className="mt mb-4">No rites currently inscribed for this domain. The shelves are bare.</div>;
    }

    return (
      <div>
        <div className="mt mb-4">Executable Order</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {domainItems.map(i => {
            const isOpt = i.category?.toLowerCase().includes('mask') || i.category?.toLowerCase().includes('treatment');
            return renderStep(i, isOpt);
          })}
          
          {activeAltarId === 'vessel' && (
            <>
              <div className="mt mb-4 mt-4" style={{borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
                The Bath Ritual (Optional, Prefer Weekends)
              </div>
              {renderStep({ id: 'bath-ritual-1', name: 'The Bath Soak', brand: 'Every 2 Weeks', desc: 'Milk powder, orange peel powder, rose petals powder, epsom salts.' }, true)}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <div className="sub" style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1 1 200px' }}>
        {ALTARS.map(altar => (
          <button
            key={altar.id}
            className={`btn ${activeAltarId === altar.id ? 'plum' : ''}`}
            onClick={() => handleTabClick(altar.id, altar.name)}
            style={{ textAlign: 'left', padding: '0.8rem 1rem', fontSize: '1.1rem', background: activeAltarId === altar.id ? 'var(--plum)' : 'rgba(0,0,0,0.5)', color: 'var(--rose)', width: '100%' }}
          >
            <Icon name={altar.icon} /> {`The ${altar.name}`}
          </button>
        ))}
      </div>
      
      <div className="card" style={{ flex: '1 1 400px', minHeight: '300px', transition: 'opacity 0.3s ease', opacity }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The {displayedAltar} <span dangerouslySetInnerHTML={{ __html: speakerMarkup(`The ${displayedAltar}`) }} /></h3>
        {renderAltarContent()}
      </div>
    </div>
  );
}
