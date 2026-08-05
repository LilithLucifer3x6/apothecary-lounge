import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.jsx';
import Icon from '../components/Icon.jsx';
import SpeakerButton from '../components/SpeakerButton.jsx';
import { buildRoutines, checkConflicts } from '../lib/routine-engine.js';
import { getReadiness, getHeavySweat, getSleepDuration } from '../lib/health-connect.js';

export default function Rites({ pose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amItems, setAmItems] = useState([]);
  const [pmItems, setPmItems] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [amSaving, setAmSaving] = useState(false);
  const [amSaved, setAmSaved] = useState(false);
  const [pmSaving, setPmSaving] = useState(false);
  const [pmSaved, setPmSaved] = useState(false);

  const todayKey = new Date().toISOString().split('T')[0];
  const [scheduleChecked, setScheduleChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(`schedule_${todayKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch(e) { return new Set(); }
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data } = await supabase
        .from('items')
        .select('*')
        .in('lifecycle_state', ['stocked', 'ebbing', 'enshrined'])
        .order('category', { ascending: true });
        
      const itemsArr = data || [];
      setItems(itemsArr);
      
      const sleepDuration = await getSleepDuration();
      const heavySweat = await getHeavySweat();
      const readinessObj = await getReadiness();
      
      const realWearables = {
        sleepDuration: parseFloat(sleepDuration),
        heavySweat: heavySweat,
        readiness: readinessObj?.score || 100
      };
      
      const { data: userProfile } = await supabase.from('user_profile').select('*').maybeSingle();
      const { amItems: am, pmItems: pm } = await buildRoutines(itemsArr, userProfile || {}, realWearables);
      
      const { data: isoLog } = await supabase.from('isotretinoin_log').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
      const nextDose = isoLog ? (isoLog.last_confirmed_dose_mg === 40 ? 80 : 40) : 40;
      
      const isoItem = {
        id: `iso-${nextDose}`,
        name: `Isotretinoin, oral (${nextDose}mg)`,
        category: 'immutable',
        isInjected: true,
        desc: 'Systemic / Morning Rite',
        isRx: true,
        glyph: 'pill'
      };
      
      setAmItems([isoItem, ...am]);
      setPmItems(pm);
      setConflicts(checkConflicts(itemsArr, userProfile || {}));
      
      setLoading(false);
    }
    
    fetchData();
  }, []);

  const handleSaveAm = async () => {
    setAmSaving(true);
    const amChecked = amItems.filter(i => checkedIds.has(i.id)).map(i => i.id);
    if (amChecked.length > 0) {
      await supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: amChecked
      });
    }
    setAmSaved(true);
    setAmSaving(false);
  };

  const handleSavePm = async () => {
    setPmSaving(true);
    const pmChecked = pmItems.filter(i => checkedIds.has(i.id)).map(i => i.id);
    if (pmChecked.length > 0) {
      await supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: pmChecked
      });
    }
    setPmSaved(true);
    setPmSaving(false);
  };

  function getRitualDate() {
    const d = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const day = d.getDate();
    let suffix = "th";
    if (day % 10 === 1 && day !== 11) suffix = "st";
    else if (day % 10 === 2 && day !== 12) suffix = "nd";
    else if (day % 10 === 3 && day !== 13) suffix = "rd";
    return `The ${day}${suffix} of ${months[d.getMonth()]}`;
  }

  if (loading) {
    return (
      <div className="card">
        <div className="empty">Consulting the rites...</div>
      </div>
    );
  }

  const handleScheduleCheck = (time) => {
    const newChecked = new Set(scheduleChecked);
    if (newChecked.has(time)) newChecked.delete(time);
    else newChecked.add(time);
    setScheduleChecked(newChecked);
    localStorage.setItem(`schedule_${todayKey}`, JSON.stringify(Array.from(newChecked)));
  };

  const handleCheck = async (id) => {
    const newChecked = new Set(checkedIds);
    const isNowChecked = !newChecked.has(id);
    
    if (isNowChecked) {
      newChecked.add(id);
      if (id.startsWith('iso-')) {
        const dose = parseInt(id.split('-')[1]);
        supabase.from('isotretinoin_log').insert({ last_confirmed_dose_mg: dose }).then();
      } else {
        supabase.from('routine_history').insert({ completed_at: new Date().toISOString(), items_used: [id] }).then();
      }
    } else {
      newChecked.delete(id);
      if (id.startsWith('iso-')) {
        // Technically unchecking could mean deleting the last log, but for safety we just ignore unchecks on rx.
      } else {
        const today = new Date().toISOString().split('T')[0];
        supabase.from('routine_history').select('*').contains('items_used', [id]).gte('completed_at', today)
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
      }
    }
    setCheckedIds(newChecked);
  };

  const handleCompleteAllAm = async () => {
    setAmSaving(true);
    const toSave = amItems.filter(i => !checkedIds.has(i.id)).map(i => i.id);
    if (toSave.length > 0) {
      await supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: toSave
      });
      const newChecked = new Set(checkedIds);
      toSave.forEach(id => newChecked.add(id));
      setCheckedIds(newChecked);
    }
    setAmSaved(true);
    setAmSaving(false);
  };

  const handleCompleteAllPm = async () => {
    setPmSaving(true);
    const toSave = pmItems.filter(i => !checkedIds.has(i.id)).map(i => i.id);
    if (toSave.length > 0) {
      await supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: toSave
      });
      const newChecked = new Set(checkedIds);
      toSave.forEach(id => newChecked.add(id));
      setCheckedIds(newChecked);
    }
    setPmSaved(true);
    setPmSaving(false);
  };

  const renderScheduleStep = (time, desc, color) => (
    <div className="step" style={{ borderLeft: `3px solid ${color}` }}>
      <input 
        type="checkbox" 
        checked={scheduleChecked.has(time)}
        onChange={() => handleScheduleCheck(time)}
      />
      <div style={{ flex: 1 }}>
        <div className="nm" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {time} 
          <SpeakerButton text={`${time}. ${desc}`} style={{ marginLeft: '0.4rem' }} />
        </div>
        <div className="mt">{desc}</div>
      </div>
    </div>
  );

  const getDisplayName = (item) => {
    if (item.isInjected || item.category === 'immutable') return item.name;
    
    const cat = (item.category || '').toLowerCase();
    const isRx = item.risk_flags?.retinoid || item.name.toLowerCase().includes('tacrolimus') || item.name.toLowerCase().includes('drysol');
    if (isRx) return 'Apply Treatment (Elixir)';

    if (cat.includes('cleanser') || cat.includes('wash')) return 'Cleanse (' + cat + ')';
    if (cat.includes('toner') || cat.includes('essence') || cat.includes('mist')) return 'Tone (' + cat + ')';
    if (cat.includes('serum') || cat.includes('ampoule')) return 'Treat (' + cat + ')';
    if (cat.includes('lotion') || cat.includes('emulsion') || cat.includes('cream') || cat.includes('moisturizer')) return 'Moisturize (' + cat + ')';
    if (cat.includes('oil')) return 'Seal (' + cat + ')';
    if (cat.includes('sunscreen') || cat.includes('spf')) return 'Sun Protection (' + cat + ')';
    
    if (cat) {
      return cat.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return item.name;
  };

  const renderStep = (item, isOpt = false, isRx = false, isAid = false) => {
    const rxClass = isRx ? 'rx' : '';
    const optClass = isOpt ? 'opt' : '';
    
    const displayName = getDisplayName(item);
    
    const getGlyph = (item) => {
      if (item.glyph) return item.glyph;
      if (item.domain === 'grin') return 'tooth';
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('cleanser') || cat.includes('wash')) return 'cleanser-tube';
      if (cat.includes('toner') || cat.includes('mist')) return 'toner-bottle';
      if (cat.includes('cream') || cat.includes('moisturizer')) return 'cream-jar';
      if (cat.includes('sunscreen') || cat.includes('spf')) return 'sunscreen';
      if (cat.includes('serum') || cat.includes('oil')) return 'oil-dropper';
      if (item.isRx) return 'rx-tube';
      if (item.domain === 'vessel') return 'body-vessel';
      if (item.domain === 'visage') return 'visage-face';
      return 'sparkles'; 
    };
    
    return (
      <div key={item.id} className={`step ${optClass}`}>
        {isOpt ? (
          <label className="sw">
            <input type="checkbox" />
            <span className="sl"></span>
          </label>
        ) : (
          <input 
            type="checkbox" 
            className="step-chk" 
            checked={checkedIds.has(item.id)}
            onChange={() => handleCheck(item.id)} 
          />
        )}
        <div style={{ flex: 1 }}>
          <div className={`nm ${rxClass}`} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
            <span style={{ color: 'var(--silver)' }}><Icon name={getGlyph(item)} /></span>
            {displayName} 
            <SpeakerButton text={displayName} />
            {isAid && <span className="aid" title="Partner Assisted"><Icon name={G.tabAltars} /></span>}
          </div>
          {item.isInjected ? (
            <div className="mt" style={{opacity: 0.8}}>{item.desc || 'The Foundation'}</div>
          ) : (
            <div className="mt">{item.brand || 'Elixir'} &bull; {item.storage_location || 'The Vanity'}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        fontSize: '1.6rem',
        color: 'var(--rose)',
        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px #000'
      }}>
        {getRitualDate()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start', marginTop: '1.5rem', maxWidth: '1200px', margin: '1.5rem auto 0 auto' }}>
        
        {/* Left Column: Morning Invocation */}
        <div className="card">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Morning Invocation <SpeakerButton text='The Morning Invocation' /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {amItems.length > 0 ? amItems.map(i => renderStep(i)) : <div className="empty">The altar is bare. No morning rites are required.</div>}
            {amItems.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className={`btn ${amSaved || amItems.every(i => checkedIds.has(i.id)) ? 'g' : 'plum'}`} 
                  style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', width: '100%' }}
                  onClick={handleCompleteAllAm}
                  disabled={amSaving || amSaved || amItems.every(i => checkedIds.has(i.id))}
                >
                  {amSaved || amItems.every(i => checkedIds.has(i.id)) ? 'The Morning Rites are Concluded' : 'Conclude All Morning Rites'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: The Long Hours */}
        <div className="card">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Long Hours <SpeakerButton text='The Long Hours' /></h3>
          <div className="mt mb-4" style={{ textAlign: 'center' }}>The Order of the Day</div>
          
          {renderScheduleStep('The Awakening', 'Allow 5 to 10 minutes for the veil of sleep to lift.', 'var(--crimson-b)')}
          {renderScheduleStep('The Morning Respite', 'A 15-minute sanctuary. Imbibe 16 ounces of pure water.', 'var(--rose)')}
          {renderScheduleStep('The Midday Sustenance', 'A 45-minute pause for nourishment. Engage in gentle movement to stir stagnant energies.', 'var(--rose)')}
          {renderScheduleStep('The Afternoon Respite', 'A 15-minute sanctuary. Imbibe 16 ounces of pure water.', 'var(--rose)')}
          {renderScheduleStep('The Descent', 'The day\'s labors conclude. Begin the grounding process to sever ties with the work.', 'var(--plum)')}
        </div>

        {/* Right Column: Evening Invocation */}
        <div className="card">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Evening Invocation <SpeakerButton text='The Evening Invocation' /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {pmItems.length > 0 ? pmItems.map(i => renderStep(i)) : <div className="empty">The altar is bare. No evening rites are required.</div>}
            {pmItems.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className={`btn ${pmSaved || pmItems.every(i => checkedIds.has(i.id)) ? 'g' : 'plum'}`} 
                  style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', width: '100%' }}
                  onClick={handleCompleteAllPm}
                  disabled={pmSaving || pmSaved || pmItems.every(i => checkedIds.has(i.id))}
                >
                  {pmSaved || pmItems.every(i => checkedIds.has(i.id)) ? 'The Evening Rites are Concluded' : 'Conclude All Evening Rites'}
                </button>
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Keeper's Warning (Full Width Below) */}
      {conflicts.length > 0 && (
        <div className="card mt-4" style={{ background: 'var(--card-bg-alt, rgba(100,20,20,0.5))', borderColor: '#882222' }}>
          <h3 style={{ color: 'var(--rose)' }}>The Keeper's Warning <SpeakerButton text="The Keeper's Warning" /></h3>
          <ul style={{ marginTop: '0.5rem', color: 'var(--rose)', paddingLeft: '1.5rem' }}>
            {conflicts.map((c, idx) => (
              <li key={idx}>
                {c} <SpeakerButton text={c} style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

