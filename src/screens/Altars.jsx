import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.jsx';
import Icon from '../components/Icon.jsx';
import SpeakerButton from '../components/SpeakerButton.jsx';
import { buildBaseRoutines } from '../lib/routine-engine.js';

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
    if (next.has(id)) {
      next.delete(id);
      const today = new Date().toISOString().split('T')[0];
      supabase.from('routine_history')
        .select('*')
        .contains('items_used', [id])
        .gte('completed_at', today)
        .then(({ data }) => {
          if (data && data.length > 0) {
            data.forEach(row => {
              const updated = row.items_used.filter(x => x !== id);
              if (updated.length === 0) {
                supabase.from('routine_history').delete().eq('id', row.id).then();
              } else {
                supabase.from('routine_history').update({ items_used: updated }).eq('id', row.id).then();
              }
            });
          }
        });
    } else {
      next.add(id);
      supabase.from('routine_history').insert({ completed_at: new Date().toISOString(), items_used: [id] }).then();
    }
    setCheckedIds(next);
  };

  const getGlyph = (item) => {
    if (item.glyph) return item.glyph;
    if (item.domain === 'grin') return 'tooth';
    const cat = (item.category || '').toLowerCase();
    if (cat.includes('cleanser') || cat.includes('wash')) return 'cleanser-tube';
    if (cat.includes('toner') || cat.includes('mist')) return 'toner-bottle';
    if (cat.includes('cream') || cat.includes('moisturizer')) return 'cream-jar';
    if (cat.includes('sunscreen') || cat.includes('spf')) return 'sunscreen';
    if (cat.includes('serum') || cat.includes('oil')) return 'oil-dropper';
    if (item.domain === 'vessel') return 'body-vessel';
    if (item.domain === 'visage') return 'visage-face';
    if (item.domain === 'crown') return 'crown';
    return 'sparkles'; 
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
        <div className="nm" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ color: 'var(--silver)', fontSize: '1.2em', marginRight: '0.4rem', display: 'flex', alignItems: 'center' }}><Icon name={getGlyph(item)} /></span>
          {item.name} 
          <span style={{ marginLeft: '0.4rem', display: 'flex', alignItems: 'center' }}><SpeakerButton text={item.name} /></span>
          {isAid && <span className="aid" title="Partner Assisted"><Icon name={G.tabAltars} /></span>}
        </div>
        <div className="mt">{item.brand ? `${item.brand} ` : ''}{item.desc ? `• ${item.desc}` : ''}</div>
      </div>
    </div>
  );

  const renderAltarContent = () => {
    // Sort items by weight using engine logic
    const { getWeight } = buildBaseRoutines(items, {});
    const domainItems = items
      .filter(i => (i.domain || '').toLowerCase() === activeAltarId)
      .sort((a, b) => getWeight(a) - getWeight(b));

    if (domainItems.length === 0) {
      return <div className="mt mb-4">No rites currently summoned for this domain. The shelves are bare.</div>;
    }

    return (
      <div>
        <div className="mt mb-4" style={{ textAlign: 'center' }}>The Liturgy of Sequence</div>
        
        <div style={{ margin: '0.5rem 0 1rem 0', textAlign: 'center' }}>
          <button 
            className={`btn ${domainItems.every(i => checkedIds.has(i.id)) ? 'g' : 'plum'}`} 
            style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', width: '100%' }}
            onClick={() => {
              const toSave = domainItems.filter(i => !checkedIds.has(i.id)).map(i => i.id);
              if (toSave.length > 0) {
                supabase.from('routine_history').insert({ completed_at: new Date().toISOString(), items_used: toSave }).then();
                const nextChecked = new Set(checkedIds);
                toSave.forEach(id => nextChecked.add(id));
                setCheckedIds(nextChecked);
              }
            }}
            disabled={domainItems.every(i => checkedIds.has(i.id))}
          >
            {domainItems.every(i => checkedIds.has(i.id)) ? 'The Altar is Sealed' : 'Seal the Altar'}
          </button>
        </div>

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
              background: activeAltarId === altar.id ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.65)', 
              color: activeAltarId === altar.id ? 'var(--silver)' : 'var(--plum)',
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
        <h3>The {displayedAltar} <SpeakerButton text={`The ${displayedAltar}`} /></h3>
        {renderAltarContent()}
      </div>
    </div>
  );
}

