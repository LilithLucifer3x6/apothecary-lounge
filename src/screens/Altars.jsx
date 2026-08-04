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
    // Sort items by weight using engine logic
    const { getWeight } = buildRoutines(items, {}, {});
    const domainItems = items
      .filter(i => (i.domain || '').toLowerCase() === activeAltarId)
      .sort((a, b) => getWeight(a) - getWeight(b));

    if (domainItems.length === 0) {
      return <div className="mt mb-4">No rites currently inscribed for this domain. The shelves are bare.</div>;
    }

    return (
      <div>
        <div className="mt mb-4">The Liturgy of Sequence</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {domainItems.map(i => {
            const isOpt = i.category?.toLowerCase().includes('mask') || i.category?.toLowerCase().includes('treatment');
            return renderStep(i, isOpt);
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div className="sub" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: '0.8rem', width: '100%' }}>
        {ALTARS.map(altar => (
          <button
            key={altar.id}
            className="btn"
            onClick={() => handleTabClick(altar.id, altar.name)}
            style={{ 
              textAlign: 'center', 
              padding: '0.6rem 1.2rem', 
              fontSize: '1.2rem', 
              background: activeAltarId === altar.id ? '#000000' : 'transparent', 
              color: activeAltarId === altar.id ? 'var(--parch)' : 'var(--rose)',
              border: activeAltarId === altar.id ? '1px solid var(--plum)' : '1px solid var(--border)',
              boxShadow: activeAltarId === altar.id ? 'inset 0 0 15px rgba(176, 136, 204, 0.3)' : 'none',
              width: 'fit-content',
              transition: 'all 0.2s',
              fontWeight: 'normal'
            }}
          >
            <Icon name={altar.icon} /> {`The ${altar.name}`}
          </button>
        ))}
      </div>
      
      <div className="card" style={{ width: '100%', minHeight: '300px', transition: 'opacity 0.3s ease', opacity }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The {displayedAltar} <span dangerouslySetInnerHTML={{ __html: speakerMarkup(`The ${displayedAltar}`) }} /></h3>
        {renderAltarContent()}
      </div>
    </div>
  );
}
