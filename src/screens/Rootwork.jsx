import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.jsx';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import { attachVoice } from '../lib/voice.js';
import { buildBaseRoutines } from '../lib/routine-engine.js';
import SpeakerButton from '../components/SpeakerButton.jsx';

export default function Rootwork({ pose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    brand: '',
    name: '',
    domain: 'Crown',
    category: '',
    ingredients: '',
    weight: '5',
    expiration: ''
  });
  const [isAutoWeight, setIsAutoWeight] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('Offer or Scry Photo');
  const [modalState, setModalState] = useState('photo');
  const [banishState, setBanishState] = useState(null);
  
  const [profile, setProfile] = useState(null);
  const [echoInput, setEchoInput] = useState('');
  const [echoStatus, setEchoStatus] = useState('');
  const [echoResult, setEchoResult] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('items').select('*').order('name');
    
    if (data) {
      const now = new Date();
      for (const item of data) {
        if (item.lifecycle_state === 'stocked' && item.opened_date) {
          const opened = new Date(item.opened_date);
          const daysOpen = (now - opened) / (1000 * 60 * 60 * 24);
          
          // Predictive Restocking: If open for more than 60 days, predict it is ebbing
          if (daysOpen > 60) {
            await supabase.from('items').update({ lifecycle_state: 'ebbing' }).eq('id', item.id);
            item.lifecycle_state = 'ebbing';
          }
        }
      }
    }
    
    setItems(data || []);
    
    const { data: userProfile } = await supabase.from('user_profile').select('*').maybeSingle();
    setProfile(userProfile);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const waning = items.filter(i => i.lifecycle_state === 'waning');
  const ebbing = items.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  const banished = items.filter(i => i.lifecycle_state === 'banished');
  const apothecary = items.filter(i => i.type === 'product' && !['ebbing', 'hollow', 'banished', 'waning'].includes(i.lifecycle_state));
  const arsenal = items.filter(i => i.type === 'tool' && !['ebbing', 'hollow', 'banished', 'waning'].includes(i.lifecycle_state));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setPhotoStatus('Divining image...');
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      const mime = dataUrl.split(';')[0].split(':')[1];
      
      try {
        const { parseProductImage } = await import('../lib/ai-engine.js');
        const details = await parseProductImage(base64, mime);
        
        setAddForm(prev => ({
          ...prev,
          brand: details.brand || prev.brand,
          name: details.name || prev.name,
          category: details.category || prev.category
        }));
        
        setPhotoStatus('Vision extracted.');
        setModalState('confirm');
      } catch (err) {
        console.error(err);
        setPhotoStatus('The vision was clouded. Offer image anew.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEchoScry = async (inputStr = echoInput) => {
    const query = (typeof inputStr === 'string' ? inputStr : echoInput).trim();
    if (!query) return;
    
    // LAVENDER BAN
    if (query.toLowerCase().includes('lavender')) {
      setEchoStatus(<span><Icon name="warning" /> WARNING: Lavender detected. This formula is sealed in the Crypt of Ashes.</span>);
      setEchoResult('Lavender is strictly forbidden from your routine. It has been sealed in the Crypt of Ashes.');
      
      const isAlreadyBanished = items.some(i => i.name === 'Lavender Formula (Banished)');
      if (!isAlreadyBanished) {
        await supabase.from('items').insert([{
          brand: 'Unknown',
          name: 'Lavender Formula (Banished)',
          type: 'product',
          lifecycle_state: 'banished'
        }]);
        fetchItems();
      }
      return;
    }

    setEchoStatus('The Echo stirs...');
    setEchoResult('');
    
    try {
      const { evaluateScryingPool } = await import('../lib/ai-engine.js');
      // Pass empty reactions object since Echo checks prospective items, not current reactions
      const reply = await evaluateScryingPool(query, profile?.intake_answers || {}, items, {});
      setEchoStatus('');
      setEchoResult(reply);
    } catch (err) {
      console.error(err);
      setEchoStatus('The Echo is clouded. ' + err.message);
    }
  };

  const handleEchoPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setEchoStatus('Divining image...');
    
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      const mime = dataUrl.split(';')[0].split(':')[1];
      
      try {
        const { parseProductImage } = await import('../lib/ai-engine.js');
        const details = await parseProductImage(base64, mime);
        const formulaStr = `${details.brand || ''} ${details.name || ''} ${details.category || ''}`;
        setEchoInput(formulaStr.trim());
        setEchoStatus('Vision extracted. Divining...');
        await handleEchoScry(formulaStr.trim());
      } catch (err) {
        console.error(err);
        setEchoStatus('The vision was clouded. Offer image anew.');
      }
    };
    reader.readAsDataURL(file);
  };


  const handleSave = async () => {
    if (!addForm.name) return;
    setIsSaving(true);
    
    const manualWeight = isAutoWeight ? null : parseInt(addForm.weight);
    
    try {
      const { analyzeProduct } = await import('../lib/ai-engine.js');
      const ingArray = addForm.ingredients.split(',').map(s => s.trim()).filter(Boolean);
      
      const aiResult = await analyzeProduct(addForm.name, addForm.category, ingArray);
      
      let bFlags = aiResult.behavior_flags || {};
      if (manualWeight) {
        bFlags.layering_weight = manualWeight;
      }
      const bFlagsStr = JSON.stringify(bFlags);
      const riskFlagsStr = JSON.stringify(aiResult.risk_flags || {});
      const ingStr = JSON.stringify(ingArray);
      
      if (addForm.id) {
        await supabase.from('items').update({
          brand: addForm.brand,
          name: addForm.name,
          domain: addForm.domain,
          category: addForm.category,
          ingredients: ingStr,
          risk_flags: riskFlagsStr,
          behavior_flags: bFlagsStr,
          glyph: aiResult.glyph,
          period_after_opening_months: addForm.expiration ? parseInt(addForm.expiration, 10) : null,
          price: addForm.price ? parseFloat(addForm.price) : null,
          is_composite: addForm.is_composite || false,
          components: addForm.is_composite ? addForm.components : null
        }).eq('id', addForm.id);
      } else {
        await supabase.from('items').insert([{
          brand: addForm.brand,
          name: addForm.name,
          domain: addForm.domain,
          category: addForm.category,
          ingredients: ingStr,
          risk_flags: riskFlagsStr,
          behavior_flags: bFlagsStr,
          type: 'product',
          lifecycle_state: 'stocked',
          period_after_opening_months: addForm.expiration ? parseInt(addForm.expiration, 10) : null,
          price: addForm.price ? parseFloat(addForm.price) : null,
          is_composite: addForm.is_composite || false,
          components: addForm.is_composite ? addForm.components : null,
          opened_date: new Date().toISOString()
        }]);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
      // Fallback
      if (addForm.id) {
        await supabase.from('items').update({
          brand: addForm.brand,
          name: addForm.name,
          domain: addForm.domain,
          category: addForm.category,
          period_after_opening_months: addForm.expiration ? parseInt(addForm.expiration, 10) : null,
          price: addForm.price ? parseFloat(addForm.price) : null,
          is_composite: addForm.is_composite || false,
          components: addForm.is_composite ? addForm.components : null
        }).eq('id', addForm.id);
      } else {
        await supabase.from('items').insert([{
          brand: addForm.brand, 
          name: addForm.name, 
          domain: addForm.domain, 
          category: addForm.category, 
          type: 'product', 
          lifecycle_state: 'stocked',
          period_after_opening_months: addForm.expiration ? parseInt(addForm.expiration, 10) : null,
          price: addForm.price ? parseFloat(addForm.price) : null,
          is_composite: addForm.is_composite || false,
          components: addForm.is_composite ? addForm.components : null,
          opened_date: new Date().toISOString()
        }]);
      }
    }
    
    setIsSaving(false);
    setShowAddModal(false);
    setAddForm({ brand: '', name: '', domain: 'Crown', category: '', ingredients: '', weight: '5', expiration: '', price: '', is_composite: false, components: '' });
    setIsAutoWeight(true);
    setPhotoStatus('Offer or Scry Photo');
    setModalState('photo');
    fetchItems();
  };

  const handleBanishItem = (id, name) => {
    setBanishState({ id, name, reason: '', history: [], input: '', isTyping: false });
    handleBanishChatStart(name);
  };

  const handleBanishChatStart = async (name) => {
    setBanishState(prev => ({ ...prev, isTyping: true }));
    const { converseBanish } = await import('../lib/ai-service.js');
    const reply = await converseBanish({ name }, []);
    setBanishState(prev => {
      if (!prev) return null;
      return { ...prev, isTyping: false, history: [{ role: 'assistant', text: reply }] };
    });
  };

  const handleSendBanish = async () => {
    if (!banishState || !banishState.input.trim()) return;
    const userText = banishState.input.trim();
    
    setBanishState(prev => {
      const newHist = [...prev.history, { role: 'user', text: userText }];
      return { ...prev, history: newHist, input: '', isTyping: true };
    });
    
    const { converseBanish } = await import('../lib/ai-service.js');
    const currentHist = [...banishState.history, { role: 'user', text: userText }];
    const reply = await converseBanish({ name: banishState.name }, currentHist);
    
    const match = reply.match(/\[BANISH_REASON:\s*(.*?)\]/);
    if (match) {
      const extractedReason = match[1];
      setBanishState(prev => ({
        ...prev, 
        isTyping: false,
        reason: extractedReason,
        history: [...prev.history, { role: 'assistant', text: reply.replace(/\[BANISH_REASON:.*?\]/, '').trim() }]
      }));
    } else {
      setBanishState(prev => ({
        ...prev, 
        isTyping: false,
        history: [...prev.history, { role: 'assistant', text: reply }]
      }));
    }
  };

  const submitBanish = async () => {
    if (!banishState.reason) return;
    await supabase.from('items').update({
      lifecycle_state: 'banished',
      banish_reason: banishState.reason
    }).eq('id', banishState.id);
    setBanishState(null);
    fetchItems();
  };

  const handleAmendItem = (item) => {
    let ingStr = '';
    try {
      if (item.ingredients) {
        const parsed = typeof item.ingredients === 'string' ? JSON.parse(item.ingredients) : item.ingredients;
        ingStr = Array.isArray(parsed) ? parsed.join(', ') : '';
      }
    } catch (e) { ingStr = ''; }
    
    let wStr = '5';
    let isAuto = true;
    try {
      if (item.behavior_flags) {
        const b = typeof item.behavior_flags === 'string' ? JSON.parse(item.behavior_flags) : item.behavior_flags;
        if (b.layering_weight) {
          wStr = String(b.layering_weight);
          isAuto = false;
        }
      }
    } catch (e) {}

    setAddForm({
      id: item.id,
      brand: item.brand || '',
      name: item.name || '',
      domain: item.domain || 'Crown',
      category: item.category || '',
      ingredients: ingStr,
      weight: wStr,
      expiration: ''
    });
    setIsAutoWeight(isAuto);
    setModalState('manual');
    setShowAddModal(true);
  };

  const renderRow = (item) => {
    let statusPill = null;
    if (item.lifecycle_state === 'ebbing') {
      statusPill = <span className="pill eb">Ebbing</span>;
    } else if (item.lifecycle_state === 'hollow') {
      statusPill = <span className="pill ho">Hollow</span>;
    }
    
    return (
      <div className="row" key={item.id || item.name}>
        <div className="tg">
          <Icon name={item.glyph || G.tabRoot} />
        </div>
        <div style={{flex: 1}}>
          <div className="nm">
            {item.name} {statusPill}
          </div>
          <div className="mt">{item.brand} &bull; {item.category}</div>
        </div>
        <div className="acts">
          <button className="btn sm" onClick={() => handleAmendItem(item)}>Transmute</button>
          <button className="btn sm g" onClick={() => handleBanishItem(item.id, item.name)}>Banish</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="card"><div className="empty">Unearthing roots...</div></div>;
  }

  return (
    <div style={{padding: '1rem', maxWidth: '900px', margin: '0 auto'}}>
      <div className="card mb-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>The Apothecary <SpeakerButton text="The Apothecary" /></h3>
          <button className="btn plum" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }} onClick={() => {
            setAddForm({ brand: '', name: '', domain: 'Crown', category: '', ingredients: '', weight: '5', expiration: '' });
            setPhotoStatus('Offer or Scry Photo');
            setModalState('photo');
            setShowAddModal(true);
          }}>
            <Icon name="ph-plus" /> Inscribe Relic
          </button>
        </div>
        <div className="mt mb-4" style={{ textAlign: 'center' }}>Your sacred elixirs and treatments.</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {apothecary.length > 0 ? apothecary.map(renderRow) : <div className="empty">The shelves of your Apothecary stand empty.</div>}
        </div>
      </div>

      <div className="card mb-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Reliquary <SpeakerButton text="The Reliquary" /></h3>
        <div className="mt mb-4">Your instruments of ritual and restorative tools.</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {arsenal.length > 0 ? arsenal.map(renderRow) : <div className="empty">Your Reliquary contains no instruments.</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '1rem', width: '100%' }}>
        
        <div className="card mb-4" style={{ marginBottom: 0 }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Waning <SpeakerButton text="The Waning" /></h3>
          <div className="mt mb-4">Relics nearing the end of their mortal potency.</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {(() => {
              const waningItems = apothecary.filter(i => {
                if (!i.period_after_opening_months) return false;
                const start = i.opened_date ? new Date(i.opened_date) : new Date(i.created_at);
                const expiry = new Date(start.setMonth(start.getMonth() + parseInt(i.period_after_opening_months, 10)));
                const monthsLeft = (expiry - new Date()) / (1000 * 60 * 60 * 24 * 30);
                return monthsLeft > 0 && monthsLeft <= 2;
              });
              return waningItems.length === 0 ? <div className="mt">All relics remain potent.</div> : waningItems.map(renderRow);
            })()}
          </div>
        </div>

        <div className="card mb-4" style={{ marginBottom: 0 }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Summoning Scroll <SpeakerButton text="The Summoning Scroll" /></h3>
          <div className="mt mb-4">Items needing replenishment.</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {ebbing.length === 0 ? <div className="mt">No active summons.</div> : ebbing.map(renderRow)}
          </div>
        </div>

        <div className="card mb-4" style={{ marginBottom: 0, width: 'fit-content', margin: '0 auto' }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Silver Toll <SpeakerButton text="The Silver Toll" /></h3>
          <div className="mt mb-4" style={{ textAlign: 'center' }}>The material cost of your active rituals, tied to frequency of devotion.</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: 'var(--plum)' }}>
              ${(() => {
                const { amItems, pmItems } = buildBaseRoutines(items, {}, {});
                const activeIds = new Set([...amItems.map(i=>i.id), ...pmItems.map(i=>i.id)]);
                const activeItems = items.filter(i => activeIds.has(i.id));
                
                let totalMonthly = 0;
                activeItems.forEach(item => {
                  if (item.price && item.period_after_opening_months) {
                    const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
                    const months = parseInt(item.period_after_opening_months, 10) || 1;
                    let usesPerWeek = 7;
                    try {
                      if (item.behavior_flags) {
                        const b = typeof item.behavior_flags === 'string' ? JSON.parse(item.behavior_flags) : item.behavior_flags;
                        if (typeof b.uses_per_week === 'number') {
                          usesPerWeek = b.uses_per_week;
                        } else {
                           usesPerWeek = item.category?.toLowerCase().includes('mask') ? (item.category?.toLowerCase().includes('rinse') ? 2 : 5) : 7;
                        }
                      } else {
                         usesPerWeek = item.category?.toLowerCase().includes('mask') ? (item.category?.toLowerCase().includes('rinse') ? 2 : 5) : 7;
                      }
                    } catch(e) {
                      usesPerWeek = item.category?.toLowerCase().includes('mask') ? (item.category?.toLowerCase().includes('rinse') ? 2 : 5) : 7;
                    }
                    const usageFactor = usesPerWeek / 7;
                    totalMonthly += (price / months) * usageFactor;
                  }
                });
                return totalMonthly.toFixed(2);
              })()}
            </div>
          </div>
        </div>

        <div className="card mb-4" style={{ marginBottom: 0, width: 'fit-content', margin: '0 auto' }}>
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Echo <SpeakerButton text="The Echo" /></h3>
          <div className="mt mb-4" style={{ textAlign: 'center' }}>Reveal the hidden nature of a formula.</div>
          
          <div className="field" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label>Divine by Visage</label>
            <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.8rem', color: 'var(--plum)', cursor: 'pointer', borderRadius: '8px', width: '200px'}}>
              <Icon name={G.tabPool} /> 
              <span style={{marginTop: '0.5rem', textAlign: 'center', fontSize: '0.9rem'}}>Offer an image</span>
              <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handleEchoPhotoUpload} />
            </div>
          </div>

          <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <VoiceInput 
                isTextArea={true}
                placeholder="Or inscribe the formula's true name..."
                value={echoInput}
                onChange={(e) => setEchoInput(e.target.value)}
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--plum)', fontSize: '1.1rem' }}
              />
            </div>
            <button className="btn plum" onClick={handleEchoScry} style={{ minWidth: '120px' }}>Divine</button>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--plum)', minHeight: '1rem', }}>
            {echoStatus}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--plum)', whiteSpace: 'pre-wrap' }}>
            {echoResult}
          </div>
        </div>

      </div>


      {showAddModal && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content card" style={{maxWidth: '500px'}}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{color: 'var(--plum)'}}>The Relic Inscription</h3>
                <div className="mt mb-4" style={{color: 'var(--plum)'}}>Commit a new artifact to your Reliquary or vessel to the Apothecary.</div>
              </div>
              {modalState !== 'manual' && (
                <button className="btn sm" style={{padding: '0.4rem 1rem', whiteSpace: 'nowrap', flexShrink: 0}} onClick={() => setModalState('manual')} title="Manual Inscription">
                  Inscribe by Hand
                </button>
              )}
            </div>

            {modalState === 'photo' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--plum)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name={G.tabPool} /> 
                  <span style={{marginTop: '1rem', textAlign: 'center', fontSize: '1.2rem'}}>{photoStatus}</span>
                  <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                </div>
                
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--plum)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name="ph-images" />
                  <span style={{marginTop: '0.5rem', textAlign: 'center'}}>Summon Multiple Visions</span>
                  <input type="file" accept="image/*" multiple style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                  <button className="btn" onClick={() => setShowAddModal(false)}>Abandon</button>
                </div>
              </div>
            )}

            {modalState === 'confirm' && (
              <div style={{textAlign: 'center', padding: '1rem'}}>
                <div style={{color: 'var(--plum)', marginBottom: '1rem'}}>I divined:</div>
                <h2 style={{color: 'var(--plum)', marginBottom: '0.5rem'}}>
                  {addForm.brand ? `${addForm.brand} ` : ''}{addForm.name}
                </h2>
                <div style={{color: 'var(--dim)', marginBottom: '2rem'}}>{addForm.category}</div>
                
                <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                  <button className="btn" onClick={() => setModalState('photo')}>Reject Vision</button>
                  <button className="btn plum" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Inscribing...' : 'Inscribe'}
                  </button>
                </div>
              </div>
            )}

            {modalState === 'manual' && (
              <>
                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Divine by Visage (Optional)</label>
                  <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--plum)', cursor: 'pointer'}}>
                    <Icon name={G.tabPool} /> 
                    <span style={{marginTop: '0.5rem', textAlign: 'center'}}>{photoStatus}</span>
                    <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                  </div>
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Lineage or House (Optional)</label>
                  <VoiceInput value={addForm.brand} onChange={e => setAddForm({...addForm, brand: e.target.value})} />
                </div>
                
                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Name of the Relic</label>
                  <VoiceInput value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Period After Opening (Months)</label>
                  <input type="number" min="1" placeholder="e.g. 12" value={addForm.expiration} onChange={e => setAddForm({...addForm, expiration: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Anatomical Realm</label>
                  <select value={addForm.domain} onChange={e => setAddForm({...addForm, domain: e.target.value})} style={{color: 'var(--plum)'}}>
                    <option value="Crown">Crown (Hair & Scalp)</option>
                    <option value="Visage">Visage (Face)</option>
                    <option value="Gaze">Gaze (Eyes)</option>
                    <option value="Grin">Grin (Mouth & Teeth)</option>
                    <option value="Vessel">Vessel (Body)</option>
                  </select>
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Elixir Classification</label>
                  <VoiceInput placeholder="e.g. Purifier, Tincture, Veil" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Botanical Components & Herbs</label>
                  <VoiceInput isTextArea={true} placeholder="Transcribe the sacred components..." value={addForm.ingredients} onChange={e => setAddForm({...addForm, ingredients: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Material Offering (For The Silver Toll)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={addForm.price} onChange={e => setAddForm({...addForm, price: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--plum)', borderRadius: '4px' }} />
                </div>

                <div className="field">
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--plum)', cursor: 'pointer'}}>
                    <input type="checkbox" checked={addForm.is_composite} onChange={e => setAddForm({...addForm, is_composite: e.target.checked})} style={{accentColor: 'var(--plum)'}} />
                    This is a Composite Brew / Handmade Alchemy
                  </label>
                </div>

                {addForm.is_composite && (
                  <div className="field">
                    <label style={{color: 'var(--plum)'}}>Base Elements (What binds this alchemy?)</label>
                    <VoiceInput isTextArea={true} placeholder="e.g. Dead Sea Salt, Oil of Rose" value={addForm.components} onChange={e => setAddForm({...addForm, components: e.target.value})} />
                  </div>
                )}

                <div className="field">
                  <label style={{color: 'var(--plum)'}}>Aetheric Density (1=Fleeting, 10=Anchoring) - Override</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--plum)'}}>
                    <input type="range" min="1" max="10" step="1" style={{flex: 1}} value={addForm.weight} onChange={e => { setAddForm({...addForm, weight: e.target.value}); setIsAutoWeight(false); }} />
                    <span style={{width: '20px', textAlign: 'center'}}>{isAutoWeight ? 'Auto' : addForm.weight}</span>
                  </div>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                  <button className="btn" onClick={() => setShowAddModal(false)}>Abandon</button>
                  <button className="btn plum" onClick={handleSave} disabled={isSaving || !addForm.name}>
                    {isSaving ? 'Inscribing...' : 'Inscribe'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {banishState && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content card" style={{maxWidth: '500px'}}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{color: 'var(--plum)'}}>The Banishment of {banishState.name} <SpeakerButton text={`The Banishment of ${banishState.name}`} /></h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem', marginTop: '1rem', paddingRight: '0.5rem' }}>
              {banishState.history.map((msg, idx) => (
                <div key={idx} style={{ 
                  textAlign: msg.role === 'user' ? 'right' : 'left', 
                  marginBottom: '1rem',
                  color: msg.role === 'user' ? 'var(--text)' : 'var(--plum)'
                }}>
                  <div style={{ display: 'inline-block', background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'transparent', padding: msg.role === 'user' ? '0.5rem 1rem' : '0', borderRadius: '8px' }}>
                    {msg.text} {msg.role === 'assistant' && <SpeakerButton text={msg.text} style={{marginLeft: '0.4rem'}} />}
                  </div>
                </div>
              ))}
              {banishState.isTyping && <div style={{ color: 'var(--dim)', fontStyle: 'italic' }}>The Keeper is listening...</div>}
            </div>

            {!banishState.reason ? (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <VoiceInput 
                    isTextArea={true}
                    placeholder="Speak your reason..."
                    value={banishState.input}
                    onChange={(e) => setBanishState({...banishState, input: e.target.value})}
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--plum)', fontSize: '1rem', minHeight: '60px' }}
                  />
                </div>
                <button className="btn plum" onClick={handleSendBanish} disabled={banishState.isTyping || !banishState.input.trim()}>Reply</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ color: 'var(--plum)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  Reason sealed: <strong>{banishState.reason}</strong>
                </div>
                <button className="btn plum" onClick={submitBanish} style={{ width: '100%' }}>Seal in the Crypt</button>
              </div>
            )}

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
              <button className="btn" onClick={() => setBanishState(null)}>Abandon Banishment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

