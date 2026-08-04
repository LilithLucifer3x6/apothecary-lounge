import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import { G, verifyGlyphs } from './lib/icons.js';
import { getTtsEnabled, getTtsRate, getTtsPitch, getTtsVoiceURI, setTtsEnabled, setTtsRate, setTtsPitch, setTtsVoiceURI, getFeminineVoices } from './lib/tts.js';
import Icon from './components/Icon.jsx';
import { initGoogleCalendar, requestCalendarAccess } from './lib/gcal.js';
import { Capacitor } from '@capacitor/core';

import ConjureVisage from './screens/ConjureVisage.jsx';
import Landing from './screens/Landing.jsx';
import Intake from './screens/Intake.jsx';
import Rites from './screens/Rites.jsx';
import Grimoire from './screens/Grimoire.jsx';
import Altars from './screens/Altars.jsx';
import Rootwork from './screens/Rootwork.jsx';
import Scrying from './screens/Scrying.jsx';
import ShadowTome from './screens/ShadowTome.jsx';

const TABS = [
  { id: 'rites', label: 'The Mortal Rites', glyph: G.tabRites, bg: '/assets/bg_sanctuary.jpg', pose: 'working' },
  { id: 'grim', label: 'The Grimoire', glyph: G.tabGrim, bg: '/assets/bg_grimoire.jpg', pose: 'reading' },
  { id: 'altars', label: 'The Altars', glyph: G.tabAltars, bg: '/assets/bg_altars.jpg', pose: 'meditating' },
  { id: 'root', label: 'The Rootwork', glyph: G.tabRoot, bg: '/assets/bg_rootwork.jpg', pose: 'working' },
  { id: 'pool', label: 'The Scrying Pool', glyph: G.tabPool, bg: '/assets/bg_scrying.jpg', pose: 'scrying' },
  { id: 'tome', label: 'The Shadow Tome', glyph: G.tabTome, bg: '/assets/bg_shadowtome.jpg', pose: 'reading' }
];

