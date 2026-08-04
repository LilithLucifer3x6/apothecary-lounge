import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import { evaluateScryingPool, parseProductImage } from '../lib/ai-engine.js';
import { getReadiness } from '../lib/health-connect.js';
import VoiceInput from '../components/VoiceInput.jsx';
import { speakerMarkup } from '../lib/tts.js';

export default function Scrying({ pose }) {
  const [inventory, setInventory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [healthEnabled, setHealthEnabled] = useState(false);
  const [scryStatus, setScryStatus] = useState('');
  const [scryResult, setScryResult] = useState('');
  const [reactionForm, setReactionForm] = useState({
    productId: '',
    zone: 'The visage, below — jaw and chin',
    reactions: new Set(),
    severity: 0
  });
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState('');
  const [evaluationResult, setEvaluationResult] = useState('');

  const reactionOptions = ['Peeling', 'Redness', 'Burning', 'Itching', 'Purging', 'Dryness', 'Darkening where it healed'];
  const zoneOptions = [
    'The visage, below — jaw and chin',
    'The visage, midway — nose and cheek',
    'The gaze — lid and orbit',
    'The crown — scalp',
    'The vessel — underarm',
    'The vessel — chest and back'
  ];
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


  const now = new Date();

  const toggleReaction = (reaction) => {
    setReactionForm(prev => {
      const next = new Set(prev.reactions);
      if (next.has(reaction)) next.delete(reaction);
      else next.add(reaction);
      return { ...prev, reactions: next };
    });
  };

  const handleSaveLedger = () => {
    if (!reactionForm.productId || reactionForm.reactions.size === 0 || reactionForm.severity === 0) return;
    const item = inventory.find(i => i.id === reactionForm.productId);
    
    setLedgerEntries(prev => [...prev, {
      ...reactionForm,
      productName: item?.name,
      brand: item?.brand,
      reactions: Array.from(reactionForm.reactions),
      date: new Date().toISOString()
    }]);
    
    setReactionForm({
      productId: '',
      zone: 'The visage, below — jaw and chin',
      reactions: new Set(),
      severity: 0
    });
  };

  const handleDivineAfflictions = async () => {
    setEvaluationStatus('The Pool stirs... seeking truth in the water...');
    setEvaluationResult('');
    
    try {
      const { generateScryingEvaluation } = await import('../lib/ai-engine.js');
      // Pass the entire ecosystem
      const reply = await generateScryingEvaluation(inventory, banishedItems, ledgerEntries, profile?.intake_answers || {});
      setEvaluationStatus('');
      setEvaluationResult(reply);
    } catch (err) {
      console.error(err);
      setEvaluationStatus('The Pool is clouded. ' + err.message);
    }
  };

  const allergies = profile?.intake_answers?.conditions?.filter(c => c.type === 'allergy') || [];
  const banishedItems = inventory.filter(i => i.lifecycle_state === 'banished');

  // Strict local lavender check in case database hasn't updated
  const localBanished = banishedItems.some(i => i.name.toLowerCase().includes('lavender')) ? banishedItems : [...banishedItems, { name: 'Lavender', brand: 'Universal', lifecycle_state: 'banished'}];

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card mt-4" style={{ height: '100%' }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3><span className="g">{Icon({name: G.tabPool})}</span>What the Water Shows <span dangerouslySetInnerHTML={{ __html: speakerMarkup("What the Water Shows") }} /></h3>
          <div className="mt mb-4">A holistic divination of your routine, reactions, and trajectory.</div>
          
          <button className="btn full plum" onClick={handleDivineAfflictions}>Divine Afflictions</button>
          
          <div style={{ marginTop: '1rem', fontSize: '1rem', color: 'var(--rose)', minHeight: '1rem', }}>
            {evaluationStatus}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--rose)', whiteSpace: 'pre-wrap' }}>
            {evaluationResult || <div className="empty" style={{textAlign: 'left', margin: 0}}>The water is still. Inscribe your ledger, then seek the water's counsel.</div>}
          </div>
        </div>

        <div className="card mt-4" style={{ height: '100%' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Ledger of Afflictions <span dangerouslySetInnerHTML={{ __html: speakerMarkup("The Ledger of Afflictions") }} /></h3>
        <div className="mt mb-4">Has something turned against you? Speak of it — what, and where, and how sorely.</div>
        
        {inventory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="field">
              <label>The Offending Formula</label>
              <select value={reactionForm.productId} onChange={(e) => setReactionForm({...reactionForm, productId: e.target.value})} style={{width: '100%'}}>
                <option value="">Select a formula...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <div className="field">
              <label>The Affected Zone</label>
              <select value={reactionForm.zone} onChange={(e) => setReactionForm({...reactionForm, zone: e.target.value})} style={{width: '100%'}}>
                {zoneOptions.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>

            <div className="field">
              <label>The Manifestation</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {reactionOptions.map(r => {
                  const isChecked = reactionForm.reactions.has(r);
                  return (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', cursor: 'pointer', color: isChecked ? 'var(--rose)' : 'var(--dim)' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => toggleReaction(r)} style={{ display: 'none' }} />
                      <div style={{ padding: '0.2rem 0.5rem', border: `1px solid ${isChecked ? 'var(--rose)' : 'var(--border)'}`, borderRadius: '12px', background: isChecked ? 'rgba(176,132,148,0.2)' : 'transparent' }}>
                        {r}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <label>How Sorely (1-5)</label>
              <div className="chips" style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button 
                    key={n} 
                    className={`chip ${reactionForm.severity === n ? 'on' : ''}`}
                    onClick={() => setReactionForm({...reactionForm, severity: n})}
                    style={{ minWidth: '40px', padding: '0.5rem' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="btn plum" onClick={handleSaveLedger} disabled={!reactionForm.productId || reactionForm.reactions.size === 0 || reactionForm.severity === 0}>
              Give it to the water
            </button>
          </div>
        ) : (
          <div className="empty">Your inventory is empty.</div>
        )}

        {ledgerEntries.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <h4 style={{ color: 'var(--metal)', marginBottom: '1rem' }}>Recorded Afflictions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ledgerEntries.map((entry, idx) => (
                <div key={idx} className="row" style={{ opacity: 0.8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div className="nm" style={{ color: 'var(--rose)' }}>{entry.productName}</div>
                    <div className="mt">{entry.zone} &bull; Severity: {entry.severity}/5</div>
                    <div className="mt" style={{ marginTop: '0.3rem' }}>{entry.reactions.join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <div className="card mt-4" style={{ height: '100%' }}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Crypt of Ashes <span dangerouslySetInnerHTML={{ __html: speakerMarkup("The Crypt of Ashes") }} /></h3>
        <div className="mt mb-4">Elements forever sealed away.</div>
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
  </div>
  );
}
