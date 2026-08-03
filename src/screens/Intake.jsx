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
  
  const [rxList, setRxList] = useState([
    { name: 'Tretinoin', strength: '0.05%', zone: 'Face', frequency: 'Nightly' },
    { name: 'Tacrolimus', strength: '0.1%', zone: 'Face/Neck', frequency: 'As needed' },
    { name: 'Drysol', strength: '20%', zone: 'Underarms', frequency: 'Weekly' }
  ]);
  const [oralList, setOralList] = useState(['Methotrexate', 'Etanercept']);
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
        await supabase.from('user_profile').delete().neq('intake_completed', null);
        await supabase.from('user_profile').insert({
          intake_completed: true,
          intake_answers: extractedData,
          avatar_config: avatarConfig
        });
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
    await supabase.from('user_profile').delete().neq('intake_completed', null);
    await supabase.from('user_profile').insert({
      intake_completed: true,
      intake_answers: { concerns, conditions, traditions, noRx, noOral, noAlg, rxList, oralList, algList },
      avatar_config: avatarConfig
    });
    
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
  
  const updateOral = (index, value) => {
    const newList = [...oralList];
    newList[index] = value;
    setOralList(newList);
  };
  
  const addOral = () => {
    setOralList([...oralList, '']);
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
    <div className="card" style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div className="corner tl"></div><div className="corner tr"></div><div className="corner bl"></div><div className="corner br"></div>
      <h2 style={{ textAlign: 'center', fontFamily: "'Pinyon Script', cursive", fontSize: '2.5rem', color: 'var(--parch)' }}>
        <Icon name={G.sparkles || 'sparkles'} /> The First Inscription
      </h2>
      
      <div id="path-toggle" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button 
          className="btn sm" 
          onClick={() => setPath('ai')}
          style={{ 
            background: path === 'ai' ? 'var(--plum)' : 'transparent', 
            color: path === 'ai' ? 'var(--white)' : 'var(--parch)', 
            borderColor: 'var(--plum)' 
          }}
        >
          The Guardian's Inquiry
        </button>
        <button 
          className="btn sm" 
          onClick={() => setPath('fast')}
          style={{ 
            background: path === 'fast' ? 'var(--plum)' : 'transparent', 
            color: path === 'fast' ? 'var(--white)' : 'var(--parch)' 
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
            <button className="btn plum" onClick={sendChatMessage}>Send</button>
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
              {renderTitle('Name the Master Invocations')}
              <div className="mt">Topical prescriptions.</div>
              <label style={{ display: 'block', marginTop: '1rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={noRx} onChange={e => setNoRx(e.target.checked)} /> Not Applicable (None)
              </label>
              {!noRx && (
                <div id="rx-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {rxList.map((rx, idx) => (
                  <div key={idx} className="card2" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginBottom: '1.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Tretinoin 0.05%" 
                        value={rx.name}
                        onChange={e => updateRx(idx, 'name', e.target.value)}
                      />
                      <input 
                        type="text" 
                        placeholder="Application Zone (e.g. chin)" 
                        value={rx.zone}
                        onChange={e => updateRx(idx, 'zone', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
              )}
              {!noRx && <button className="btn sm mt-4" onClick={addRx}>+ Invoke</button>}
            </div>
          )}

          {currentStep === 4 && (
            <div className="ins-step">
              {renderTitle('What passes through the body?')}
              <div className="mt">Oral medications that affect the skin or routines.</div>
              <label style={{ display: 'block', marginTop: '1rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={noOral} onChange={e => setNoOral(e.target.checked)} /> Not Applicable (None)
              </label>
              {!noOral && (
                <div id="oral-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {oralList.map((oral, idx) => (
                  <div key={idx} style={{ display: 'flex', width: '100%', marginBottom: '1rem' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Methotrexate" 
                      value={oral}
                      onChange={e => updateOral(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              )}
              {!noOral && <button className="btn sm mt-4" onClick={addOral}>+ Add Medication</button>}
            </div>
          )}

          {currentStep === 5 && (
            <div className="ins-step">
              {renderTitle('The ingredients to never touch')}
              <div className="mt">Allergies and sensitivities.</div>
              <label style={{ display: 'block', marginTop: '1rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={noAlg} onChange={e => setNoAlg(e.target.checked)} /> Not Applicable (None)
              </label>
              {!noAlg && (
                <>
                <div id="alg-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {algList.map((alg, idx) => (
                  <div key={idx} className="field">
                    <div className="ip mic">
                      <VoiceInput 
                        className="alg-item" 
                        value={alg} 
                        disabled={idx === 0} 
                        style={idx === 0 ? { opacity: 0.7 } : {}} 
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="field mt-4">
                <div className="ip mic">
                  <input 
                    type="text" 
                    placeholder="Type an allergy and press Enter..." 
                    value={newAlg}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newAlg.trim()) {
                        addAlg();
                      }
                    }}
                    onChange={e => setNewAlg(e.target.value)}
                  />
                  </div>
                </div>
                <button className="btn sm" onClick={addAlg}>+ Add</button>
                </>
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
            <div className="ins-step" style={{ textAlign: 'center' }}>
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
            {currentStep === totalSteps ? 'Enter the Lounge' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
