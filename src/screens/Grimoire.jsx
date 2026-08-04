import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { fetchTodayEvents, fetchMonthEvents } from '../lib/gcal.js';
import { speakerMarkup } from '../lib/tts.js';
import { syncAppointments, markAppointmentDone } from '../lib/calendar.js';

export default function Grimoire({ pose }) {
  const [appointments, setAppointments] = useState([]);
  const [marked, setMarked] = useState({});
  const [history, setHistory] = useState([]);
  const [realEvents, setRealEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState([]);

  const [profile, setProfile] = useState(null);

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

  const handleOverride = () => {
    const date = prompt('Enter the date you last completed this rite (YYYY-MM-DD):');
    if (date && !isNaN(new Date(date).getTime())) {
      alert('Predictive schedule overridden with ' + date);
    }
  };

  const emptyDays = [];
  for (let i = 0; i < firstDay; i++) {
    emptyDays.push(<div key={`empty-${i}`}></div>);
  }

  const calDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === d.getDate() ? 'today' : '';
    const hasRetie = appointments.some(app => new Date(app.date).getDate() === i && app.type === 'retie');
    const hasNails = appointments.some(app => new Date(app.date).getDate() === i && app.type === 'nails');
    
    // Anchor date: August 3rd, 2026 (User's first dose: 40mg)
    const anchorDate = new Date(2026, 7, 3); // Month is 0-indexed (7 = Aug)
    // Need to strip time for perfect day calculation
    const currentDayTime = new Date(year, month, i).getTime();
    const dayOfWeek = new Date(year, month, i).getDay();
    const diffDays = Math.round((currentDayTime - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Even diff = 40mg, Odd diff = 80mg
    const isIsotretinoin80 = Math.abs(diffDays) % 2 === 1; 

    const dayOfWeek = new Date(year, month, i).getDay();
    const hasIsotretinoin = profile?.intake_answers?.oralList?.some(o => o.name.toLowerCase().includes('isotretinoin'));
    const hasFridayInjections = dayOfWeek === 5 && profile?.intake_answers?.oralList?.some(o => o.name.toLowerCase().includes('enbrel') || o.name.toLowerCase().includes('wegovy') || o.name.toLowerCase().includes('methotrexate'));

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
                color: 'var(--parch)', 
                padding: '2px 4px', 
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--ff)'
              }}>
                {new Date(ev.start.dateTime || ev.start.date).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - {ev.summary}
              </div>
            ))}
          </div>
        )}
        
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {hasIsotretinoin && (
            <div className="pill" style={{ color: 'var(--parch)', borderColor: 'var(--border)' }}>
              Isotretinoin {isIsotretinoin80 ? '80mg' : '40mg'}
            </div>
          )}
          {hasFridayInjections && (
            <div className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
              Weekly Injections
            </div>
          )}
        </div>
      </div>
    );
  }

  const retieAppt = appointments.find(a => a.type === 'retie');
  const nailsAppt = appointments.find(a => a.type === 'nails');

  const wheelDays = [
    { name: 'Mon', num: 1 }, { name: 'Tue', num: 2 }, { name: 'Wed', num: 3 }, 
    { name: 'Thu', num: 4 }, { name: 'Fri', num: 5 }, { name: 'Sat', num: 6 }, { name: 'Sun', num: 0 }
  ];

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <div className="grim-grid mt-2">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ marginTop: 0 }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>Today's Appointed Times <span dangerouslySetInnerHTML={{ __html: speakerMarkup("Today's Appointed Times") }} /></h3>
        <div className="mt mb-4">From Google Calendar</div>
        
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
              <div className="nm">No events scheduled today.</div>
              <div className="mt">Your day is your own.</div>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
        <h3>
          The Weekly Wheel{' '}
          <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Weekly Wheel') }} />
        </h3>
        <div className="mt mb-4">Rhythms and cycles.</div>
        
        <div className="wheel-container">
          <div className="wheel">
            {wheelDays.map(day => {
              const isFriday = day.num === 5;
              const isSunday = day.num === 0;
              const hasIso = profile?.intake_answers?.oralList?.some(o => o.name.toLowerCase().includes('isotretinoin'));
              const hasDrysol = profile?.intake_answers?.rxList?.some(r => r.name.toLowerCase().includes('drysol'));
              
              return (
                <div key={day.name} className="d">
                  <div className="dn">{day.name}</div>
                  <div className="tg" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '1rem' }}>
                    {hasIso && (
                      <span className="pill" style={{ color: 'var(--parch)' }}>Isotretinoin 40/80mg</span>
                    )}
                    {isFriday && (
                      <>
                        <span className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>Methotrexate 15mg</span>
                        <span className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>Wegovy 2.4mg</span>
                        <span className="pill" style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>Enbrel</span>
                      </>
                    )}
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

        <div className="card mt-4" style={{ alignSelf: 'flex-start' }}>
          <div className="corner tl"></div><div className="corner tr"></div>
          <div className="corner bl"></div><div className="corner br"></div>
          <h3>
            The Appointed Days{' '}
            <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Appointed Days') }} />
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
                  {marked['retie'] ? 'Marked' : 'Kept'}
                </button>
                <button className="spk btn-override" title="Manual Override" onClick={handleOverride}>
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
                  {marked['nails'] ? 'Marked' : 'Kept'}
                </button>
                <button className="spk btn-override" title="Manual Override" onClick={handleOverride}>
                  <i className="ph-duotone ph-dots-three-vertical"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="card" style={{ marginTop: 0 }}>
        <div className="corner tl"></div><div className="corner tr"></div>
        <div className="corner bl"></div><div className="corner br"></div>
        <h3>
          The Almanac{' '}
          <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Almanac') }} />
        </h3>
        <div className="mt mb-4">The long count.</div>
        
        <h2 style={{ fontFamily: "'Allura', cursive", fontSize: '2.5rem', color: 'var(--rose)', textAlign: 'center', margin: '1rem 0' }}>
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
    </div>
  );
}
