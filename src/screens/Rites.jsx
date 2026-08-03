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

  const todayKey = new Date().toISOString().split('T')[0];
  const [scheduleChecked, setScheduleChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(`schedule_${todayKey}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch(e) { return new Set(); }
  });

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
      setConflicts(checkConflicts(itemsArr));
      setLoading(false);
    }
    
    fetchData();
  }, []);

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

  const renderStep = (item, isOpt = false, isRx = false, isAid = false) => {
    const rxClass = isRx ? 'rx' : '';
    const optClass = isOpt ? 'opt' : '';
    
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
            {item.name} 
            <span style={{ marginLeft: '0.4rem' }} dangerouslySetInnerHTML={{ __html: speakerMarkup(item.name) }} />
            {isAid && <span className="aid" title="Partner Assisted"><Icon name={G.tabAltars} /></span>}
          </div>
          <div className="mt">{item.brand || 'Prescription'} &bull; {item.storage_location || 'Vanity'}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--ash)' }}>
        {getRitualDate()}
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Long Hours <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Long Hours') }} /></h3>
        <div className="mt mb-4">The Daily Schedule</div>
        
        {renderScheduleStep('8:00 AM - The Awakening', 'Wake up and perform The Morning Invocation', 'var(--crimson-b)')}
        {renderScheduleStep('8:15 AM - 5:00 PM - The Labors', 'Work hours', 'var(--silver)')}
        {renderScheduleStep('9:00 AM to 10:30 AM - The Morning Respite', '15-minute break. Hydrate (16oz water)', 'var(--rose)')}
        {renderScheduleStep('11:00 AM to 12:30 PM - The Midday Sustenance', 'Lunch. Gentle Movement (Walk/Stretch)', 'var(--rose)')}
        {renderScheduleStep('1:30 PM to 2:30 PM - The Afternoon Respite', '15-minute break. Hydrate (16oz water)', 'var(--rose)')}
        {renderScheduleStep('5:00 PM onwards - The Descent', 'Work ends. The Evening Invocation', 'var(--plum)')}
      </div>

      <div className="rites2">
        <div className="card mt-4">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>Morning Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('Morning Invocation') }} /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {amItems.length > 0 ? amItems.map(i => renderStep(i)) : <div className="empty">No morning rites.</div>}
            {amItems.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className={`btn ${amSaved || amItems.every(i => checkedIds.has(i.id)) ? 'g' : 'plum'}`} 
                  style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', width: '100%' }}
                  onClick={handleCompleteAllAm}
                  disabled={amSaving || amSaved || amItems.every(i => checkedIds.has(i.id))}
                >
                  {amSaved || amItems.every(i => checkedIds.has(i.id)) ? 'Morning Rite Completed' : 'Complete All Morning Steps'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="card mt-4">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>Evening Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('Evening Invocation') }} /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {pmItems.length > 0 ? pmItems.map(i => renderStep(i)) : <div className="empty">No evening rites.</div>}
            {pmItems.length > 0 && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  className={`btn ${pmSaved || pmItems.every(i => checkedIds.has(i.id)) ? 'g' : 'plum'}`} 
                  style={{ fontSize: '1rem', padding: '0.6rem 1.5rem', width: '100%' }}
                  onClick={handleCompleteAllPm}
                  disabled={pmSaving || pmSaved || pmItems.every(i => checkedIds.has(i.id))}
                >
                  {pmSaved || pmItems.every(i => checkedIds.has(i.id)) ? 'Evening Rite Completed' : 'Complete All Evening Steps'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {conflicts.length > 0 && (
          <div className="card mt-4" style={{ background: 'var(--card-bg-alt, rgba(100,20,20,0.5))', borderColor: '#882222' }}>
            <h3 style={{ color: '#ff8888' }}>Keeper's Warning <span dangerouslySetInnerHTML={{ __html: speakerMarkup("Keeper's Warning") }} /></h3>
            <ul style={{ marginTop: '0.5rem', color: '#ffcccc', paddingLeft: '1.5rem' }}>
              {conflicts.map((c, idx) => (
                <li key={idx}>
                  {c} <span dangerouslySetInnerHTML={{ __html: speakerMarkup(c) }} style={{ marginLeft: '0.4rem', verticalAlign: 'middle' }} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
