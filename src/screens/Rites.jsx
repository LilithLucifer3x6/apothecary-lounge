import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { speakerMarkup } from '../lib/tts.js';
import { buildRoutines, checkConflicts } from '../lib/routine-engine.js';

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
  const [showTitration, setShowTitration] = useState(false);
  const [titrationResponse, setTitrationResponse] = useState(null);

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
      
      const mockWearables = {
        sleepDuration: 5.5,
        heavySweat: true
      };
      
      const { data: userProfile } = await supabase.from('user_profile').select('*').maybeSingle();
      const { amItems: am, pmItems: pm } = buildRoutines(itemsArr, userProfile || {}, mockWearables);
      setAmItems(am);
      setPmItems(pm);
      setConflicts(checkConflicts(itemsArr, userProfile || {}));
      
      const hasTret = pm.some(i => (i.name || '').toLowerCase().includes('tretinoin') || (i.category || '').toLowerCase().includes('retinoid'));
      if (hasTret && !localStorage.getItem('titration_checked_today')) {
        setShowTitration(true);
      }
      
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
      // Individually log completion to database immediately
      supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: [id]
      }).then();
    } else {
      newChecked.delete(id);
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
          <span style={{ marginLeft: '0.4rem' }} dangerouslySetInnerHTML={{ __html: speakerMarkup(`${time}. ${desc}`) }} />
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
          <div className={`nm ${rxClass}`} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {displayName} 
            <span style={{ marginLeft: '0.4rem' }} dangerouslySetInnerHTML={{ __html: speakerMarkup(displayName) }} />
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
        fontFamily: "'Cormorant Garamond', serif", 
        fontStyle: 'italic', 
        fontSize: '1.6rem',
        fontWeight: 'normal',
        color: 'var(--rose)',
        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px #000'
      }}>
        {getRitualDate()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start', marginTop: '1.5rem', maxWidth: '1200px', margin: '1.5rem auto 0 auto' }}>
        
        {/* Left Column: Morning Invocation */}
        <div className="card">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Morning Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Morning Invocation') }} /></h3>
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
          <h3>The Long Hours <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Long Hours') }} /></h3>
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
          <h3>The Evening Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Evening Invocation') }} /></h3>
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
          <h3 style={{ color: 'var(--rose)' }}>The Keeper's Warning <span dangerouslySetInnerHTML={{ __html: speakerMarkup("The Keeper's Warning") }} /></h3>
          <ul style={{ marginTop: '0.5rem', color: 'var(--rose)', paddingLeft: '1.5rem' }}>
            {conflicts.map((c, idx) => (
              <li key={idx}>
                {c} <span dangerouslySetInnerHTML={{ __html: speakerMarkup(c) }} style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />
              </li>
            ))}
          </ul>
        </div>
        </div>
      )}

      {/* Titration Modal */}
      {showTitration && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3>Master Invocation: Titration <span dangerouslySetInnerHTML={{ __html: speakerMarkup("Master Invocation: Titration") }} /></h3>
            <div className="mt mb-4" style={{ color: 'var(--rose)' }}>
              You've been at your current frequency of Tretinoin/Retinoid for a fortnight. Are you experiencing any redness, peeling, or blistering?
            </div>
            
            {!titrationResponse ? (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn plum" style={{ flex: 1 }} onClick={() => setTitrationResponse('yes')}>
                  Yes, I am
                </button>
                <button className="btn plum" style={{ flex: 1 }} onClick={() => setTitrationResponse('no')}>
                  No, I'm fine
                </button>
              </div>
            ) : (
              <div style={{ marginTop: '1rem', color: 'var(--rose)' }}>
                {titrationResponse === 'yes' 
                  ? "The Keeper advises you hold your current frequency and do not increase usage. Consider skipping a night if irritation worsens."
                  : "Excellent. The Keeper permits you to increase your frequency by one additional night per week."}
                <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                  <button className="btn plum sm" onClick={() => {
                    localStorage.setItem('titration_checked_today', todayKey);
                    setShowTitration(false);
                  }}>Acknowledge</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
