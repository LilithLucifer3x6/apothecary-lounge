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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
      
      // Mocking wearable data as Terra API is enabled in settings
      const mockWearables = {
        sleepDuration: 5.5, // Less than 6 hours -> trigger de-puffing
        heavySweat: true    // Heavy sweat -> trigger gentle cleanse
      };
      const { amItems: am, pmItems: pm } = buildRoutines(itemsArr, userProfile, mockWearables);
      setAmItems(am);
      setPmItems(pm);
      setConflicts(checkConflicts(itemsArr));
      setLoading(false);
    }
    
    fetchData();
  }, []);

  const handleCheck = (id) => {
    const newChecked = new Set(checkedIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIds(newChecked);
  };

  const handleSave = async () => {
    setSaving(true);
    if (checkedIds.size > 0) {
      await supabase.from('routine_history').insert({
        completed_at: new Date().toISOString(),
        items_used: Array.from(checkedIds)
      });
    }
    setSaved(true);
    setSaving(false);
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

  if (items.length === 0) {
    return (
      <div className="card" style={{ margin: '2rem' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <div className="empty">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            <Icon name={G.tabRoot} />
          </div>
          The shelves are bare. Visit The Rootwork to begin gathering.
        </div>
      </div>
    );
  }

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
          <div className={`nm ${rxClass}`}>
            {item.name} {isAid && <span className="aid" title="Partner Assisted"><Icon name={G.tabAltars} /></span>}
          </div>
          <div className="mt">{item.brand || 'Prescription'} &bull; {item.storage_location || 'Vanity'}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', textAlign: 'center', color: 'var(--parch)' }}>The Mortal Rites</h2>
      <div style={{ textAlign: 'center', marginBottom: '2rem', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', color: 'var(--ash)' }}>
        {getRitualDate()}
      </div>

      <div className="rites2">
        <div className="card mt-4">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>Morning Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('Morning Invocation') }} /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {amItems.length > 0 ? amItems.map(i => renderStep(i)) : <div className="empty">No morning rites.</div>}
          </div>
        </div>
        
        <div className="card mt-4">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>Evening Invocation <span dangerouslySetInnerHTML={{ __html: speakerMarkup('Evening Invocation') }} /></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            {pmItems.length > 0 ? pmItems.map(i => renderStep(i)) : <div className="empty">No evening rites.</div>}
          </div>
        </div>
        
        {conflicts.length > 0 && (
          <div className="card mt-4" style={{ background: 'var(--card-bg-alt, rgba(100,20,20,0.5))', borderColor: '#882222' }}>
            <h3 style={{ color: '#ff8888' }}>Keeper's Warning</h3>
            <ul style={{ marginTop: '0.5rem', color: '#ffcccc', paddingLeft: '1.5rem' }}>
              {conflicts.map((c, idx) => <li key={idx}>{c}</li>)}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            id="btn-save-rite" 
            className={`btn ${saved ? 'g' : 'plum'}`} 
            style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? 'Rite Concluded' : 'Conclude the Rite'}
          </button>
        </div>
      </div>
      
      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Long Hours <span dangerouslySetInnerHTML={{ __html: speakerMarkup('The Long Hours') }} /></h3>
        <div className="mt mb-4">The Daily Schedule</div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--crimson-b)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">8:00 AM - The Awakening</div>
            <div className="mt">Wake up and perform The Morning Invocation</div>
          </div>
        </div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--gold)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">8:15 AM - 5:00 PM - The Labors</div>
            <div className="mt">Work hours</div>
          </div>
        </div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--rose)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">9:00 AM to 10:30 AM - The Morning Respite</div>
            <div className="mt">15-minute break &bull; Hydrate (16oz water)</div>
          </div>
        </div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--rose)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">11:00 AM to 12:30 PM - The Midday Sustenance</div>
            <div className="mt">Lunch &bull; Gentle Movement (Walk/Stretch)</div>
          </div>
        </div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--rose)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">1:30 PM to 2:30 PM - The Afternoon Respite</div>
            <div className="mt">15-minute break &bull; Hydrate (16oz water)</div>
          </div>
        </div>
        
        <div className="step" style={{ borderLeft: '3px solid var(--plum)' }}>
          <input type="checkbox" /> 
          <div style={{ flex: 1 }}>
            <div className="nm">5:00 PM onwards - The Descent</div>
            <div className="mt">Work ends &bull; The Evening Invocation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