function getSpellDate() {
  const d = new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const day = d.getDate();
  const suffix = ['th','st','nd','rd'][(day % 10 > 3) ? 0 : (day % 100 - day % 10 !== 10) * day % 10];
  return `${day}${suffix} of ${months[d.getMonth()]}`;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(() => {
    if (!localStorage.getItem('avatar_config')) return 'splash';
    return sessionStorage.getItem('al_currentScreen') || 'splash';
  });
  const [activeTab, setActiveTab] = useState(() => {
    if (!localStorage.getItem('avatar_config')) return 'rites';
    return sessionStorage.getItem('al_activeTab') || 'rites';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [dateStr, setDateStr] = useState(getSpellDate());
  
  // Settings state
  const [settings, setSettings] = useState({
    fontSize: '16',
    tts: false,
    health: false,
    cal: false,
    terraDevId: '',
    terraApiKey: '',
    gcalClientId: ''
  });
  
  const [ttsOptions, setTtsOptions] = useState({
    voice: '',
    rate: 1.0,
    pitch: 1.0
  });

  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    sessionStorage.setItem('al_currentScreen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    sessionStorage.setItem('al_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    verifyGlyphs();
    
    // Load Settings
    const saved = JSON.parse(localStorage.getItem('app_settings') || '{"fontSize":"20","fontFamily":"Parisienne","tts":false,"health":false,"cal":false}');
    setSettings(saved);
    applySettings(saved);
    
    setTtsOptions({
      voice: getTtsVoiceURI(),
      rate: getTtsRate(),
      pitch: getTtsPitch()
    });

    const populateVoices = () => {
      const voices = getFeminineVoices();
      setAvailableVoices(voices);
      const currentUri = getTtsVoiceURI();
      if (!currentUri && voices.length > 0) {
        setTtsVoiceURI(voices[0].voiceURI);
        setTtsOptions(prev => ({ ...prev, voice: voices[0].voiceURI }));
      }
    };
    
    if (window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length > 0) populateVoices();
      else window.speechSynthesis.onvoiceschanged = populateVoices;
    }
    
    const initScreen = localStorage.getItem('avatar_config') ? (sessionStorage.getItem('al_currentScreen') || 'splash') : 'splash';
    const initTab = localStorage.getItem('avatar_config') ? (sessionStorage.getItem('al_activeTab') || 'rites') : 'rites';
    if (initScreen === 'app') {
      if (initTab === 'home') {
        document.body.style.backgroundImage = `url('/assets/bg_sanctuary.jpg')`;
      } else {
        const tab = TABS.find(t => t.id === initTab);
        if (tab) document.body.style.backgroundImage = `url('${tab.bg}')`;
      }
    } else {
      document.body.style.backgroundImage = `url('/assets/app_bg.jpg')`;
    }
    
    // Sync settings with profile in background
    supabase.from('user_profile').select('*').maybeSingle().then(({ data: profile }) => {
      if (profile && profile.settings) {
        const stored = localStorage.getItem('al_settings');
        if (stored) {
          const s = JSON.parse(stored);
          setSettings(s);
          if (s.tts) setTtsEnabled(true);
          
          if (s.gcalClientId) {
            initGoogleCalendar(s.gcalClientId, (token) => {
              console.log("The Solar Almanac is Bound!");
            });
          }
        }    
        applySettings(profile.settings);
      }
      if (profile && profile.avatar_config) {
        localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
      }
    });

  }, []);

  const applySettings = (s) => {
    document.documentElement.style.setProperty('--fs', s.fontSize + 'px');
    document.documentElement.style.fontSize = s.fontSize + 'px';
    document.documentElement.style.setProperty('--ff', `"${s.fontFamily}", cursive`);
    if (s.tts) {
      document.body.classList.remove('tts-disabled');
      setTtsEnabled(true);
    } else {
      document.body.classList.add('tts-disabled');
      setTtsEnabled(false);
    }
  };

  const handleEnter = async () => {
    let profile = null;
    try {
      const res = await supabase.from('user_profile').select('*').maybeSingle();
      profile = res.data;
    } catch(e) {}
    
    if (profile && profile.avatar_config) {
      localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
    }
    
    const isCompletedLocally = localStorage.getItem('intake_completed') === 'true';
    const hasAvatar = !!localStorage.getItem('avatar_config');

    if (!profile && !hasAvatar) {
      document.body.style.backgroundImage = `url('/assets/bg_sanctuary.jpg')`;
      setCurrentScreen('avatar');
    } else if (!isCompletedLocally && (!profile || !profile.intake_completed)) {
      document.body.style.backgroundImage = `url('/assets/bg_sanctuary.jpg')`;
      setCurrentScreen('intake');
    } else {
      setCurrentScreen('app');
      handleTabClick('home');
    }
  };

  const handleReturnToCottage = () => {
    handleTabClick('home');
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      document.body.style.backgroundImage = `url('/assets/bg_sanctuary.jpg')`;
      return;
    }
    const tab = TABS.find(t => t.id === tabId);
    if (tab) {
      document.body.style.backgroundImage = `url('${tab.bg}')`;
    }
  };

  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('app_settings', JSON.stringify(newSettings));
    applySettings(newSettings);
    
    const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
    if (profile) {
      await supabase.from('user_profile').update({ settings: newSettings }).eq('id', profile.id);
    }
    setShowSettings(false);
  };

  const renderActiveTabContent = () => {
    const tab = TABS.find(t => t.id === activeTab);
    const pose = tab ? tab.pose : 'working';
    
    switch (activeTab) {
      case 'home': return <div style={{ minHeight: 'calc(100vh - 120px)' }}><Landing onProceed={() => setCurrentScreen('intake')} onOpenAvatar={() => setCurrentScreen('avatar')} /></div>;
      case 'rites': return <div><Rites pose={pose} /></div>;
      case 'grim': return <div><Grimoire pose={pose} /></div>;
      case 'altars': return <div><Altars pose={pose} /></div>;
      case 'root': return <div><Rootwork pose={pose} /></div>;
      case 'pool': return <div><Scrying pose={pose} /></div>;
      case 'tome': return <div><ShadowTome pose={pose} /></div>;
      default: return null;
    }
  };

  return (
    <>
      {currentScreen === 'splash' && (
        <div id="s-splash" className="land" style={{ justifyContent: 'center', padding: '10vh 2rem 5vh 2rem', height: '100vh', overflow: 'hidden' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 10vw, 3.5rem)', textShadow: '2px 2px 0 #0b090e, -1px -1px 0 #0b090e, 1px -1px 0 #0b090e, -1px 1px 0 #0b090e, 0 8px 30px rgba(0,0,0,1)', color: 'var(--rose)', margin: '0' }}>Shadow & Sanctuary</h1>
            <div className="tag" style={{ fontSize: '1rem', textShadow: '1px 1px 0 #0b090e, 0 4px 15px rgba(0,0,0,1)', color: 'var(--rose)', marginTop: '0.5rem', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)', padding: '0.6rem', display: 'inline-block' }}>A sanctuary of self-care.</div>
          </div>
          <button onClick={handleEnter} className="btn" style={{ fontSize: '1.3rem', padding: '0.8rem 1.5rem', background: 'var(--card2)', borderColor: 'var(--rose)', color: 'var(--rose)', boxShadow: '0 4px 15px rgba(0,0,0,0.8)', marginTop: '4vh', width: '250px', whiteSpace: 'normal', lineHeight: '1.2' }}>
            Enter the Sanctuary
          </button>
        </div>
      )}

      {currentScreen === 'loading' && (
        <div id="s-loading" className="land">
          <div className="tag" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)', color: 'var(--rose)' }}>Consulting the rites...</div>
        </div>
      )}

      {currentScreen === 'avatar' && (
        <div id="s-av" className="land">
          <ConjureVisage onComplete={() => { 
            const isCompletedLocally = localStorage.getItem('intake_completed') === 'true';
            if (!isCompletedLocally) {
              setCurrentScreen('intake');
            } else {
              setCurrentScreen('app'); 
              handleTabClick('home'); 
            }
          }} />
        </div>
      )}

      {currentScreen === 'landing' && (
        <div id="s-land" className="land">
          <Landing 
            onProceed={() => {
              let hasAvatar = false;
              try {
                const conf = JSON.parse(localStorage.getItem('avatar_config'));
                if (conf && conf.avatarVibe) hasAvatar = true;
              } catch(e) {}
              const hasIntake = localStorage.getItem('intake_completed') === 'true';
              if (!hasAvatar) setCurrentScreen('avatar');
              else if (!hasIntake) setCurrentScreen('intake');
              else setCurrentScreen('app');
            }} 
            onOpenAvatar={() => setCurrentScreen('avatar')} 
          />
        </div>
      )}

      {currentScreen === 'intake' && (
        <div id="s-ins" className="land">
          <Intake onComplete={() => { setCurrentScreen('app'); handleTabClick('rites'); }} />
        </div>
      )}

      {currentScreen === 'app' && (
        <div id="s-app" style={{ position: 'relative', minHeight: '100vh' }}>
          <div style={{ position: 'relative', zIndex: 5 }}>
            <div className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '33%' }}>
                {activeTab !== 'home' ? (
                  <button onClick={handleReturnToCottage} className="btn sm" title="Return to Sanctuary">
                    <Icon name="house" />
                  </button>
                ) : (
                  <div style={{ width: '40px' }}></div>
                )}
                <div className="datemark" style={{ position: 'static' }}>{dateStr}</div>
              </div>
              
              <div className="brand" style={{ position: 'static', padding: 0, width: '33%', textAlign: 'center' }}>
                <h1 className="title" style={{ fontSize: '1.4rem', margin: 0, color: 'var(--gold)', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 10px rgba(201,155,81,0.3)', marginTop: '-0.3rem' }}>Shadow & Sanctuary</h1>
              </div>

              <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-end' }}>
                <div onClick={() => setShowSettings(true)} style={{ cursor: 'pointer', opacity: 0.8, display: 'flex', alignItems: 'center' }} title="Configurations">
                  <Icon name="ph-gear" />
                </div>
              </div>
            </div>
            
            <div className="tabs" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.2rem', padding: '0.5rem 1rem' }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  className={`tb ${activeTab === t.id ? 'active on' : ''}`}
                  title={t.label}
                  onClick={() => handleTabClick(t.id)}
                >
                  <Icon name={t.glyph} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            
            <div id="main-content">
              {renderActiveTabContent()}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div id="setmodal" className="modal" style={{ display: 'block', padding: '1rem' }}>
          <div className="modal-content card" style={{ maxWidth: '1000px', width: '95vw', maxHeight: '90vh', overflowY: 'auto', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <div className="corner tl"></div><div className="corner tr"></div>
            <div className="corner bl"></div><div className="corner br"></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Sanctuary Tuning</h2>
                <div className="mt mb-4">Adjust the chamber's atmosphere.</div>
              </div>
              <button className="btn sm" onClick={() => setShowSettings(false)}>X</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Left Column: Appearance */}
              <div>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Aesthetic Visage</h3>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Inscription Scale ({settings.fontSize}px)</label>
                  <input type="range" min="12" max="32" value={settings.fontSize} 
                         onChange={e => setSettings({...settings, fontSize: e.target.value})} />
                </div>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Ancient Script</label>
                  <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})}>
                    <option value="Parisienne">Parisienne</option>
                    <option value="Allura">Allura</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Elsie">Elsie</option>
                    <option value="Lora">Lora</option>
                    <option value="Cinzel Decorative">Cinzel Decorative</option>
                    <option value="system-ui">Mortal Script (System)</option>
                  </select>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  border: '1px dashed var(--border)', 
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--dim)', marginBottom: '0.5rem' }}>Scrying Glimpse:</div>
                  <div style={{ 
                    fontFamily: `"${settings.fontFamily}", cursive`, 
                    fontSize: `${settings.fontSize}px`,
                    color: 'var(--crimson)'
                  }}>
                    The quick brown fox jumps over the lazy dog. 1234567890
                  </div>
                </div>
              </div>
              
              {/* Middle Column: Voice & Integrations */}
              <div>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Ethereal Echoes & Conduits</h3>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', }}>
                    <input type="checkbox" checked={settings.tts} 
                         onChange={e => {
                           setSettings({...settings, tts: e.target.checked});
                           setTtsEnabled(e.target.checked);
                         }} /> Awaken Ethereal Voice
                  </label>
                  
                  {settings.tts && (
                    <div style={{ display: 'flex', marginTop: '0.5rem', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem' }}>Incantation Voice
                        <select style={{ width: '100%', marginTop: '0.2rem' }}
                                value={ttsOptions.voice}
                                onChange={e => {
                                  setTtsOptions({...ttsOptions, voice: e.target.value});
                                  setTtsVoiceURI(e.target.value);
                                }}>
                          {availableVoices.map(v => (
                            <option key={v.voiceURI} value={v.voiceURI}>{v.displayName}</option>
                          ))}
                        </select>
                      </label>
                      <label style={{ fontSize: '0.8rem' }}>Tempo of Speech
                        <input type="range" min="0.5" max="2.0" step="0.1" style={{ width: '100%' }}
                               value={ttsOptions.rate}
                               onChange={e => {
                                 const v = parseFloat(e.target.value);
                                 setTtsOptions({...ttsOptions, rate: v});
                                 setTtsRate(v);
                               }} />
                      </label>
                      <label style={{ fontSize: '0.8rem' }}>Vocal Resonance
                        <input type="range" min="0.5" max="2.0" step="0.1" style={{ width: '100%' }}
                               value={ttsOptions.pitch}
                               onChange={e => {
                                 const v = parseFloat(e.target.value);
                                 setTtsOptions({...ttsOptions, pitch: v});
                                 setTtsPitch(v);
                               }} />
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                    <label style={{ color: 'var(--crimson)', }}>
                      <input type="checkbox" checked={settings.health}
                             onChange={async (e) => {
                               const checked = e.target.checked;
                               if (checked && Capacitor.isNativePlatform()) {
                                 alert("The System calls upon Native Android to weave corporeal data from Samsung Health, RingConn, and Renpho...");
                                 setSettings({...settings, health: true});
                               } else {
                                 setSettings({...settings, health: checked});
                               }
                             }} /> Corporeal Sensors (RingConn, Renpho, Samsung)
                    </label>
                    {settings.health && !Capacitor.isNativePlatform() && (
                      <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" placeholder="Terra Developer ID" value={settings.terraDevId || ''} onChange={e => setSettings({...settings, terraDevId: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                        <input type="text" placeholder="Terra API Key" value={settings.terraApiKey || ''} onChange={e => setSettings({...settings, terraApiKey: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                        <div className="mt" style={{ fontSize: '0.8rem' }}>Offer your Terra seals to draw upon visions of sleep & readiness.</div>
                      </div>
                    )}
                    
                    <label style={{ color: 'var(--crimson)', marginTop: '1rem' }}>
                      <input type="checkbox" checked={settings.cal}
                             onChange={e => setSettings({...settings, cal: e.target.checked})} /> Solar Almanac (Google Calendar)
                    </label>
                    {settings.cal && (
                      <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <input type="text" placeholder="Google OAuth Client ID" value={settings.gcalClientId || ''} 
                               onChange={e => {
                                 setSettings({...settings, gcalClientId: e.target.value});
                                 if (e.target.value) {
                                   initGoogleCalendar(e.target.value, () => alert("The Solar Almanac is Bound!"));
                                 }
                               }} style={{ padding: '0.5rem', width: '100%' }} />
                        <button className="btn sm g" onClick={() => requestCalendarAccess()} style={{ width: 'fit-content' }}>Bind Solar Almanac</button>
                        <div className="mt" style={{ fontSize: '0.8rem' }}>Offer the Celestial ID to chart the wheel of the year.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column: Danger Zone & Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--crimson)' }}>Danger Zone</h3>
                  
                  <button onClick={async () => {
                    if (window.confirm("Do you truly wish to shatter the First Inscription? You will be cast back to the initial inquiry.")) {
                      const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
                      if (profile) {
                        await supabase.from('user_profile').update({ intake_completed: false }).eq('id', profile.id);
                      }
                      setShowSettings(false);
                      setCurrentScreen('intake');
                    }
                  }} className="btn g" style={{ width: '100%', marginBottom: '1rem' }}>Shatter the First Inscription</button>

                  <button onClick={() => {
                    if (window.confirm("Do you truly wish to raze this Sanctuary to ash? All saved rites, items, and settings shall be lost to the void. This cannot be undone.")) {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.reload();
                    }
                  }} className="btn g" style={{ width: '100%' }}>Erase the Entire Codex</button>
                </div>
                
                <button onClick={() => saveSettings(settings)} className="btn full plum" style={{ marginTop: '2rem', padding: '1rem', fontSize: '1.2rem' }}>Seal Configurations</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
