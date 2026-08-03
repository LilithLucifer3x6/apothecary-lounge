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
  
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathInst, setBreathInst] = useState('');
  const [breathCircle, setBreathCircle] = useState({ transform: 'scale(1)', borderColor: 'var(--plum)' });
  
  const [history, setHistory] = useState([]);
  const breathIntervalRef = useRef(null);
  const breathTimeout1Ref = useRef(null);
  const breathTimeout2Ref = useRef(null);

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

  const clearBreathTimers = () => {
    if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    if (breathTimeout1Ref.current) clearTimeout(breathTimeout1Ref.current);
    if (breathTimeout2Ref.current) clearTimeout(breathTimeout2Ref.current);
  };

  const toggleBreathing = () => {
    if (isBreathing) {
      clearBreathTimers();
      setIsBreathing(false);
      setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'all 1s linear' });
      setBreathInst('');
    } else {
      setIsBreathing(true);
      breathCycle();
      breathIntervalRef.current = setInterval(breathCycle, 19000);
    }
  };

  const breathCycle = () => {
    setBreathInst('Inhale deeply...');
    setBreathCircle({ transform: 'scale(2.5)', borderColor: 'var(--rose)', transition: 'transform 4s ease-in-out, border-color 4s ease' });
    
    breathTimeout1Ref.current = setTimeout(() => {
      setBreathInst('Hold the breath...');
    }, 4000);
    
    breathTimeout2Ref.current = setTimeout(() => {
      setBreathInst('Exhale slowly...');
      setBreathCircle({ transform: 'scale(1)', borderColor: 'var(--plum)', transition: 'transform 8s ease-in-out, border-color 8s ease' });
    }, 11000);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      
      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Inner Sanctum</h3>
        <div className="note mb-4">"The ink is your own. Nothing written here is read by any other part of this place."</div>
        
        {healthEnabled ? (
          readiness ? (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', fontFamily: "'IM Fell English', serif" }}>{readiness.score}</div>
              <div>
                <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>Readiness: {readiness.state.charAt(0).toUpperCase() + readiness.state.slice(1)}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--dim)' }}>Data from Android Health Connect</div>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--card3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--dim)' }}>
              Divining readiness...
            </div>
          )
        ) : (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(17,14,21,0.5)', border: '1px dashed var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--dim)' }}>
            Enable Health Connect in Settings to divine your physical readiness.
          </div>
        )}
        
        <div className="field">
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
            style={{ minHeight: '200px', background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--white)', fontFamily: "'IM Fell English', serif", fontSize: '1.1rem' }}
          />
        </div>
        
        <div style={{ textAlign: 'right', marginTop: '1rem' }}>
          <button id="btn-save-tome" className="btn plum" onClick={handleSave}>
            Seal the Page
          </button>
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>Herbal Elixirs & Apothecary Dosage</h3>
        <div className="mt mb-4">Calculate tincture and herbal infusion concentrations.</div>
        
        <div className="row">
          <div style={{ flex: 1, minWidth: '150px' }}>
            <label className="fl">Total Volume (ml)</label>
            <input type="number" defaultValue="30" style={{ width: '100%', marginBottom: '0.5rem' }} />
            <label className="fl">Concentration (mg/ml)</label>
            <input type="number" defaultValue="50" style={{ width: '100%' }} />
          </div>
          <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <button className="btn plum" onClick={() => alert('Total Yield: 1500mg. Dosage per drop (~0.05ml): 2.5mg.')}>Divine the Yield</button>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
        <h3>The Breathing Space</h3>
        <div className="mt mb-4">Inhale 4s &bull; Hold 7s &bull; Exhale 8s</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem 0' }}>
          <div 
            id="breath-circle" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              border: '2px solid',
              ...breathCircle 
            }}
          ></div>
          <button id="btn-breath" className="btn" onClick={toggleBreathing}>
            {isBreathing ? 'Release Breath' : 'Draw Breath'}
          </button>
          <div id="breath-inst" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: 'var(--rose)', height: '2rem' }}>
            {breathInst}
          </div>
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
  );
}
