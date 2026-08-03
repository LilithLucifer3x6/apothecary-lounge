import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { ic, G } from '../lib/icons.js';
import { attachVoice } from '../lib/voice.js';
import * as AI from '../lib/ai-service.js';
import { getReadiness } from '../lib/health-connect.js';
import Icon from '../components/Icon.jsx';
import VoiceInput from '../components/VoiceInput.jsx';

export default function ShadowTome({ pose }) {
  const [readiness, setReadiness] = useState(null);
  const [healthEnabled, setHealthEnabled] = useState(false);
  
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
  
  const [history, setHistory] = useState([]);
  const breathTimeout1Ref = useRef(null);
  const breathTimeout2Ref = useRef(null);
  const breathCycleRef = useRef(null);

  useEffect(() => {
    const settingsStr = localStorage.getItem('app_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    
    if (settings.health) {
      setHealthEnabled(true);
      getReadiness().then(res => {
        if (res) setReadiness(res);
      }).catch(console.error);
    }
    
    AI.generateMoods().then(list => setMoodsList(list || [])).catch(console.error);
    loadHistory();
    
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

  const clearBreathTimers = () => {
    if (breathTimeout1Ref.current) clearTimeout(breathTimeout1Ref.current);
    if (breathTimeout2Ref.current) clearTimeout(breathTimeout2Ref.current);
    if (breathCycleRef.current) clearTimeout(breathCycleRef.current);
  };

  const startMeditation = () => {
    if (isBreathing) return;
    setIsBreathing(true);
    runMeditationCycle(3); // Run 3 cycles of 4-7-8 breathing
  };

  const runMeditationCycle = (roundsLeft) => {
    if (roundsLeft === 0) {
      setIsBreathing(false);
      setBreathInst('Meditation Complete');
      setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'all 2s ease-in-out' });
      return;
    }

    setBreathInst('Inhale deeply... (4s)');
    setBreathCircle({ transform: 'scale(2)', borderColor: 'var(--rose)', transition: 'transform 4s linear, border-color 4s ease' });
    
    breathTimeout1Ref.current = setTimeout(() => {
      setBreathInst('Hold the breath... (7s)');
      // Keep it expanded
      setBreathCircle(prev => ({ ...prev, transform: 'scale(2.1)', transition: 'transform 7s linear' }));
    }, 4000);
    
    breathTimeout2Ref.current = setTimeout(() => {
      setBreathInst('Exhale slowly... (8s)');
      setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'transform 8s linear, border-color 8s ease' });
    }, 11000);

    breathCycleRef.current = setTimeout(() => {
      runMeditationCycle(roundsLeft - 1);
    }, 19000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start', marginTop: '1rem' }}>
        
        {/* Left Column: Journal & History */}
        <div style={{ gridColumn: '1 / span 2' }} className="tome-main-col">
          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3>The Inner Sanctum</h3>
            <div className="note mb-4">"The ink is your own. Nothing written here is read by any other part of this place."</div>
            
            {healthEnabled ? (
              readiness ? (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '3rem', fontFamily: "'IM Fell English', serif", color: 'var(--rose)', minWidth: '40px', textAlign: 'center' }}>{readiness.score}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--rose)' }}>Readiness: {readiness.state.charAt(0).toUpperCase() + readiness.state.slice(1)}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--rose)' }}>Data from Android Health Connect</div>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--rose)' }}>
                  Divining readiness...
                </div>
              )
            ) : (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(17,14,21,0.5)', border: '1px dashed var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--rose)' }}>
                Enable Health Connect in Settings to divine your physical readiness.
              </div>
            )}
            
            <div className="field mt-4">
              <label>The Mood</label>
              <div className="chips" id="tome-moods">
                {moodsList.length === 0 ? (
                  <div style={{ opacity: 0.5 }}>Divining moods...</div>
                ) : (
                  moodsList.map(m => (
                    <div 
                      key={m.id} 
                      className={`chip ${selectedMoods.has(m.id) ? 'on' : ''}`} 
                      onClick={() => toggleMood(m.id)}
                    >
                      {m.label}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="field mt-4">
              <label>The Entry</label>
              <VoiceInput 
                isTextArea={true}
                placeholder="Inscribe your thoughts..."
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                style={{ minHeight: '200px', background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--rose)', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem' }}
              />
            </div>
            
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button id="btn-save-tome" className="btn plum" onClick={handleSave}>
                Seal the Page
              </button>
            </div>
          </div>

          <div id="tome-history" className="mt-4">
            {history.length === 0 ? (
              <div className="empty">No pages have been inscribed.</div>
            ) : (
              history.map(entry => (
                <div key={entry.id || entry.created_at} className="card mb-4">
                  <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
                  <div className="mt mb-2">{new Date(entry.created_at).toLocaleDateString()}</div>
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
        <div style={{ gridColumn: 'auto / span 1', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>THC Infusions</h3>
            <div className="mt mb-4">Track infused honey dosages.</div>
            
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
                <div style={{ fontSize: '1.5rem', color: 'var(--rose)', fontFamily: "'Cormorant Garamond', serif", fontWeight: 'bold' }}>{thcTotal}mg</div>
              </div>
              <button className="btn" onClick={appendThcNote} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                Append to Journal
              </button>
            </div>
          </div>

          <div className="card">
            <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
            <h3 style={{ fontSize: '1.5rem' }}>Breathing Space</h3>
            <div className="mt mb-4" style={{ fontSize: '0.85rem' }}>Automated 4-7-8 mindful meditation.</div>
            
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
                {isBreathing ? 'Meditating...' : 'Begin Meditation'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
