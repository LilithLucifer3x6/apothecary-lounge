import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { G } from '../lib/icons';
import Icon from '../components/Icon';
import { evaluateScryingPool } from '../lib/ai-engine';

export default function Scrying({ pose }) {
  const [inventory, setInventory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [scryInput, setScryInput] = useState('');
  const [scryStatus, setScryStatus] = useState('');
  const [scryResult, setScryResult] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: items } = await supabase.from('items').select('*');
      setInventory(items || []);
      
      const { data: userProfile } = await supabase.from('user_profile').select('*').maybeSingle();
      setProfile(userProfile);
    }
    fetchData();
  }, []);

  const handleScry = async () => {
    if (!scryInput.trim()) return;
    setScryStatus('The Pool stirs...');
    setScryResult('');
    
    try {
      const reply = await evaluateScryingPool(scryInput.trim(), profile?.intake_answers || {}, inventory);
      setScryStatus('');
      setScryResult(reply);
    } catch (err) {
      console.error(err);
      setScryStatus('The Pool is clouded. ' + err.message);
    }
  };

  const waningItems = inventory.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  const allergies = profile?.intake_answers?.conditions?.filter(c => c.type === 'allergy') || [];
  const banishedItems = inventory.filter(i => i.lifecycle_state === 'banished');

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', textAlign: 'center', color: 'var(--parch)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Icon name={G.tabPool} /> The Scrying Pool
      </h2>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Echo</h3>
        <div className="mt mb-4">Prospective formula analysis. Present a formula to divine its nature.</div>
        <div className="field" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <div className="ip mic" style={{ flex: 1 }}>
            <textarea 
              rows={3} 
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--white)', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', resize: 'vertical', outline: 'none' }} 
              placeholder="Enter formula name or ingredients..."
              value={scryInput}
              onChange={(e) => setScryInput(e.target.value)}
            />
          </div>
          <button className="btn plum" onClick={handleScry}>Scry</button>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--rose)', minHeight: '1rem' }}>
          {scryStatus}
        </div>
        <div style={{ marginTop: '1rem', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--parch)', whiteSpace: 'pre-wrap' }}>
          {scryResult}
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>Reaction Grimoire</h3>
        <div className="mt mb-4">Log bodily responses to active ingredients.</div>
        <div className="row">
          <div style={{ flex: 1 }}>
            <div className="nm">Tretinoin 0.05%</div>
            <div className="mt">Retinoid</div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <label><input type="checkbox" /> Peeling</label>
              <label><input type="checkbox" /> Redness</label>
              <label><input type="checkbox" /> Purging</label>
              <label><input type="checkbox" /> Dryness</label>
            </div>
          </div>
          <button className="btn sm plum">Log</button>
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Waning</h3>
        <div className="mt mb-4">Formulas nearing their end.</div>
        <div>
          {waningItems.length > 0 ? (
            waningItems.map(item => (
              <div key={item.id || item.name} className="row">
                <div style={{ flex: 1 }}>
                  <div className="nm">{item.name}</div>
                  <div className="mt">{item.brand} &bull; {item.lifecycle_state}</div>
                </div>
                <button className="btn sm">Order</button>
              </div>
            ))
          ) : (
            <div className="empty">No formulas are currently waning.</div>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>Crypt of Ashes</h3>
        <div className="mt mb-4">Permanently Banished Ingredients.</div>
        <div>
          {allergies.length > 0 || banishedItems.length > 0 ? (
            <>
              {allergies.map((a, i) => (
                <div key={`allergy-${i}`} className="row" style={{ opacity: 0.8 }}>
                  <div style={{ flex: 1 }}>
                    <div className="nm" style={{ color: 'var(--rose)' }}>{a.value}</div>
                    <div className="mt">Allergy / Sensitivity</div>
                  </div>
                </div>
              ))}
              {banishedItems.map((item, i) => (
                <div key={`banished-${i}`} className="row" style={{ opacity: 0.8 }}>
                  <div style={{ flex: 1 }}>
                    <div className="nm" style={{ color: 'var(--rose)' }}>{item.name}</div>
                    <div className="mt">{item.brand} &bull; Banished</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="empty">No formulas have been banished yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
