import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';
import { attachVoice } from '../lib/voice.js';
import { buildRoutines } from '../lib/routine-engine.js';

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
  const [photoStatus, setPhotoStatus] = useState('Upload or Scan Photo');
  const [modalState, setModalState] = useState('photo');
  const [banishState, setBanishState] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('items').select('*').order('name');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const ebbing = items.filter(i => i.lifecycle_state === 'ebbing' || i.lifecycle_state === 'hollow');
  const apothecary = items.filter(i => i.type === 'product' && !['ebbing', 'hollow', 'banished'].includes(i.lifecycle_state));
  const arsenal = items.filter(i => i.type === 'tool' && i.lifecycle_state !== 'banished');

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
        setPhotoStatus('Failed to divine image.');
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
          glyph: aiResult.glyph
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
          glyph: aiResult.glyph,
          type: 'product',
          lifecycle_state: 'stocked'
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
          category: addForm.category
        }).eq('id', addForm.id);
      } else {
        await supabase.from('items').insert([{
          brand: addForm.brand, 
          name: addForm.name, 
          domain: addForm.domain, 
          category: addForm.category, 
          type: 'product', 
          lifecycle_state: 'stocked'
        }]);
      }
    }
    
    setIsSaving(false);
    setShowAddModal(false);
    setAddForm({ brand: '', name: '', domain: 'Crown', category: '', ingredients: '', weight: '5', expiration: '' });
    setIsAutoWeight(true);
    setPhotoStatus('Upload or Scan Photo');
    setModalState('photo');
    fetchItems();
  };

  const handleBanishItem = (id, name) => {
    setBanishState({ id, name, reason: '' });
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
          <button className="btn sm" onClick={() => handleAmendItem(item)}>Amend</button>
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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 style={{ fontFamily: "'Allura', cursive", fontSize: '3rem', margin: 0, color: 'var(--rose)' }}>The Rootwork</h2>
        <button className="btn plum sm" onClick={() => {
          setAddForm({ brand: '', name: '', domain: 'Crown', category: '', ingredients: '', weight: '5', expiration: '' });
          setPhotoStatus('Upload or Scan Photo');
          setModalState('photo');
          setShowAddModal(true);
        }}>
          <Icon name="ph-plus" /> Inscribe Item
        </button>
      </div>

      {ebbing.length > 0 && (
        <div className="card mb-4">
          <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
          <h3>The Summoning Scroll</h3>
          <div className="mt mb-4">Items needing replenishment.</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {ebbing.map(renderRow)}
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Silver Toll</h3>
        <div className="mt mb-4">Estimated monthly cost of your active routines.</div>
        <div>
          <div style={{ fontSize: '2rem', fontFamily: "'Allura', cursive", color: 'var(--rose)' }}>
            ${(() => {
              const { amItems, pmItems } = buildRoutines(items, {}, {});
              const activeIds = new Set([...amItems.map(i=>i.id), ...pmItems.map(i=>i.id)]);
              const activeItems = items.filter(i => activeIds.has(i.id));
              
              let totalMonthly = 0;
              activeItems.forEach(item => {
                if (item.price && item.pao_months) {
                  // Rough estimate: Price / PAO months
                  const price = parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0;
                  const months = parseInt(item.pao_months, 10) || 1;
                  totalMonthly += (price / months);
                }
              });
              return totalMonthly.toFixed(2);
            })()}
          </div>
          <div className="mt" style={{opacity:0.7}}>Calculated by averaging purchase price over the formula's Period-After-Opening lifespan.</div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Apothecary</h3>
        <div className="mt mb-4">Consumable preparations.</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {apothecary.length > 0 ? apothecary.map(renderRow) : <div className="empty">No active preparations.</div>}
        </div>
      </div>

      <div className="card mb-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Arsenal</h3>
        <div className="mt mb-4">Durable tools.</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {arsenal.length > 0 ? arsenal.map(renderRow) : <div className="empty">No tools gathered.</div>}
        </div>
      </div>
      

      {showAddModal && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content card" style={{maxWidth: '500px'}}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{color: 'var(--rose)'}}>Inscribe Rootwork</h3>
                <div className="mt mb-4" style={{color: 'var(--rose)'}}>Introduce a new item to your codex.</div>
              </div>
              {modalState !== 'manual' && (
                <button className="btn sm" style={{background: 'transparent', padding: '0.4rem', color: 'var(--rose)'}} onClick={() => setModalState('manual')} title="Manual Inscription">
                  <Icon name="ph-dots-three" />
                </button>
              )}
            </div>

            {modalState === 'photo' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name={G.tabPool} /> 
                  <span style={{marginTop: '1rem', textAlign: 'center', fontSize: '1.2rem'}}>{photoStatus}</span>
                  <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                </div>
                
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name="ph-images" />
                  <span style={{marginTop: '0.5rem', textAlign: 'center'}}>Bulk Upload</span>
                  <input type="file" accept="image/*" multiple style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                </div>

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                  <button className="btn" onClick={() => setShowAddModal(false)}>Abandon</button>
                </div>
              </div>
            )}

            {modalState === 'confirm' && (
              <div style={{textAlign: 'center', padding: '1rem'}}>
                <div style={{color: 'var(--rose)', fontStyle: 'italic', marginBottom: '1rem'}}>I divined:</div>
                <h2 style={{fontFamily: "'Cormorant Garamond', serif", color: 'var(--rose)', marginBottom: '0.5rem'}}>
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
                  <label style={{color: 'var(--rose)'}}>Photo Scan (Optional Override)</label>
                  <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--rose)', cursor: 'pointer'}}>
                    <Icon name={G.tabPool} /> 
                    <span style={{marginTop: '0.5rem', textAlign: 'center'}}>{photoStatus}</span>
                    <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
                  </div>
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Brand (Optional)</label>
                  <VoiceInput value={addForm.brand} onChange={e => setAddForm({...addForm, brand: e.target.value})} />
                </div>
                
                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Product Name</label>
                  <VoiceInput value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Expiration Date</label>
                  <input type="date" value={addForm.expiration} onChange={e => setAddForm({...addForm, expiration: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--rose)', fontFamily: 'var(--body-font)', borderRadius: '4px' }} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Domain</label>
                  <select value={addForm.domain} onChange={e => setAddForm({...addForm, domain: e.target.value})} style={{color: 'var(--rose)'}}>
                    <option value="Crown">Crown (Hair & Scalp)</option>
                    <option value="Visage">Visage (Face)</option>
                    <option value="Gaze">Gaze (Eyes)</option>
                    <option value="Grin">Grin (Mouth & Teeth)</option>
                    <option value="Vessel">Vessel (Body)</option>
                  </select>
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Category</label>
                  <VoiceInput placeholder="e.g. Cleanser, Serum, Mask" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Ingredients</label>
                  <VoiceInput isTextArea={true} placeholder="Paste ingredients list..." value={addForm.ingredients} onChange={e => setAddForm({...addForm, ingredients: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Layering Weight (1=Lightest, 10=Heaviest) - Optional Override</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--rose)'}}>
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
            <h3 style={{color: 'var(--rose)'}}>Banish {banishState.name}</h3>
            <div className="mt mb-4" style={{color: 'var(--rose)'}}>
              Why are you banishing this from the rootwork? (e.g. Adverse reaction, discontinued, ineffective)
            </div>
            <div className="field">
              <VoiceInput 
                isTextArea={true} 
                value={banishState.reason} 
                onChange={e => setBanishState({...banishState, reason: e.target.value})} 
                placeholder="Speak your reason..."
              />
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
              <button className="btn" onClick={() => setBanishState(null)}>Abandon</button>
              <button className="btn plum" onClick={submitBanish} disabled={!banishState.reason}>Seal in the Crypt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
