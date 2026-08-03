import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase.js';
import { attachVoice } from '../lib/voice.js';
import { speakerMarkup } from '../lib/tts.js';
import * as AI from '../lib/ai-service.js';
import Icon from '../components/Icon.jsx';
import { G } from '../lib/icons.js';

import VoiceInput from '../components/VoiceInput.jsx';

export default function Intake({ onComplete }) {
  const [path, setPath] = useState('ai');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Fast Path State
  const [concernsOptions, setConcernsOptions] = useState([]);
  const [conditionsOptions, setConditionsOptions] = useState([]);
  const [traditionsOptions, setTraditionsOptions] = useState([]);
  
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedTraditions, setSelectedTraditions] = useState([]);
  
  const [rxList, setRxList] = useState([]);
  const [oralList, setOralList] = useState([]);
  const [algList, setAlgList] = useState(['Lavender']);
  const [newAlg, setNewAlg] = useState('');
  
  const [noRx, setNoRx] = useState(false);
  const [noOral, setNoOral] = useState(false);
  const [noAlg, setNoAlg] = useState(false);

  // AI Path State
  const [isReady, setIsReady] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Greetings. I am the Keeper of The Lounge. Let us prepare your chamber. What brings you to this place?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatLogRef = useRef(null);

  useEffect(() => {
    AI.generateConcerns().then(setConcernsOptions);
    AI.generateConditions().then(setConditionsOptions);
    AI.generateTraditions().then(setTraditionsOptions);
    
    import('../lib/ai-engine.js').then(({ isAiReady }) => {
      setIsReady(isAiReady());
    });
  }, []);

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSetAiKey = async (e) => {
    e.preventDefault();
    const key = prompt('Enter Anthropic API Key:');
    if (key) {
      const { initAnthropic } = await import('../lib/ai-engine.js');
      initAnthropic(key);
      setIsReady(true);
      setAiStatus('AI activated.');
      setTimeout(() => setAiStatus(''), 2000);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    
    setChatInput('');
    const newHistory = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);
    setAiStatus('The Keeper is listening...');
    
    try {
      const { conductIntake } = await import('../lib/ai-engine.js');
      const { reply, extractedData } = await conductIntake(newHistory);
      
      setAiStatus('');
      setChatHistory(prev => [...prev, { role: 'assistant', content: reply }]);
      
      if (extractedData) {
        setAiStatus('The Keeper has finished divining your answers.');
        const avatarConfig = JSON.parse(localStorage.getItem('avatar_config') || '{}');
        const { data: existing } = await supabase.from('user_profile').select('id').maybeSingle();
        const profileData = {
          intake_completed: true,
          intake_answers: extractedData,
          avatar_config: avatarConfig
        };
        if (existing) {
          await supabase.from('user_profile').update(profileData).eq('id', existing.id);
        } else {
          await supabase.from('user_profile').insert([profileData]);
        }
        localStorage.setItem('intake_completed', 'true');
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (err) {
      setAiStatus('Error: ' + err.message);
      setChatHistory(prev => prev.slice(0, -1));
    }
  };

  const handleFinishFastRoute = async () => {
    const concerns = selectedConcerns;
    const conditions = selectedConditions;
    const traditions = selectedTraditions;

    const avatarConfig = JSON.parse(localStorage.getItem('avatar_config') || '{}');
    const { data: existing } = await supabase.from('user_profile').select('id').maybeSingle();
    const profileData = {
      intake_completed: true,
      intake_answers: { concerns, conditions, traditions, noRx, noOral, noAlg, rxList, oralList, algList },
      avatar_config: avatarConfig
    };
    
    if (existing) {
      await supabase.from('user_profile').update(profileData).eq('id', existing.id);
    } else {
      await supabase.from('user_profile').insert([profileData]);
    }
    
    localStorage.setItem('intake_completed', 'true');
    onComplete();
  };

  const canProceed = () => {
    if (currentStep === 1) return selectedConcerns.length > 0;
    if (currentStep === 2) return selectedConditions.length > 0;
    if (currentStep === 3) return noRx || rxList.some(r => r.name.trim() !== '');
    if (currentStep === 4) return noOral || oralList.some(o => o.trim() !== '');
    if (currentStep === 5) return noAlg || algList.length > 0 || newAlg.trim() !== '';
    if (currentStep === 6) return selectedTraditions.length > 0;
    return true;
  };

  const toggleSelection = (setter, item) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  
  const updateRx = (index, field, value) => {
    const newList = [...rxList];
    newList[index][field] = value;
    setRxList(newList);
  };
  
  const addRx = () => {
    setRxList([...rxList, { name: '', strength: '', zone: '', frequency: '' }]);
  };

  const removeRx = (index) => {
    const newList = [...rxList];
    newList.splice(index, 1);
    setRxList(newList);
  };

  const updateOral = (index, value) => {
    const newList = [...oralList];
    newList[index] = value;
    setOralList(newList);
  };
  
  const addOral = () => {
    setOralList([...oralList, '']);
  };

  const removeOral = (index) => {
    const newList = [...oralList];
    newList.splice(index, 1);
    setOralList(newList);
  };

  const addAlg = () => {
    if (newAlg.trim()) {
      setAlgList([...algList, newAlg.trim()]);
      setNewAlg('');
    }
  };

  const renderTitle = (titleText) => (
    <h3>
      {titleText} <span dangerouslySetInnerHTML={{ __html: speakerMarkup(titleText) }} />
    </h3>
  );

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '2rem auto', minHeight: '580px', display: 'flex', flexDirection: 'column' }}>
      <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
      <h2 style={{ textAlign: 'center', fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', color: 'var(--parch)' }}>
        <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
      </h2>
      
      <div id="path-toggle" style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          className="btn sm" 
          onClick={() => setPath('ai')}
          style={{ 
            background: path === 'ai' ? 'var(--plum)' : 'transparent', 
            color: path === 'ai' ? 'var(--white)' : 'var(--parch)', 
            border: '1px solid var(--plum)'
          }}
        >
          The Guardian's Inquiry
        </button>
        <button 
          className="btn sm" 
          onClick={() => setPath('fast')}
          style={{ 
            background: path === 'fast' ? 'var(--plum)' : 'transparent', 
            color: path === 'fast' ? 'var(--white)' : 'var(--parch)',
            border: '1px solid var(--plum)'
          }}
        >
          The Fast Route
        </button>
      </div>

      {path === 'ai' && (
        <div id="ai-path">
          <div 
            id="ai-chat-log" 
            ref={chatLogRef}
            style={{ 
              height: '350px', 
              overflowY: 'auto', 
              border: '1px solid var(--border)', 
              padding: '1rem', 
              marginBottom: '1rem', 
              background: 'rgba(0,0,0,0.1)', 
              borderRadius: '4px', 
              fontFamily: "'IM Fell English', serif", 
              fontSize: '1.1rem', 
              lineHeight: '1.5' 
            }}
          >
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`msg ${msg.role === 'assistant' ? 'ai' : 'user'}`} 
                style={{ 
                  color: msg.role === 'assistant' ? 'var(--parch)' : 'var(--white)', 
                  marginBottom: '1rem',
                  textAlign: msg.role === 'user' ? 'right' : 'left'
                }}
              >
                {msg.content}
              </div>
            ))}
          </div>
          <div className="field" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="ip mic" style={{ flex: 1 }}>
              <VoiceInput 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Speak your mind..." 
              />
            </div>
            <button className="btn plum" onClick={sendChatMessage}>Whisper</button>
          </div>
          <div id="ai-status" style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--rose)', height: '1rem' }}>
            {aiStatus ? (
              aiStatus
            ) : !isReady ? (
              <>AI key missing. <a href="#" onClick={handleSetAiKey} style={{ color: 'var(--parch)', textDecoration: 'underline' }}>Set API Key</a></>
            ) : null}
          </div>
        </div>
      )}

      {path === 'fast' && (
        <div id="ins-steps">
          {currentStep === 1 && (
            <div className="ins-step">
              {renderTitle('What brings you to this place?')}
              <div className="mt">Select all that weigh upon you.</div>
              <div className="chips">
                <div 
                  className={`chip ${selectedConcerns.includes('relaxation') ? 'on' : ''}`}
                  onClick={() => setSelectedConcerns(['relaxation'])}
                >
                  Relaxation, just for the sake of relaxation
                </div>
                <div 
                  className={`chip ${selectedConcerns.includes('na') ? 'on' : ''}`}
                  onClick={() => setSelectedConcerns(['na'])}
                >
                  Not Applicable
                </div>
                {concernsOptions.length > 0 ? concernsOptions.map(c => (
                  <div 
                    key={c.id}
                    className={`chip ${selectedConcerns.includes(c.id) ? 'on' : ''}`}
                    onClick={() => {
                      if (selectedConcerns.includes('relaxation') || selectedConcerns.includes('na')) {
                        setSelectedConcerns([c.id]);
                      } else {
                        toggleSelection(setSelectedConcerns, c.id);
                      }
                    }}
                  >
                    {c.label}
                  </div>
                )) : <div style={{ opacity: 0.5 }}>Divining concerns...</div>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="ins-step">
              {renderTitle('What must the Lounge protect?')}
              <div className="mt">Conditions that shape how you care for yourself.</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <label>
                  <input type="checkbox" checked={selectedConditions.includes('na')}
                         onChange={() => setSelectedConditions(['na'])} className="cond-chk" />
                  Not Applicable
                </label>
                {conditionsOptions.length > 0 ? conditionsOptions.map(c => (
                  <label key={c.id}>
                    <input 
                      type="checkbox" 
                      value={c.id} 
                      checked={selectedConditions.includes(c.id)}
                      onChange={() => {
                        if (selectedConditions.includes('na')) {
                          setSelectedConditions([c.id]);
                        } else {
                          toggleSelection(setSelectedConditions, c.id);
                        }
                      }}
                      className="cond-chk"
                    /> {c.label}
                  </label>
                )) : <div style={{ opacity: 0.5 }}>Divining conditions...</div>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="ins-step">
              {renderTitle('Medical Directives (Topical)')}
              <div className="mt mb-4">Potent formulas prescribed by healers. These take priority in all routines.</div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
                <input type="checkbox" checked={noRx} onChange={e => { setNoRx(e.target.checked); if(e.target.checked) setRxList([]); }} /> I have no topical prescriptions.
              </label>

              {!noRx && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {rxList.map((rx, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--gold)', paddingLeft: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--plum)', fontWeight: 'bold' }}>Prescription {i + 1}</span>
                        <button className="btn sm" style={{ background: 'transparent', color: 'var(--rose)', padding: 0 }} onClick={() => removeRx(i)}>Banish</button>
                      </div>
                      <div className="field">
                        <label>Name</label>
                        <VoiceInput value={rx.name} onChange={e => updateRx(i, 'name', e.target.value)} placeholder="e.g. Tretinoin" />
                      </div>
                      <div className="field">
                        <label>Strength</label>
                        <VoiceInput value={rx.strength} onChange={e => updateRx(i, 'strength', e.target.value)} placeholder="e.g. 0.05%" />
                      </div>
                      <div className="field">
                        <label>Zone</label>
                        <VoiceInput value={rx.zone} onChange={e => updateRx(i, 'zone', e.target.value)} placeholder="e.g. Face" />
                      </div>
                      <div className="field">
                        <label>Frequency</label>
                        <VoiceInput value={rx.frequency} onChange={e => updateRx(i, 'frequency', e.target.value)} placeholder="e.g. Nightly" />
                      </div>
                    </div>
                  ))}
                  <button className="btn" onClick={addRx} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="plus" /> Inscribe Topical Prescription</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="ins-step">
              {renderTitle('Medical Directives (Oral)')}
              <div className="mt mb-4">Internal remedies that may cause systemic shifts (e.g. dryness, sensitivity).</div>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
                <input type="checkbox" checked={noOral} onChange={e => { setNoOral(e.target.checked); if(e.target.checked) setOralList([]); }} /> I take no oral medications that affect my skin/hair.
              </label>

              {!noOral && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {oralList.map((med, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <VoiceInput value={med} onChange={e => updateOral(i, e.target.value)} placeholder="e.g. Spironolactone" />
                      </div>
                      <button className="btn sm" style={{ background: 'transparent', color: 'var(--rose)', padding: '0.5rem' }} onClick={() => removeOral(i)}>Banish</button>
                    </div>
                  ))}
                  <button className="btn" onClick={addOral} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="plus" /> Inscribe Systemic Measure</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 5 && (
            <div className="ins-step">
              {renderTitle('The ingredients to never touch')}
              <div className="mt mb-4">Allergies and sensitivities.</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--gold)' }}>
                <input type="checkbox" checked={noAlg} onChange={e => { setNoAlg(e.target.checked); if(e.target.checked) setAlgList(['Lavender']); }} /> I have no other allergies.
              </label>
              {!noAlg && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {algList.map((alg, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <VoiceInput 
                          value={alg} 
                          disabled={i === 0 && alg.toLowerCase() === 'lavender'} 
                          style={(i === 0 && alg.toLowerCase() === 'lavender') ? { opacity: 0.7, background: 'rgba(255,255,255,0.5)' } : {}} 
                          onChange={e => {
                            const newList = [...algList];
                            newList[i] = e.target.value;
                            setAlgList(newList);
                          }}
                          placeholder="e.g. Lanolin" 
                        />
                      </div>
                      {!(i === 0 && alg.toLowerCase() === 'lavender') && (
                        <button className="btn sm" style={{ background: 'transparent', color: 'var(--rose)', padding: '0.5rem' }} onClick={() => {
                          const newList = [...algList];
                          newList.splice(i, 1);
                          setAlgList(newList);
                        }}>Banish</button>
                      )}
                    </div>
                  ))}
                  <button className="btn" onClick={() => setAlgList([...algList, ''])} style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Icon name="plus" /> Inscribe Aversion</button>
                </div>
              )}
            </div>
          )}

          {currentStep === 6 && (
            <div className="ins-step">
              {renderTitle('Which traditions call to you?')}
              <div className="mt">Your preferred approaches to care.</div>
              <div className="chips">
                <div 
                  className={`chip ${selectedTraditions.includes('na') ? 'on' : ''}`}
                  onClick={() => setSelectedTraditions(['na'])}
                >
                  Not Applicable
                </div>
                {traditionsOptions.length > 0 ? traditionsOptions.map(c => (
                  <div 
                    key={c.id} 
                    className={`chip ${selectedTraditions.includes(c.id) ? 'on' : ''}`}
                    onClick={() => {
                      if (selectedTraditions.includes('na')) {
                        setSelectedTraditions([c.id]);
                      } else {
                        toggleSelection(setSelectedTraditions, c.id);
                      }
                    }}
                  >
                    {c.label}
                  </div>
                )) : <div style={{ opacity: 0.5 }}>Divining traditions...</div>}
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="ins-step" style={{ textAlign: 'center', margin: 'auto' }}>
              <h3 style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '3rem', color: 'var(--parch)' }}>The First Inscription is sealed</h3>
              <div className="mt" style={{ fontSize: '1.2rem', marginTop: '2rem' }}>Your chamber awaits.</div>
            </div>
          )}
        </div>
      )}

      {path === 'fast' && (
        <div id="fast-route-controls" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button 
            className="btn" 
            onClick={() => {
              if (currentStep === 3 && selectedConcerns.includes('relaxation')) {
                setCurrentStep(1);
              } else {
                setCurrentStep(prev => Math.max(1, prev - 1));
              }
            }}
            style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
          >
            Step Back
          </button>
          
          <div id="ins-dots" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const i = idx + 1;
              return (
                <div 
                  key={i} 
                  className={`dot ${i === currentStep ? 'active' : ''}`} 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: i === currentStep ? 'var(--plum)' : 'var(--border)' 
                  }}
                />
              );
            })}
          </div>
          
          <button 
            className="btn plum" 
            disabled={!canProceed()}
            style={{ opacity: canProceed() ? 1 : 0.5, cursor: canProceed() ? 'pointer' : 'not-allowed' }}
            onClick={() => {
              if (currentStep === 1 && selectedConcerns.includes('relaxation')) {
                setCurrentStep(3); // Skip conditions, go to Rx
              } else if (currentStep < totalSteps) {
                setCurrentStep(prev => prev + 1);
              } else {
                handleFinishFastRoute();
              }
            }}
          >
            {currentStep === totalSteps ? 'Enter the Sanctuary' : 'Step Deeper'}
          </button>
        </div>
      )}
    </div>
  );
}
