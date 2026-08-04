import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';
import * as AI from '../lib/ai-service.js';
import { parseTeaImage } from '../lib/ai-engine.js';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';

export default function ShadowTome({ pose }) {
  const [moodsList, setMoodsList] = useState([]);
  const [selectedMoods, setSelectedMoods] = useState(new Set());
  const [entryText, setEntryText] = useState('');
  
  // THC Calc State
  const [thcStrength, setThcStrength] = useState(10);
  const [thcDose, setThcDose] = useState(5);
  const thcTotal = thcStrength * thcDose;

  // Breathwork State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathInst, setBreathInst] = useState('');
  const [breathCircle, setBreathCircle] = useState({ transform: 'scale(1)', borderColor: 'var(--plum)' });
  const [readiness, setReadiness] = useState('normal');
  
  const [history, setHistory] = useState([]);
  
  // Herbal Pantry State
  const [pantry, setPantry] = useState([]);
  const [showTeaModal, setShowTeaModal] = useState(false);
  const [teaModalState, setTeaModalState] = useState('photo'); // photo, manual, confirm
  const [teaStatus, setTeaStatus] = useState('Upload or Scan Photo');
  const [teaImages, setTeaImages] = useState([]);
  const [isSavingTea, setIsSavingTea] = useState(false);
  const [teaForm, setTeaForm] = useState({
    brand: '', name: '', ingredients: '', caffeine_content: '', steep_time: '', circadian_alignment: ''
  });

  const breathTimeout1Ref = useRef(null);
  const breathTimeout2Ref = useRef(null);
  const breathCycleRef = useRef(null);

  useEffect(() => {
    AI.generateMoods().then(list => setMoodsList(list || [])).catch(console.error);
    loadHistory();
    loadPantry();
    loadHealthData();
    
    return () => {
      clearBreathTimers();
    };
  }, []);

  const loadHistory = async () => {
    try {
      const { data } = await supabase.from('journal_entries').select('*').order('created_at', { ascending: false }).limit(5);
      if (data) setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPantry = async () => {
    try {
      const { data } = await supabase.from('shadowtome_elixirs').select('*').order('name');
      if (data) setPantry(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadHealthData = async () => {
    try {
      const { data } = await supabase.from('user_profile').select('health_data').single();
      if (data && data.health_data && data.health_data.readiness) {
        setReadiness(data.health_data.readiness.toLowerCase());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMood = (id) => {
    const next = new Set(selectedMoods);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMoods(next);
  };

  const handleSave = async () => {
    const moodsArray = Array.from(selectedMoods);
    if (entryText || moodsArray.length > 0) {
      await supabase.from('journal_entries').insert([{
        body_text: entryText,
        moods: moodsArray
      }]);
      setEntryText('');
      setSelectedMoods(new Set());
      loadHistory();
    }
  };

  const appendThcNote = () => {
    const note = `\u2728 Infusion: Consumed ${thcDose}ml of THC honey at ${thcStrength}mg/ml (Total Yield: ${thcTotal}mg THC).`;
    setEntryText(prev => prev ? prev + '\n\n' + note : note);
  };

  const appendTeaNote = (tea) => {
    const note = `\u2728 Elixir: Drank ${tea.brand ? tea.brand + ' ' : ''}${tea.name} (Caffeine: ${tea.caffeine_content || 'None'}).`;
    setEntryText(prev => prev ? prev + '\n\n' + note : note);
  };

  const clearBreathTimers = () => {
    if (breathTimeout1Ref.current) clearTimeout(breathTimeout1Ref.current);
    if (breathTimeout2Ref.current) clearTimeout(breathTimeout2Ref.current);
    if (breathCycleRef.current) clearTimeout(breathCycleRef.current);
  };

  const handleBanish = async (id) => {
    if (window.confirm("Unweave this spell from the tome? It cannot be recovered.")) {
      await supabase.from('journal_entries').delete().eq('id', id);
      loadHistory();
    }
  };

  const handleBanishTea = async (id, name) => {
    if (window.confirm(`Shatter the jar of ${name}? It cannot be recovered.`)) {
      await supabase.from('shadowtome_elixirs').delete().eq('id', id);
      loadPantry();
    }
  };

  const handleTeaUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    setTeaStatus('Staging photos...');
    setShowTeaModal(true);
    setTeaModalState('photo');
    
    const newImages = [];
    for (const file of files) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(',')[1];
      const mime = dataUrl.split(';')[0].split(':')[1];
      newImages.push({ base64, mediaType: mime, dataUrl });
    }
    
    setTeaImages(prev => [...prev, ...newImages]);
    setTeaStatus('Add more photos, or Cast Vision.');
  };

  const handleCastVision = async () => {
    if (teaImages.length === 0) return;
    setTeaStatus('Divining the leaves...');
    try {
      const details = await parseTeaImage(teaImages);
      setTeaForm(prev => ({
        ...prev,
        brand: details.brand || prev.brand,
        name: details.name || prev.name,
        ingredients: Array.isArray(details.ingredients) ? details.ingredients.join(', ') : details.ingredients,
        caffeine_content: details.caffeine_content || prev.caffeine_content,
        steep_time: details.steep_time || prev.steep_time,
        circadian_alignment: details.circadian_alignment || prev.circadian_alignment
      }));
      setTeaStatus('Vision extracted.');
      setTeaModalState('confirm');
    } catch (err) {
      console.error(err);
      setTeaStatus('Failed to divine image. ' + err.message);
    }
  };

  const closeTeaModal = () => {
    setShowTeaModal(false);
    setTeaImages([]);
    setTeaForm({ brand: '', name: '', ingredients: '', caffeine_content: '', steep_time: '', circadian_alignment: '' });
    setTeaStatus('Upload or Scan Photo');
    setTeaModalState('photo');
  };

  const handleSaveTea = async () => {
    if (!teaForm.name) return;
    setIsSavingTea(true);
    
    try {
      await supabase.from('shadowtome_elixirs').insert([{
        brand: teaForm.brand,
        name: teaForm.name,
        ingredients: JSON.stringify(teaForm.ingredients.split(',').map(s => s.trim()).filter(Boolean)),
        caffeine_content: teaForm.caffeine_content,
        steep_time: teaForm.steep_time,
        circadian_alignment: teaForm.circadian_alignment
      }]);
    } catch (err) {
      console.error("Save failed", err);
    }
    
    setIsSavingTea(false);
    closeTeaModal();
    loadPantry();
  };

  const startMeditation = () => {
    if (isBreathing) return;
    setIsBreathing(true);
    runMeditationCycle(3); // Run 3 cycles
  };

  const runMeditationCycle = (roundsLeft) => {
    if (roundsLeft === 0) {
      setIsBreathing(false);
      setBreathInst('Meditation Complete');
      setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'all 2s ease-in-out' });
      return;
    }

    if (readiness === 'low') {
      // Gentle Box Breathing (4-4-4-4) for low readiness
      setBreathInst('Inhale softly... (4s)');
      setBreathCircle({ transform: 'scale(1.5)', borderColor: 'var(--rose)', transition: 'transform 4s linear, border-color 4s ease' });
      
      breathTimeout1Ref.current = setTimeout(() => {
        setBreathInst('Hold gently... (4s)');
        setBreathCircle(prev => ({ ...prev, transform: 'scale(1.55)', transition: 'transform 4s linear' }));
      }, 4000);
      
      breathTimeout2Ref.current = setTimeout(() => {
        setBreathInst('Exhale slowly... (4s)');
        setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'transform 4s linear, border-color 4s ease' });
      }, 8000);

      // Third timeout for the bottom hold
      setTimeout(() => {
        if (!isBreathing) return; // Prevent race conditions if cancelled
        setBreathInst('Rest... (4s)');
        setBreathCircle(prev => ({ ...prev, transform: 'scale(0.95)', transition: 'transform 4s linear' }));
      }, 12000);

      breathCycleRef.current = setTimeout(() => {
        runMeditationCycle(roundsLeft - 1);
      }, 16000);

    } else {
      // Standard 4-7-8 Breathing
      setBreathInst('Inhale deeply... (4s)');
      setBreathCircle({ transform: 'scale(2)', borderColor: 'var(--rose)', transition: 'transform 4s linear, border-color 4s ease' });
      
      breathTimeout1Ref.current = setTimeout(() => {
        setBreathInst('Hold the breath... (7s)');
        setBreathCircle(prev => ({ ...prev, transform: 'scale(2.1)', transition: 'transform 7s linear' }));
      }, 4000);
      
      breathTimeout2Ref.current = setTimeout(() => {
        setBreathInst('Exhale slowly... (8s)');
        setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'transform 8s linear, border-color 8s ease' });
      }, 11000);

      breathCycleRef.current = setTimeout(() => {
        runMeditationCycle(roundsLeft - 1);
      }, 19000);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div className="tome-grid mt-4">
        
        {/* Left Column: Journal & History */}
        <div className="tome-main-col">
          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3>The Inner Sanctum</h3>
            <div className="note mb-4">"The ink is your own."</div>
            
            <div className="field" style={{ marginTop: '2.5rem' }}>
              <label>The Mood</label>
              <div className="chips" id="tome-moods">
                {moodsList.length === 0 ? (
                  <div style={{ opacity: 0.5 }}>Divining moods...</div>
                ) : (
                  moodsList.map(m => (
                    <span 
                      key={m.id} 
                      className={`chip ${selectedMoods.has(m.id) ? 'on' : ''}`} 
                      onClick={() => toggleMood(m.id)}
                    >
                      {m.label}
                    </span>
                  ))
                )}
              </div>
            </div>
            
            <div className="field" style={{ marginTop: '2.5rem' }}>
              <label>The Entry</label>
              <VoiceInput 
                isTextArea={true}
                placeholder="Inscribe your thoughts..."
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                style={{ minHeight: '200px', background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--rose)', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem' }}
              />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button id="btn-save-tome" className="btn plum" onClick={handleSave}>
                Seal the Page
              </button>
            </div>
          </div>

          <div id="tome-history" className="mt-4">
            {history.length === 0 ? (
              <div className="empty">The pages remain unmarked. No thoughts have been inscribed.</div>
            ) : (
              history.map(entry => (
                <div key={entry.id || entry.created_at} className="card mb-4" style={{ position: 'relative' }}>
                  <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div className="mt" style={{ margin: 0 }}>{new Date(entry.created_at).toLocaleDateString()}</div>
                    <button 
                      onClick={() => handleBanish(entry.id)} 
                      className="btn sm" 
                      style={{ background: 'transparent', border: '1px dashed rgba(212,28,60,0.4)', color: 'var(--dim)', fontSize: '0.7rem' }}
                      title="Unweave the spell"
                    >
                      <Icon name="ph-sparkle" /> Unweave
                    </button>
                  </div>

                  {entry.moods?.length > 0 && (
                    <div className="mb-2" style={{ color: 'var(--rose)', fontSize: '0.9rem' }}>
                      {entry.moods.join(' \u2022 ')}
                    </div>
                  )}
                  <div style={{ fontFamily: "'IM Fell English', serif", fontSize: '1.1rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {entry.body_text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>Herbal Elixirs</h3>
            
            <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px', marginTop: '1rem' }}>
              <Icon name="ph-camera" /> 
              <span style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '1rem' }}>Divine the Ingredients</span>
              <input type="file" accept="image/*" capture="environment" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} onChange={handleTeaUpload} />
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => { setShowTeaModal(true); setTeaModalState('manual'); }}>Inscribe by Hand</button>
            </div>
          </div>

          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>The Herbal Pantry</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pantry.length > 0 ? pantry.map(tea => (
                <div className="row" key={tea.id} style={{ alignItems: 'flex-start' }}>
                  <div className="tg">
                    <Icon name="ph-leaf" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="nm">{tea.name}</div>
                    <div className="mt">{tea.brand} &bull; {tea.circadian_alignment}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--dim)', marginTop: '0.2rem' }}>
                      <span style={{ color: 'var(--rose)' }}>The Steeping:</span> {tea.steep_time} <br/>
                      <span style={{ color: 'var(--rose)' }}>Caffeine:</span> {tea.caffeine_content}
                    </div>
                  </div>
                  <div className="acts" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn sm" onClick={() => appendTeaNote(tea)}>Imbibe</button>
                    <button className="btn sm g" onClick={() => handleBanishTea(tea.id, tea.name)}>Shatter Jar</button>
                  </div>
                </div>
              )) : (
                <div className="empty">No elixirs in the pantry.</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>The THC Infusions</h3>
            <div className="mt mb-4">Document the potency of infused provisions.</div>
            
            <div className="field">
              <label>Concentration (mg/ml)</label>
              <input type="number" value={thcStrength} onChange={e => setThcStrength(Number(e.target.value))} style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', padding: '0.5rem', color: 'var(--rose)', borderRadius: '6px' }} />
            </div>
            
            <div className="field">
              <label>Amount Used (ml)</label>
              <input type="number" value={thcDose} onChange={e => setThcDose(Number(e.target.value))} style={{ width: '100%', background: 'var(--card2)', border: '1px solid var(--border)', padding: '0.5rem', color: 'var(--rose)', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px dashed var(--border)', paddingTop: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--dim)' }}>Total Yield</div>
                <div style={{ fontSize: '1.5rem', color: 'var(--rose)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'normal' }}>{thcTotal}mg</div>
              </div>
              <button className="btn" onClick={appendThcNote} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                Append to Journal
              </button>
            </div>
          </div>

          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>The Centering Wind</h3>
            <div className="mt mb-4" style={{ fontSize: '0.85rem' }}>
              {readiness === 'low' ? 'Gentle 4-4-4-4 box breathing for low readiness.' : 'A 4-7-8 cycle to calm the spirit.'}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 0' }}>
              <div 
                id="breath-circle" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  border: '2px solid',
                  ...breathCircle 
                }}
              ></div>
              <div id="breath-inst" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: 'var(--rose)', height: '1.5rem', textAlign: 'center' }}>
                {breathInst}
              </div>
              <button id="btn-breath" className="btn plum" onClick={startMeditation} disabled={isBreathing} style={{ width: '100%' }}>
                {isBreathing ? 'Meditating...' : 'Draw Breath'}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Tea Scanner Modal */}
      {showTeaModal && (
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-content card" style={{maxWidth: '500px'}}>
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h3 style={{color: 'var(--rose)'}}>Inscribe Herbal Elixir</h3>
                <div className="mt mb-4" style={{color: 'var(--rose)'}}>Introduce a new blend to your pantry.</div>
              </div>
              {teaModalState !== 'manual' && (
                <button className="btn sm" style={{background: 'transparent', padding: '0.4rem', color: 'var(--rose)'}} onClick={() => setTeaModalState('manual')} title="Manual Inscription">
                  <Icon name="ph-dots-three" />
                </button>
              )}
            </div>

            {teaModalState === 'photo' && (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name="ph-camera" /> 
                  <span style={{marginTop: '1rem', textAlign: 'center', fontSize: '1.2rem'}}>{teaImages.length > 0 ? 'Snap another photo' : 'Snap front of box / leaves'}</span>
                  <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handleTeaUpload} />
                </div>
                
                <div style={{position: 'relative', overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--rose)', cursor: 'pointer', borderRadius: '8px'}}>
                  <Icon name="ph-images" />
                  <span style={{marginTop: '0.5rem', textAlign: 'center'}}>Upload multiple from gallery</span>
                  <input type="file" accept="image/*" multiple style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handleTeaUpload} />
                </div>

                {teaImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
                    {teaImages.map((img, i) => (
                      <img key={i} src={img.dataUrl} alt={`Staged ${i}`} style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                )}
                
                {teaImages.length > 0 && <div style={{textAlign: 'center', color: 'var(--rose)', fontStyle: 'italic'}}>{teaStatus}</div>}

                <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
                  <button className="btn" onClick={closeTeaModal}>Abandon</button>
                  <button className="btn plum" disabled={teaImages.length === 0 || teaStatus === 'Divining the leaves...'} onClick={handleCastVision}>
                    {teaStatus === 'Divining the leaves...' ? 'Divining...' : 'Cast Vision'}
                  </button>
                </div>
              </div>
            )}

            {teaModalState === 'confirm' && (
              <div style={{textAlign: 'center', padding: '1rem'}}>
                <div style={{color: 'var(--rose)', fontStyle: 'italic', marginBottom: '1rem'}}>I divined:</div>
                <h2 style={{fontFamily: "'Cormorant Garamond', serif", color: 'var(--rose)', marginBottom: '0.5rem'}}>
                  {teaForm.brand ? `${teaForm.brand} ` : ''}{teaForm.name}
                </h2>
                <div style={{color: 'var(--dim)', marginBottom: '1rem'}}>
                  The Steeping: {teaForm.steep_time} <br/>
                  Circadian Alignment: {teaForm.circadian_alignment} <br/>
                  Caffeine: {teaForm.caffeine_content}
                </div>
                
                <div style={{display: 'flex', justifyContent: 'center', gap: '1rem'}}>
                  <button className="btn" onClick={() => setTeaModalState('photo')}>Reject Vision</button>
                  <button className="btn plum" onClick={handleSaveTea} disabled={isSavingTea}>
                    {isSavingTea ? 'Inscribing...' : 'Seal in Pantry'}
                  </button>
                </div>
              </div>
            )}

            {teaModalState === 'manual' && (
              <>
                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Photo Scan (Optional Override)</label>
                  <div style={{position: 'relative', overflow: 'hidden', background: 'var(--card2)', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', color: 'var(--rose)', cursor: 'pointer'}}>
                    <Icon name="ph-camera" /> 
                    <span style={{marginTop: '0.5rem', textAlign: 'center'}}>{teaStatus}</span>
                    <input type="file" accept="image/*" capture="environment" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} onChange={handleTeaUpload} />
                  </div>
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Brand (Optional)</label>
                  <VoiceInput value={teaForm.brand} onChange={e => setTeaForm({...teaForm, brand: e.target.value})} />
                </div>
                
                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Blend Name</label>
                  <VoiceInput value={teaForm.name} onChange={e => setTeaForm({...teaForm, name: e.target.value})} />
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>The Steeping (Time & Temp)</label>
                  <VoiceInput value={teaForm.steep_time} onChange={e => setTeaForm({...teaForm, steep_time: e.target.value})} />
                </div>
                
                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Circadian Alignment</label>
                  <select value={teaForm.circadian_alignment} onChange={e => setTeaForm({...teaForm, circadian_alignment: e.target.value})} style={{color: 'var(--rose)'}}>
                    <option value="">Select...</option>
                    <option value="Daytime">Daytime</option>
                    <option value="Nighttime">Nighttime</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </div>
                
                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Caffeine</label>
                  <select value={teaForm.caffeine_content} onChange={e => setTeaForm({...teaForm, caffeine_content: e.target.value})} style={{color: 'var(--rose)'}}>
                    <option value="">Select...</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                    <option value="None">None</option>
                  </select>
                </div>

                <div className="field">
                  <label style={{color: 'var(--rose)'}}>Ingredients</label>
                  <VoiceInput isTextArea={true} placeholder="Paste ingredients list..." value={teaForm.ingredients} onChange={e => setTeaForm({...teaForm, ingredients: e.target.value})} />
                </div>
                
                <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem'}}>
                  <button className="btn" onClick={closeTeaModal}>Abandon</button>
                  <button className="btn plum" onClick={handleSaveTea} disabled={isSavingTea || !teaForm.name}>
                    {isSavingTea ? 'Inscribing...' : 'Seal in Pantry'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
