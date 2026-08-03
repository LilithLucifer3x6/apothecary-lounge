import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { evaluateScryingPool, parseProductImage } from '../lib/ai-engine.js';
import { getReadiness } from '../lib/health-connect.js';
import VoiceInput from '../components/VoiceInput.jsx';

export default function Scrying({ pose }) {
  const [inventory, setInventory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [healthEnabled, setHealthEnabled] = useState(false);
  const [scryInput, setScryInput] = useState('');
  const [scryStatus, setScryStatus] = useState('');
  const [scryResult, setScryResult] = useState('');
  const [reactions, setReactions] = useState({});

  const reactionOptions = ['Peeling', 'Redness', 'Burning', 'Itching', 'Purging', 'Dryness'];


  useEffect(() => {
    async function fetchData() {
      const { data: items } = await supabase.from('items').select('*');
      setInventory(items || []);
      
      const { data: userProfile } = await supabase.from('user_profile').select('*').maybeSingle();
      setProfile(userProfile);
    }
    fetchData();

    const settingsStr = localStorage.getItem('app_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    
    if (settings.health) {
      setHealthEnabled(true);
      getReadiness().then(res => {
        if (res) setReadiness(res);
      }).catch(console.error);
    }
  }, []);

  const handleScry = async () => {
    if (!scryInput.trim()) return;
    
    // LAVENDER HARD BAN
    if (scryInput.toLowerCase().includes('lavender')) {
      setScryStatus(<span><Icon name="warning" /> WARNING: Lavender detected. This formula is permanently banished.</span>);
      setScryResult('Lavender is strictly forbidden from your routine. It has been sealed in the Crypt of Ashes.');
      
      // Add to banished items if not already there
      const isAlreadyBanished = inventory.some(i => i.name === 'Lavender Formula (Banished)');
      if (!isAlreadyBanished) {
        await supabase.from('items').insert([{
          brand: 'Unknown',
          name: 'Lavender Formula (Banished)',
          type: 'product',
          lifecycle_state: 'banished'
        }]);
        // Refresh inventory to show in Crypt
        const { data: items } = await supabase.from('items').select('*');
        setInventory(items || []);
      }
      return;
    }

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setScryStatus('Divining image...');
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      const mime = dataUrl.split(';')[0].split(':')[1];
      
      try {
        const details = await parseProductImage(base64, mime);
        const formulaStr = `${details.brand || ''} ${details.name || ''} ${details.category || ''}`;
        setScryInput(formulaStr.trim());
        setScryStatus('Vision extracted. Ready to analyze.');
      } catch (err) {
        console.error(err);
        setScryStatus('Failed to divine image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const now = new Date();
  const waningItems = inventory.filter(i => {
    if (i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow') return true;
    if (i.pao_months && i.opened_date) {
      const opened = new Date(i.opened_date);
      const expires = new Date(opened.setMonth(opened.getMonth() + parseInt(i.pao_months, 10)));
      const daysLeft = (expires - now) / (1000 * 60 * 60 * 24);
      if (daysLeft < 0) {
        i.isExpired = true;
        return true;
      }
      if (daysLeft <= 30) return true;
    }
    return false;
  });

  const toggleReaction = (itemId, reaction) => {
    setReactions(prev => {
      const current = prev[itemId] || new Set();
      const next = new Set(current);
      if (next.has(reaction)) next.delete(reaction);
      else next.add(reaction);
      return { ...prev, [itemId]: next };
    });
  };

  const handleSaveLedger = () => {
    alert("Somatic reactions saved to the Ledger.");
  };

  const allergies = profile?.intake_answers?.conditions?.filter(c => c.type === 'allergy') || [];
  const banishedItems = inventory.filter(i => i.lifecycle_state === 'banished');

  // Strict local lavender check in case database hasn't updated
  const localBanished = banishedItems.some(i => i.name.toLowerCase().includes('lavender')) ? banishedItems : [...banishedItems, { name: 'Lavender', brand: 'Universal', lifecycle_state: 'banished'}];

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      
      {healthEnabled ? (
        readiness ? (
          <div className="card mt-4" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--card3)', borderColor: 'var(--border)' }}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <div style={{ fontSize: '3rem', fontFamily: "'IM Fell English', serif", color: 'var(--rose)', minWidth: '40px', textAlign: 'center' }}>{readiness.score}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ fontWeight: 'normal', color: 'var(--rose)' }}>Readiness: {readiness.state.charAt(0).toUpperCase() + readiness.state.slice(1)}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--rose)' }}>Data from Android Health Connect</div>
            </div>
          </div>
        ) : (
          <div className="card mt-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--rose)', background: 'var(--card3)' }}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            Divining readiness...
          </div>
        )
      ) : (
        <div className="card mt-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--rose)', background: 'rgba(17,14,21,0.5)', borderStyle: 'dashed' }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          Enable Health Connect in Settings to divine your physical readiness.
        </div>
      )}

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Echo</h3>
        <div className="mt mb-4">Prospective formula analysis. Present a formula to check for overlap with your current inventory and avoid over-purchasing.</div>
        
        <div className="field" style={{ marginBottom: '1rem' }}>
          <label>Photo Scan</label>
          <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px'}}>
            <Icon name={G.tabPool} /> 
            <span style={{marginTop: '0.5rem', textAlign: 'center'}}>Upload or take a photo of the product</span>
            <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
          </div>
        </div>

        <div className="field" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <VoiceInput 
              isTextArea={true}
              placeholder="Or enter formula name/ingredients..."
              value={scryInput}
              onChange={(e) => setScryInput(e.target.value)}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--rose)', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem' }}
            />
          </div>
          <button className="btn plum" onClick={handleScry} style={{ minWidth: '120px' }}>Divine Synergies</button>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--rose)', minHeight: '1rem', fontWeight: 'normal' }}>
          {scryStatus}
        </div>
        <div style={{ marginTop: '1rem', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--rose)', whiteSpace: 'pre-wrap' }}>
          {scryResult}
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Somatic Ledger</h3>
        <div className="mt mb-4">Log bodily responses to active ingredients.</div>
        
        {inventory.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {inventory.map(item => (
                <div key={item.id || item.name} className="row" style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <div className="nm">{item.name}</div>
                    <div className="mt">{item.brand}</div>
                  </div>
                  <div style={{ flex: '2 1 300px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {reactionOptions.map(r => {
                      const isChecked = (reactions[item.id] || new Set()).has(r);
                      return (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', cursor: 'pointer', color: isChecked ? 'var(--rose)' : 'var(--dim)' }}>
                          <input type="checkbox" checked={isChecked} onChange={() => toggleReaction(item.id, r)} style={{ display: 'none' }} />
                          <div style={{ padding: '0.2rem 0.5rem', border: `1px solid ${isChecked ? 'var(--rose)' : 'var(--border)'}`, borderRadius: '12px', background: isChecked ? 'rgba(176,132,148,0.2)' : 'transparent' }}>
                            {r}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button className="btn plum sm" onClick={handleSaveLedger}>Inscribe Ledger</button>
            </div>
          </>
        ) : (
          <div className="empty">No somatic reactions logged. Use this ledger to record adverse reactions to specific components in your routine.</div>
        )}
      </div>


      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Waning</h3>
        <div className="mt mb-4">Formulas nearing expiration or running low.</div>
        <div>
          {waningItems.length > 0 ? (
            waningItems.map(item => (
              <div key={item.id || item.name} className="row" style={{ flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div className="nm">{item.name}</div>
                  <div className="mt">{item.brand} &bull; {item.isExpired ? <span style={{color: 'var(--rose)'}}>Expired!</span> : item.lifecycle_state}</div>
                </div>
                <button className="btn sm">Summon</button>
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
          {allergies.length > 0 || localBanished.length > 0 ? (
            <>
              {allergies.map((a, i) => (
                <div key={`allergy-${i}`} className="row" style={{ opacity: 0.8 }}>
                  <div style={{ flex: 1 }}>
                    <div className="nm" style={{ color: 'var(--rose)' }}>{a.value}</div>
                    <div className="mt">Allergy / Sensitivity</div>
                  </div>
                </div>
              ))}
              {localBanished.map((item, i) => (
                <div key={`banished-${i}`} className="row" style={{ opacity: 0.8 }}>
                  <div style={{ flex: 1 }}>
                    <div className="nm" style={{ color: 'var(--rose)' }}>{item.name}</div>
                    <div className="mt">{item.brand} &bull; Banished (Hard Ban)</div>
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
