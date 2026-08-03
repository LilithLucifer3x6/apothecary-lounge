import React, { useState } from 'react';
import { generateAvatarSVG, AVO, getAvatarConfig } from '../lib/avatar.js';
import Icon from '../components/Icon.jsx';

export default function AvatarBuilder({ onComplete }) {
  const [currentConfig, setCurrentConfig] = useState(getAvatarConfig());

  const handleOptionClick = (key, value) => {
    setCurrentConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    localStorage.setItem('avatar_config', JSON.stringify(currentConfig));
    if (onComplete) {
      onComplete();
    }
  };

  const svgInner = `<ellipse cx="75" cy="190" rx="48" ry="8" fill="#000" opacity=".5" filter="blur(2px)"/>` + generateAvatarSVG(currentConfig);

  return (
    <>
      {/* Cottage Background Immersion */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, overflow: 'hidden' }}>
        <img 
          src="/assets/cottage_room.jpg" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(3px) brightness(0.6) contrast(1.2)' }} 
          alt="Cottage" 
        />
      </div>
      <main style={{ paddingTop: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', background: 'rgba(13,10,16,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 12px 38px rgba(0,0,0,0.9)' }}>
          <h2 className="t" style={{ fontFamily: "'Pinyon Script', cursive", fontSize: '3rem', textAlign: 'center', color: 'var(--parch)', marginBottom: 0 }}>
            Who Keeps This Place?
          </h2>
          <div className="flourish" style={{ marginBottom: '1.5rem' }}>✧ ✦ ✧</div>
          
          <div className="scene" style={{ background: 'transparent', boxShadow: 'none', border: 'none', marginBottom: '1.5rem', position: 'relative', overflow: 'visible' }}>
            <svg 
              id="avsvg" 
              viewBox="0 0 170 210" 
              width="100%" 
              height="260" 
              style={{ overflow: 'visible' }} 
              dangerouslySetInnerHTML={{ __html: svgInner }}
            />
          </div>
          <div id="avopts" style={{ background: 'rgba(5,3,8,0.4)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {AVO.map((o) => (
              <React.Fragment key={o.k}>
                <label className="fl">{o.l}</label>
                <div className="opts">
                  {o.v.map(v => (
                    <button 
                      key={v[0]}
                      className={`opt2${currentConfig[o.k] === v[0] ? ' on' : ''}`} 
                      onClick={() => handleOptionClick(o.k, v[0])}
                    >
                      {v[1]}
                    </button>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
          <button className="btn full plum" id="btn-save-av" style={{ marginTop: '1.5rem', fontSize: '1.1rem', padding: '1rem' }} onClick={handleSave}>
            She is ready
          </button>
        </div>
      </main>
    </>
  );
}
