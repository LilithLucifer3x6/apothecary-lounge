import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.jsx';
import Icon from '../components/Icon.jsx';
import { fetchTodayEvents, fetchMonthEvents } from '../lib/gcal.js';
import SpeakerButton from '../components/SpeakerButton.jsx';
import { syncAppointments, markAppointmentDone } from '../lib/calendar.js';

export default function Grimoire({ pose }) {
  const [appointments, setAppointments] = useState([]);
  const [marked, setMarked] = useState({});
  const [history, setHistory] = useState([]);
  const [realEvents, setRealEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);

  const [profile, setProfile] = useState(null);
  const [overrideModal, setOverrideModal] = useState({ show: false, type: '', date: '' });

  useEffect(() => {
    let mounted = true;
    syncAppointments().then(data => {
      if (mounted) setAppointments(data);
    });

    supabase.from('routine_history').select('*').order('completed_at', { ascending: false }).limit(30)
      .then(({data}) => {
        if (mounted && data) setHistory(data);
      });
      
    fetchTodayEvents().then(events => {
      if (mounted) setRealEvents(events);
    });
    
    const currDate = new Date();
    fetchMonthEvents(currDate.getFullYear(), currDate.getMonth()).then(events => {
      if (mounted) setMonthEvents(events);
    });

    supabase.from('user_profile').select('*').maybeSingle().then(({data}) => {
      if (mounted && data) setProfile(data);
    });

    return () => { mounted = false; };
  }, []);

  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  const markDone = async (type) => {
    await markAppointmentDone(type);
    setMarked(prev => ({ ...prev, [type]: true }));
  };

  const handleOverride = (type) => {
    setOverrideModal({ show: true, type, date: new Date().toISOString().split('T')[0] });
  };

  const handleOverrideSubmit = async () => {
    if (!overrideModal.date || !profile) return;
    try {
      const settings = profile.settings || {};
      const apptOverrides = settings.appointment_overrides || {};
      apptOverrides[overrideModal.type] = overrideModal.date;
      
      const newSettings = { ...settings, appointment_overrides: apptOverrides };
      await supabase.from('user_profile').update({ settings: newSettings }).eq('id', profile.id);
      
      setProfile(prev => ({ ...prev, settings: newSettings }));
      setOverrideModal({ show: false, type: '', date: '' });
    } catch(e) {
      console.error(e);
    }
  };

  const overrides = profile?.settings?.appointment_overrides || {};
  let retieAppt = appointments.find(a => a.type === 'retie');
  if (retieAppt && overrides['retie']) retieAppt = { ...retieAppt, date: overrides['retie'] };
  
  let nailsAppt = appointments.find(a => a.type === 'nails');
  if (nailsAppt && overrides['nails']) nailsAppt = { ...nailsAppt, date: overrides['nails'] };

  const emptyDays = [];
  for (let i = 0; i < firstDay; i++) {
    emptyDays.push(<div key={`empty-${i}`}></div>);
  }

  const calDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === d.getDate() ? 'today' : '';
    const hasRetie = retieAppt && retieAppt.date && new Date(retieAppt.date).getDate() === i && new Date(retieAppt.date).getMonth() === month && new Date(retieAppt.date).getFullYear() === year;
    const hasNails = nailsAppt && nailsAppt.date && new Date(nailsAppt.date).getDate() === i && new Date(nailsAppt.date).getMonth() === month && new Date(nailsAppt.date).getFullYear() === year;
    
    const currentDayTime = new Date(year, month, i).getTime();
    const dayOfWeek = new Date(year, month, i).getDay();
    
    const orals = profile?.intake_answers?.oralList || [];
    const rxs = profile?.intake_answers?.rxList || [];
    const allMeds = [...orals, ...rxs].map(m => (m.name || '').toLowerCase());
    
    const hasIsotretinoin = allMeds.some(m => m.includes('isotretinoin') || m.includes('accutane'));
    const hasFridayInjections = dayOfWeek === 5 && allMeds.some(m => m.includes('enbrel') || m.includes('wegovy') || m.includes('methotrexate') || m.includes('etanercept'));
    
    let isIsotretinoin80 = false;
    if (hasIsotretinoin) {
      const rxStart = profile?.intake_answers?.prescription_start_date;
      const anchorDate = rxStart ? new Date(rxStart) : new Date(2026, 7, 3);
      const diffDays = Math.round((currentDayTime - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
      isIsotretinoin80 = Math.abs(diffDays) % 2 === 1; 
    }

    const dayEvents = monthEvents.filter(ev => {
      if (!ev.start) return false;
      const evDate = new Date(ev.start.dateTime || ev.start.date);
      // Ensure the event falls on this exact day of this month/year
      return evDate.getDate() === i && evDate.getMonth() === month && evDate.getFullYear() === year;
    });

    calDays.push(
      <div key={`day-${i}`} className={`cd ${isToday}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{i}</span>
          <div style={{ display: 'flex', gap: '0.2rem' }}>
            {hasRetie && <span title="Root Weaving" style={{ color: 'var(--gold)' }}><Icon name="star-four" /></span>}
            {hasNails && <span title="Talon Honing" style={{ color: 'var(--gold)' }}><Icon name="sparkle" /></span>}
          </div>
        </div>
        
        {dayEvents.length > 0 && (
          <div style={{ marginTop: '0.2rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            {dayEvents.map((ev, idx) => (
              <div key={idx} style={{ 
                fontSize: '0.65rem', 
                background: 'var(--plum-b)', 
                color: 'var(--silver)', 
                padding: '2px 4px', 
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                }}>
                {new Date(ev.start.dateTime || ev.start.date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {ev.summary}
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {allMeds.map((m, i) => {
              const l = m.toLowerCase();
              if (l.includes('isotretinoin') || l.includes('accutane')) return (
                <div key={i} className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--border)' }}>
                  {m} {isIsotretinoin80 ? '80mg' : '40mg'}
                </div>
              );
              if (dayOfWeek === 5 && (l.includes('methotrexate') || l.includes('wegovy') || l.includes('enbrel') || l.includes('etanercept'))) return (
                <div key={i} className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
                  {m} (Weekly Injection)
                </div>
              );
              return null;
            })}
        </div>
      </div>
    );
  }

  const wheelDays = [
    { name: 'Mon', num: 1 }, { name: 'Tue', num: 2 }, { name: 'Wed', num: 3 }, 
    { name: 'Thu', num: 4 }, { name: 'Fri', num: 5 }, { name: 'Sat', num: 6 }, { name: 'Sun', num: 0 }
  ];

  return (
    <div style={{ padding: '1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div className="grim-grid mt-2">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ marginTop: 0 }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Appointed Times of Today <SpeakerButton text="The Appointed Times of Today" /></h3>
        
        {realEvents.length > 0 ? realEvents.map((ev, i) => (
          <div key={i} className="step">
            <div className="body">
              <div className="nm">{ev.summary}</div>
              <div className="mt">{new Date(ev.start.dateTime || ev.start.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
        )) : (
          <div className="step">
            <div className="body">
              <div className="nm">No mortal omens foretold for today.</div>
              <div className="mt">Your day is your own.</div>
            </div>
          </div>
        )}
      </div>

        <div className="card mt-4" style={{ alignSelf: 'flex-start' }}>
          <div className="corner tl"></div><div className="corner tr"></div>
          <div className="corner bl"></div><div className="corner br"></div>
          <h3>
            The Appointed Days{' '}
            <SpeakerButton text='The Appointed Days' />
          </h3>
          <div className="mt mb-4">Rites that occur sparingly.</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="row" style={{ flex: '0 1 auto', marginBottom: 0 }}>
                <div>
                  <div className="nm">Root Weaving (Retie) <Icon name="star-four" /></div>
                  <div className="mt">
                    Every 8 weeks. Scheduled for {retieAppt?.date ? new Date(retieAppt.date).toLocaleDateString() : 'Unknown'}.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  className="btn sm plum btn-appt" 
                  onClick={() => markDone('retie')}
                  style={{ opacity: marked['retie'] ? 0.5 : 1 }}
                >
                  {marked['retie'] ? 'Marked' : 'Inscribe'}
                </button>
                <button className="spk btn-override" title="Override Calendar Fate" onClick={() => handleOverride('retie')}>
                  <i className="ph-duotone ph-dots-three-vertical"></i>
                </button>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div className="row" style={{ flex: '0 1 auto', marginBottom: 0 }}>
                <div>
                  <div className="nm">Talon Honing (Nails) <Icon name="sparkle" /></div>
                  <div className="mt">
                    Every 2 weeks. Scheduled for {nailsAppt?.date ? new Date(nailsAppt.date).toLocaleDateString() : 'Unknown'}.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  className="btn sm plum btn-appt" 
                  onClick={() => markDone('nails')}
                  style={{ opacity: marked['nails'] ? 0.5 : 1 }}
                >
                  {marked['nails'] ? 'Marked' : 'Inscribe'}
                </button>
                <button className="spk btn-override" title="Override Calendar Fate" onClick={() => handleOverride('nails')}>
                  <i className="ph-duotone ph-dots-three-vertical"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card" style={{ marginTop: 0, marginBottom: '1.5rem' }}>
          <div className="corner tl"></div><div className="corner tr"></div>
          <div className="corner bl"></div><div className="corner br"></div>
          <h3>
            The Weekly Wheel{' '}
            <SpeakerButton text='The Weekly Wheel' />
          </h3>
          <div className="mt mb-4">Rhythms and cycles.</div>
          
          <div className="wheel-container">
            <div className="wheel">
              {wheelDays.map(day => {
                const isFriday = day.num === 5;
                const orals = profile?.intake_answers?.oralList || [];
                const rxs = profile?.intake_answers?.rxList || [];
                const allMeds = [...orals, ...rxs].map(m => (m.name || '').toLowerCase());
                
                const hasDrysol = allMeds.some(m => m.includes('drysol'));
                
                return (
                  <div key={day.name} className="d">
                    <div className="dn">{day.name}</div>
                    <div className="tg" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                        {allMeds.map((m, i) => {
                          const l = m.toLowerCase();
                          if (l.includes('isotretinoin') || l.includes('accutane')) {
                            return <span key={i} className="pill" style={{ color: 'var(--silver)' }}>{m} 40/80mg</span>;
                          }
                          if (isFriday && (l.includes('methotrexate') || l.includes('wegovy') || l.includes('enbrel') || l.includes('etanercept'))) {
                            return <span key={i} className="pill" style={{ color: 'var(--silver)', borderColor: 'var(--silver)' }}>{m}</span>;
                          }
                          return null;
                        })}
                      {hasDrysol && (
                        <span className="pill" style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }}>Drysol (Nightly)</span>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 0 }}>
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
        <h3>
          The Ephemeris{' '}
          <SpeakerButton text='The Ephemeris' />
        </h3>
        <div className="mt mb-4">The long count.</div>
        
        <h2 style={{ fontSize: '2.5rem', color: 'var(--rose)', textAlign: 'center', margin: '1rem 0' }}>
          {new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        
        <div className="cal">
          <div className="ch">S</div><div className="ch">M</div><div className="ch">T</div>
          <div className="ch">W</div><div className="ch">T</div><div className="ch">F</div>
          <div className="ch">S</div>
          {emptyDays}
          {calDays}
        </div>
      </div>

      </div>
      </div>
      
      {overrideModal.show && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ color: 'var(--rose)' }}>Rewrite Fate</h3>
            <div className="mt mb-4" style={{ color: 'var(--rose)' }}>
              Inscribe the date this rite was last fulfilled.
            </div>
            <input 
              type="date" 
              value={overrideModal.date} 
              onChange={e => setOverrideModal({ ...overrideModal, date: e.target.value })} 
              style={{ width: '100%', padding: '0.8rem', background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--rose)', borderRadius: '4px', marginBottom: '1rem' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn" onClick={() => setOverrideModal({ show: false, type: '', date: '' })}>Abandon</button>
              <button className="btn plum" onClick={handleOverrideSubmit}>Rewrite</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

