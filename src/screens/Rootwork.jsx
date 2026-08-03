import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { G } from '../lib/icons.js';
import Icon from '../components/Icon.jsx';
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
  });
  const [isAutoWeight, setIsAutoWeight] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [photoStatus, setPhotoStatus] = useState('Upload or take a photo');

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('items').select('*').order('name');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    attachVoice();
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
      
      await supabase.from('items').insert([{
        brand: addForm.brand,
        name: addForm.name,
        domain: addForm.domain,
        category: addForm.category,
        ingredients: JSON.stringify(ingArray),
        risk_flags: JSON.stringify(aiResult.risk_flags || {}),
        behavior_flags: JSON.stringify(bFlags),
        glyph: aiResult.glyph,
        type: 'product',
        lifecycle_state: 'stocked'
      }]);
    } catch (err) {
      console.error("AI Analysis failed", err);
      // Fallback
      await supabase.from('items').insert([{
        brand: addForm.brand, 
        name: addForm.name, 
        domain: addForm.domain, 
        category: addForm.category, 
        type: 'product', 
        lifecycle_state: 'stocked'
      }]);
    }
    
    setIsSaving(false);
    setShowAddModal(false);
    setAddForm({ brand: '', name: '', domain: 'Crown', category: '', ingredients: '', weight: '5' });
    setIsAutoWeight(true);
    setPhotoStatus('Upload or take a photo');
    fetchItems();
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
          <button className="btn sm">Amend</button>
          <button className="btn sm g">Banish</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="card"><div className="empty">Unearthing roots...</div></div>;
  }

  return (
    <div style={{padding: '1rem', maxWidth: '900px', margin: '0 auto'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', gap: '1rem'}}>
        <h2 style={{fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', color: 'var(--parch)', margin: 0, textAlign: 'center'}}>The Rootwork</h2>
        <button className="btn plum" onClick={() => setShowAddModal(true)}>+ Add to Inventory</button>
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
          <div style={{ fontSize: '2rem', fontFamily: "'Pinyon Script', cursive", color: 'var(--candle)' }}>
            ${(() => {
              const { amItems, pmItems } = buildRoutines(items, {}, {});
              const activeIds = new Set([...amItems.map(i=>i.id), ...pmItems.map(i=>i.id)]);
              const activeItems = items.filter(i => activeIds.has(i.id));
              
              let totalMonthly = 0;
              activeItems.forEach(item => {
                if (item.price && item.pao_months) {
                  // Rough estimate: Price / PAO months
                  const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
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
      
      <div className="card mb-4" style={{textAlign: 'center'}}>
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Silver Toll</h3>
        <div className="mt">Estimated Monthly Routine Cost</div>
        <div style={{fontSize: '2rem', fontFamily: "'Cormorant Garamond', serif", color: 'var(--gold)', marginTop: '1rem'}}>$0.00</div>
      </div>

      {showAddModal && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content card" style={{maxWidth: '500px'}}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3>Add to Rootwork</h3>
            <div className="mt mb-4">Inscribe a new item into the codex.</div>
            
            <div className="field">
              <label>Photo Scan</label>
              <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--dim)', cursor: 'pointer'}}>
                <Icon name={G.tabPool} /> 
                <span style={{marginTop: '0.5rem', textAlign: 'center'}}>{photoStatus}</span>
                <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handlePhotoUpload} />
              </div>
            </div>

            <div className="field">
              <label>Brand</label>
              <div className="ip mic">
                <input type="text" value={addForm.brand} onChange={e => setAddForm({...addForm, brand: e.target.value})} />
              </div>
            </div>
            <div className="field">
              <label>Name</label>
              <div className="ip mic">
                <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} />
              </div>
            </div>
            <div className="field">
              <label>Domain</label>
              <select value={addForm.domain} onChange={e => setAddForm({...addForm, domain: e.target.value})}>
                <option value="Crown">Crown (Hair & Scalp)</option>
                <option value="Visage">Visage (Face)</option>
                <option value="Gaze">Gaze (Eyes)</option>
                <option value="Grin">Grin (Mouth & Teeth)</option>
                <option value="Vessel">Vessel (Body)</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <div className="ip mic">
                <input type="text" placeholder="e.g. Cleanser, Serum, Mask" value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} />
              </div>
            </div>
            <div className="field">
              <label>Ingredients (Optional)</label>
              <div className="ip">
                <textarea rows="3" placeholder="Paste ingredients list..." value={addForm.ingredients} onChange={e => setAddForm({...addForm, ingredients: e.target.value})}></textarea>
              </div>
            </div>
            <div className="field">
              <label>Layering Weight (1=Lightest, 10=Heaviest) - Optional Override</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                <input type="range" min="1" max="10" step="1" style={{flex: 1}} value={addForm.weight} onChange={e => { setAddForm({...addForm, weight: e.target.value}); setIsAutoWeight(false); }} />
                <span style={{width: '20px', textAlign: 'center'}}>{isAutoWeight ? 'Auto' : addForm.weight}</span>
              </div>
            </div>
            
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
              <button className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn plum" onClick={handleSave} disabled={isSaving || !addForm.name}>
                {isSaving ? 'Divining...' : 'Enshrine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
