import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import { G, verifyGlyphs } from './lib/icons.js';
import { getTtsEnabled, getTtsRate, getTtsPitch, getTtsVoiceURI, setTtsEnabled, setTtsRate, setTtsPitch, setTtsVoiceURI, getFeminineVoices } from './lib/tts.js';
import Icon from './components/Icon.jsx';

import AvatarBuilder from './screens/AvatarBuilder.jsx';
import Landing from './screens/Landing.jsx';
import Intake from './screens/Intake.jsx';
import Rites from './screens/Rites.jsx';
import Grimoire from './screens/Grimoire.jsx';
import Altars from './screens/Altars.jsx';
import Rootwork from './screens/Rootwork.jsx';
import Scrying from './screens/Scrying.jsx';
import ShadowTome from './screens/ShadowTome.jsx';

const TABS = [
  { id: 'rites', label: 'The Mortal Rites', glyph: G.tabRites, bg: '/assets/room_land.jpg', pose: 'working' },
  { id: 'grim', label: 'The Grimoire', glyph: G.tabGrim, bg: '/assets/room_grim.jpg', pose: 'reading' },
  { id: 'altars', label: 'The Altars', glyph: G.tabAltars, bg: '/assets/room_altars.jpg', pose: 'meditating' },
  { id: 'root', label: 'The Rootwork', glyph: G.tabRoot, bg: '/assets/room_root.jpg', pose: 'working' },
  { id: 'pool', label: 'The Scrying Pool', glyph: G.tabPool, bg: '/assets/room_pool.jpg', pose: 'scrying' },
  { id: 'tome', label: 'The Shadow Tome', glyph: G.tabTome, bg: '/assets/room_tome.jpg', pose: 'reading' }
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
    cal: false
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
    
    // Always boot to the splash screen
    document.body.style.backgroundImage = `url('/assets/app_bg.jpg')`;
    
    // Sync settings with profile in background
    supabase.from('user_profile').select('*').maybeSingle().then(({ data: profile }) => {
      if (profile && profile.settings) {
        localStorage.setItem('app_settings', JSON.stringify(profile.settings));
        setSettings(profile.settings);
        applySettings(profile.settings);
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
    const { data: profile } = await supabase.from('user_profile').select('*').maybeSingle();
    
    if (profile && profile.avatar_config) {
      localStorage.setItem('avatar_config', JSON.stringify(profile.avatar_config));
    }

    if (!profile) {
      document.body.style.backgroundImage = `url('/assets/room_land.jpg')`;
      setCurrentScreen('landing');
    } else if (profile && !profile.intake_completed) {
      document.body.style.backgroundImage = `url('/assets/room_land.jpg')`;
      setCurrentScreen('intake');
    } else {
      setCurrentScreen('app');
      handleTabClick('rites');
    }
  };

  const handleReturnToCottage = () => {
    document.body.style.backgroundImage = `url('/assets/room_land.jpg')`;
    setCurrentScreen('landing');
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
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
          <h1 style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>The Apothecary Lounge</h1>
          <div className="tag" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>A sanctuary of self-care.</div>
          <button onClick={handleEnter} className="btn" style={{ fontSize: '1.1rem', padding: '0.8rem 1.5rem', marginTop: '2rem' }}>
            Approach the Cottage ➔
          </button>
        </div>
      )}

      {currentScreen === 'avatar' && (
        <div id="s-av" className="land">
          <AvatarBuilder onComplete={() => setCurrentScreen('landing')} />
        </div>
      )}

      {currentScreen === 'landing' && (
        <div id="s-land" className="land">
          <Landing onProceed={(hasProfile) => setCurrentScreen(hasProfile ? 'app' : 'intake')} />
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
                <button onClick={handleReturnToCottage} className="btn sm" title="Return to Cottage">
                  <Icon name={G.tabRoot} />
                </button>
                <div className="datemark" style={{ position: 'static' }}>{dateStr}</div>
              </div>
              
              <div className="brand" style={{ position: 'static', padding: 0, width: '33%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>The Apothecary Lounge</h1>
              </div>

              <div style={{ width: '33%', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowSettings(true)} className="btn sm" title="Settings">
                  <Icon name="ph-gear" />
                </button>
              </div>
            </div>
            
            <div className="tabs">
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
        <div id="setmodal" className="modal" style={{ display: 'block' }}>
          <div className="modal-content card">
            <div className="corner tl">❧</div><div className="corner tr">☙</div>
            <div className="corner bl">☙</div><div className="corner br">❧</div>
            <h2>Settings</h2>
            <div className="mt">Adjust the chamber's atmosphere.</div>
            
            <div className="field" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Font Size</label>
              <input type="range" min="14" max="24" value={settings.fontSize} 
                     onChange={e => setSettings({...settings, fontSize: e.target.value})} />
            </div>
            
            <div className="field" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Typeface</label>
              <select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})}>
                <option value="IM Fell English">IM Fell English</option>
                <option value="Cormorant Garamond">Cormorant Garamond</option>
                <option value="system-ui">System</option>
              </select>
            </div>
            
            <div className="field" style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Voice (TTS)</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--gold)' }}>Integrations</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                <label>
                  <input type="checkbox" checked={settings.health}
                         onChange={e => {
                           const checked = e.target.checked;
                           if (checked) {
                             setTimeout(() => alert("Android Health Connect authorized successfully! (Simulated)"), 300);
                           }
                           setSettings({...settings, health: checked});
                         }} /> Android Health Connect
                </label>
                <label>
                  <input type="checkbox" checked={settings.cal}
                         onChange={e => {
                           const checked = e.target.checked;
                           if (checked) {
                             setTimeout(() => alert("Google Calendar authorized successfully! (Simulated)"), 300);
                           }
                           setSettings({...settings, cal: checked});
                         }} /> Google Calendar
                </label>
              </div>
            </div>
            
            <button onClick={() => saveSettings(settings)} className="btn full plum" style={{ marginTop: '2rem', padding: '0.8rem' }}>Save Settings</button>
          </div>
        </div>
      )}
    </>
  );
}
