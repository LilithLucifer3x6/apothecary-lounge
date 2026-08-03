import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { fetchTodayEvents } from '../lib/gcal.js';
import { speakerMarkup } from '../lib/tts.js';
import { syncAppointments, markAppointmentDone } from '../lib/calendar.js';

export default function Grimoire({ pose }) {
  const [appointments, setAppointments] = useState([]);
  const [marked, setMarked] = useState({});
  const [history, setHistory] = useState([]);
  const [realEvents, setRealEvents] = useState([]);

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
    
    calDays.push(
      <div key={`day-${i}`} className={`cd ${isToday}`}>
        {i}
        {hasRetie && <div className="ce" title="Root Weaving" style={{ color: 'var(--plum-b)', fontSize: '1.2rem' }}><Icon name="star-four" /></div>}
        {hasNails && <div className="ce" title="Talon Honing" style={{ color: 'var(--rose)', fontSize: '1.2rem' }}><Icon name="sparkle" /></div>}
      </div>
    );
  }

  const retieAppt = appointments.find(a => a.type === 'retie');
  const nailsAppt = appointments.find(a => a.type === 'nails');

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', textAlign: 'center', color: 'var(--parch)' }}>
        The Grimoire
      </h2>
      
      <div className="grim-grid mt-4">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card" style={{ marginTop: 0 }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>Today's Appointed Times <span className="spk"><Icon name="ph-duotone ph-speaker-high" /></span></h3>
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
            <div className="d">
              <div className="dn">Mon</div>
              <div className="tg"></div>
            </div>
            <div className="d"><div className="dn">Tue</div><div className="tg"></div></div>
            <div className="d">
              <div className="dn">Wed</div>
              <div className="tg"></div>
            </div>
            <div className="d"><div className="dn">Thu</div><div className="tg"></div></div>
            <div className="d">
              <div className="dn">Fri</div>
              <div className="tg"></div>
            </div>
            <div className="d"><div className="dn">Sat</div><div className="tg"></div></div>
              <div className="d">
                <div className="dn">Sun</div>
                <div className="tg"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-4">
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
    </div>
  );
}
