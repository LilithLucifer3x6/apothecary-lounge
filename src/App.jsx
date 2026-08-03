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
  { id: 'root', label: 'The Rootwork', glyph: G.tabRoot, bg: '/assets/bg_sanctuary.jpg', pose: 'working' },
  { id: 'pool', label: 'The Scrying Pool', glyph: G.tabPool, bg: '/assets/bg_sanctuary.jpg', pose: 'scrying' },
  { id: 'tome', label: 'The Shadow Tome', glyph: G.tabTome, bg: '/assets/bg_sanctuary.jpg', pose: 'reading' }
];

function getRitualDate() {
  const d = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const day = d.getDate();
  let suffix = "th";
  if (day % 10 === 1 && day !== 11) suffix = "st";
  else if (day % 10 === 2 && day !== 12) suffix = "nd";
  else if (day % 10 === 3 && day !== 13) suffix = "rd";
  
  return `The ${day}${suffix} of ${months[d.getMonth()]}`;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [activeTab, setActiveTab] = useState('rites');
  const [showSettings, setShowSettings] = useState(false);
  const [dateStr, setDateStr] = useState(getRitualDate());
  
  // Settings state
  const [settings, setSettings] = useState({
    fontSize: '16',
    fontFamily: 'IM Fell English',
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
    verifyGlyphs();
    
    // Load Settings
    const saved = JSON.parse(localStorage.getItem('app_settings') || '{"fontSize":"16","fontFamily":"IM Fell English","tts":false,"health":false,"cal":false}');
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
    
    // Set exterior background for splash
    document.body.style.backgroundImage = `url('/assets/app_bg.jpg')`;
    
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
          console.log("Google Calendar Authenticated!");
        });
      }
    }    applySettings(profile.settings);
      }
      if (profile && profile.avatar_config) {
        localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
      }
    });

  }, []);

  const applySettings = (s) => {
    document.documentElement.style.setProperty('--fs', s.fontSize + 'px');
    document.documentElement.style.setProperty('--ff', `"${s.fontFamily}", serif`);
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
        <div id="s-splash" className="land">
          <h1 style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)', color: 'var(--rose)', margin: '0' }}>Shadow & Sanctuary</h1>
          <div className="tag" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)', color: 'var(--rose)', marginTop: '0.5rem', marginBottom: '2rem' }}>A sanctuary of self-care.</div>
          <button onClick={handleEnter} className="btn plum" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
            Approach the Cottage <Icon name="arrow-right" />
          </button>
        </div>
      )}

      {currentScreen === 'loading' && (
        <div id="s-loading" className="land">
          <div className="tag" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)', color: 'var(--rose)' }}>Consulting the rites...</div>
        </div>
      )}

      {(currentScreen !== 'app' || activeTab !== 'home') && currentScreen !== 'loading' && currentScreen !== 'splash' && (
        <div className="blur-overlay"></div>
      )}

      {currentScreen === 'avatar' && (
        <div id="s-av" className="land">
          <ConjureVisage onComplete={() => { setCurrentScreen('app'); handleTabClick('home'); }} />
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
                    <Icon name={G.tabRoot} />
                  </button>
                ) : (
                  <div style={{ width: '40px' }}></div>
                )}
                <div className="datemark" style={{ position: 'static' }}>{dateStr}</div>
              </div>
              
              <div className="brand" style={{ position: 'static', padding: 0, width: '33%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>Shadow & Sanctuary</h1>
              </div>

              <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSettings(true)} className="btn sm" title="Configurations">
                  <Icon name="ph-gear" />
                </button>
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
                <h2>Settings</h2>
                <div className="mt mb-4">Adjust the chamber's atmosphere.</div>
              </div>
              <button className="btn sm" onClick={() => setShowSettings(false)}>X</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {/* Left Column: Appearance */}
              <div>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Appearance</h3>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Font Size ({settings.fontSize}px)</label>
                  <input type="range" min="12" max="32" value={settings.fontSize} 
                         onChange={e => setSettings({...settings, fontSize: e.target.value})} />
                </div>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Typeface</label>
                  <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})}>
                    <option value="IM Fell English">IM Fell English</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Pinyon Script">Pinyon Script</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Lora">Lora</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Inter">Inter</option>
                    <option value="Outfit">Outfit</option>
                    <option value="system-ui">System</option>
                  </select>
                </div>

                <div style={{ 
                  padding: '1rem', 
                  border: '1px dashed var(--border)', 
                  borderRadius: '8px',
                  background: 'var(--bg)',
                  marginTop: '1rem'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--dim)', marginBottom: '0.5rem' }}>Preview:</div>
                  <div style={{ 
                    fontFamily: `"${settings.fontFamily}", serif`, 
                    fontSize: `${settings.fontSize}px`,
                    color: 'var(--crimson)'
                  }}>
                    The quick brown fox jumps over the lazy dog. 1234567890
                  </div>
                </div>
              </div>
                <option value="IM Fell English">IM Fell English</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="Pinyon Script">Pinyon Script</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Lora">Lora</option>
                <option value="Merriweather">Merriweather</option>
                <option value="Inter">Inter</option>
                <option value="Outfit">Outfit</option>
                <option value="system-ui">System</option>
              </select>
            </div>
            
              {/* Middle Column: Voice & Integrations */}
              <div>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Integrations & Voice</h3>
                
                <div className="field" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                <input type="checkbox" checked={settings.tts} 
                     onChange={e => {
                       setSettings({...settings, tts: e.target.checked});
                       setTtsEnabled(e.target.checked);
                     }} /> Enable Voice
              </label>
              
              {settings.tts && (
                <div style={{ display: 'flex', marginTop: '0.5rem', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem' }}>Voice
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
                  <label style={{ fontSize: '0.8rem' }}>Speed
                    <input type="range" min="0.5" max="2.0" step="0.1" style={{ width: '100%' }}
                           value={ttsOptions.rate}
                           onChange={e => {
                             const v = parseFloat(e.target.value);
                             setTtsOptions({...ttsOptions, rate: v});
                             setTtsRate(v);
                           }} />
                  </label>
                  <label style={{ fontSize: '0.8rem' }}>Pitch
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
                <label style={{ color: 'var(--rose)', fontWeight: 'bold' }}>
                  <input type="checkbox" checked={settings.health}
                         onChange={async (e) => {
                           const checked = e.target.checked;
                           if (checked && Capacitor.isNativePlatform()) {
                             alert("Native Android Detected: Requesting direct System Health Connect Permissions for Samsung Health, RingConn, and Renpho...");
                             // Native plugin logic would go here
                             setSettings({...settings, health: true});
                           } else {
                             setSettings({...settings, health: checked});
                           }
                         }} /> Health Connect (RingConn, Renpho, Samsung)
                </label>
                {settings.health && !Capacitor.isNativePlatform() && (
                  <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" placeholder="Terra Developer ID" value={settings.terraDevId || ''} onChange={e => setSettings({...settings, terraDevId: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                    <input type="text" placeholder="Terra API Key" value={settings.terraApiKey || ''} onChange={e => setSettings({...settings, terraApiKey: e.target.value})} style={{ padding: '0.5rem', width: '100%' }} />
                    <div className="mt" style={{ fontSize: '0.8rem' }}>Enter your Terra credentials to pull sleep & readiness data.</div>
                  </div>
                )}
                
                <label style={{ color: 'var(--rose)', fontWeight: 'bold', marginTop: '1rem' }}>
                  <input type="checkbox" checked={settings.cal}
                         onChange={e => setSettings({...settings, cal: e.target.checked})} /> Google Calendar
                </label>
                {settings.cal && (
                  <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" placeholder="Google OAuth Client ID" value={settings.gcalClientId || ''} 
                           onChange={e => {
                             setSettings({...settings, gcalClientId: e.target.value});
                             if (e.target.value) {
                               initGoogleCalendar(e.target.value, () => alert("Google Calendar Authenticated!"));
                             }
                           }} style={{ padding: '0.5rem', width: '100%' }} />
                    <button className="btn sm g" onClick={() => requestCalendarAccess()} style={{ width: 'fit-content' }}>Bind Google Calendar</button>
                    <div className="mt" style={{ fontSize: '0.8rem' }}>Enter your Client ID and log in to fetch events.</div>
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
                if (window.confirm("Are you sure you want to reset the First Inscription? This will take you back to the intake questionnaire.")) {
                  const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
                  if (profile) {
                    await supabase.from('user_profile').update({ intake_completed: false }).eq('id', profile.id);
                  }
                  setShowSettings(false);
                  setCurrentScreen('intake');
                }
              }} className="btn g" style={{ width: '100%', marginBottom: '1rem' }}>Shatter the First Inscription</button>

              <button onClick={() => {
                if (window.confirm("Are you sure you want to completely erase all local settings, saved routines, and Supabase data? This cannot be undone.")) {
                  localStorage.clear();
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
