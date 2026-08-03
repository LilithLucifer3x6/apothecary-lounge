export const DEFAULT_AVATAR = {skin:'#5b3a29', loc:'#141118', eye:'#c4243a', robe:'#3a1148', style:'free', fam:'fam_cat.jpg', aura:'rgba(176,132,148,0.7)', sigil:'sparkle'};

export const AVATAR_OPTIONS = [
  {k:'skin', l:'Melanin', v:[['#3d2314','Obsidian'],['#4a2c1b','Chestnut'],['#5b3a29','Mahogany'],['#6c4634','Copper'],['#7a523d','Bronze']]},
  {k:'eye', l:'The Gaze', v:[['#c4243a','Crimson'],['#4b0082','Indigo'],['#d4af37','Gold'],['#c0c0c0','Silver']]},
  {k:'style', l:'The Crown (4C Locs)', v:[['free','Free flowing'],['buns','Twin Buns'],['updo','High Crown'],['half','Half Bound']]},
  {k:'loc', l:'Loc Tint', v:[['#141118','Midnight'],['#2b1b17','Sable'],['#4a0404','Blood'],['#241533','Plum']]},
  {k:'robe', l:'Vestments', v:[['#3a1148','Violet'],['#1a1110','Charcoal'],['#2c3539','Gunmetal'],['#400000','Oxblood']]},
  {k:'fam', l:'Familiar', v:[['fam_cat.jpg','Black Cat'],['fam_raven.jpg','Raven'],['fam_moth.jpg','Luna Moth']]},
  {k:'sigil', l:'Floating Sigil', v:[['sparkle','Star'],['moon','Moon'],['pentagram','Pentagram'],['sun','Sun']]},
  {k:'aura', l:'Magical Resonance', v:[['rgba(176,132,148,0.7)','Violet Void'],['rgba(255,215,0,0.6)','Golden Dawn'],['rgba(220,20,60,0.6)','Crimson Blood'],['rgba(46,139,87,0.7)','Jade Forest']]},
];

export function getAvatarConfig() {
  return JSON.parse(localStorage.getItem('avatar_config')) || DEFAULT_AVATAR;
}

export function generateLocsSVG(c, style) {
  // Use drop shadows to emphasize the paper doll cutout look
  const f = 'filter="url(#paperCut)"';
  const grad = 'url(#hairGrad)';
  if(style==='buns') return `<circle cx="55" cy="36" r="15" fill="${grad}" ${f}/><circle cx="95" cy="36" r="15" fill="${grad}" ${f}/>
    ${[50,60,90,100].map(x=>`<circle cx="${x}" cy="26" r="6" fill="${grad}" ${f}/>`).join('')}`;
  if(style==='high') return `<ellipse cx="75" cy="24" rx="24" ry="18" fill="${grad}" ${f}/>
    ${[60,70,80,90].map((x,i)=>`<circle cx="${x}" cy="${12+i%2*6}" r="6" fill="${grad}" ${f}/>`).join('')}`;
  if(style==='wrap') return `<path d="M42 62 Q75 25 108 62 Q108 40 75 32 Q42 40 42 62Z" fill="${grad}" ${f}/>
    <path d="M40 58 Q75 42 110 58 L110 68 Q75 52 40 68Z" fill="url(#goldGrad)" opacity=".9" ${f}/>
    <path d="M106 62 Q122 78 116 100" stroke="url(#goldGrad)" stroke-width="6" fill="none" stroke-linecap="round" ${f}/>`;
  if(style==='side') return `<path d="M104 60 Q130 110 110 165" stroke="${grad}" stroke-width="16" fill="none" stroke-linecap="round" ${f}/>
    ${[100,106,110,114].map((x,i)=>`<circle cx="${x+10}" cy="${80+i*24}" r="7" fill="${grad}" ${f}/>`).join('')}`;
  return `<path d="M44 60 Q34 130 48 165" stroke="${grad}" stroke-width="12" fill="none" stroke-linecap="round" ${f}/>
    <path d="M106 60 Q116 130 102 165" stroke="${grad}" stroke-width="12" fill="none" stroke-linecap="round" ${f}/>
    <path d="M58 62 Q50 120 60 155" stroke="${grad}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85" ${f}/>
    <path d="M92 62 Q100 120 90 155" stroke="${grad}" stroke-width="8" fill="none" stroke-linecap="round" opacity=".85" ${f}/>`;
}

export function generateAvatarSVG(s, pose = 'standing') {
  if(!s) return '';
  const locs = generateLocsSVG(s.loc, s.style);
  
  let rArm = `M50 140 Q40 180 50 220`;
  let lArm = `M100 140 Q115 180 100 220`;
  let props = '';

  if (pose === 'reading') {
    rArm = `M50 140 Q50 180 70 170`;
    lArm = `M100 140 Q100 180 80 170`;
    props = `<rect x="60" y="150" width="30" height="20" fill="#e6dcc3" stroke="#5a0a10" stroke-width="2" transform="rotate(-10 75 160)" />`;
  } else if (pose === 'meditating') {
    rArm = `M50 140 Q70 160 75 170`;
    lArm = `M100 140 Q80 160 75 170`;
    props = `<circle cx="75" cy="170" r="8" fill="#c4243a" opacity="0.6" filter="blur(2px)"/>`;
  } else if (pose === 'scrying') {
    rArm = `M50 140 Q60 200 65 220`;
    lArm = `M100 140 Q90 200 85 220`;
    props = `<ellipse cx="75" cy="230" rx="15" ry="5" fill="#3aa88a" opacity="0.5" filter="blur(3px)"/>`;
  } else if (pose === 'working') {
    rArm = `M50 140 Q70 180 90 200`;
    lArm = `M100 140 Q110 180 120 200`;
  }

  const auraColor = s.aura || 'rgba(176,132,148,0.7)';
  const sigil = s.sigil || 'sparkle';

  return `
  <defs>
    <!-- Paper texture overlay -->
    <filter id="paperTexture" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0" in="noise" result="coloredNoise"/>
      <feBlend in="SourceGraphic" in2="coloredNoise" mode="multiply"/>
    </filter>
    
    <!-- Paper cutout drop shadow -->
    <filter id="paperCut" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#050308" flood-opacity="0.6"/>
    </filter>
    
    <!-- Heavy magic glow -->
    <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Gradients for rich 2D shading -->
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${s.skin}"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.3"/>
    </linearGradient>
    
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${s.loc}"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
    </linearGradient>

    <linearGradient id="robeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${s.robe}"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.5"/>
    </linearGradient>
    
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffeaa7"/>
      <stop offset="100%" stop-color="#b8860b"/>
    </linearGradient>

    <clipPath id="famClip"><rect x="110" y="80" width="80" height="110" rx="15" ry="15"/></clipPath>
  </defs>

  <!-- Apply the paper texture over EVERYTHING -->
  <g filter="url(#paperTexture)">
    
    <!-- Aura Background -->
    <circle cx="75" cy="120" r="75" fill="${auraColor}" filter="url(#heavyGlow)" style="mix-blend-mode: screen;" opacity="0.8"/>
    
    <!-- right arm (back) -->
    <path d="${rArm}" stroke="url(#robeGrad)" stroke-width="26" fill="none" stroke-linecap="round" filter="url(#paperCut)"/>
    
    <!-- body / robe base -->
    <path d="M75 140 Q35 220 15 320 L135 320 Q115 220 75 140Z" fill="url(#robeGrad)" filter="url(#paperCut)"/>
    
    ${props}

    <!-- left arm (front) -->
    <path d="${lArm}" stroke="url(#robeGrad)" stroke-width="28" fill="none" stroke-linecap="round" filter="url(#paperCut)"/>
    
    <!-- Robe collar/trim -->
    <path d="M40 185 Q40 110 75 110 Q110 110 110 185 Z" fill="url(#robeGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#paperCut)"/>
    <!-- Deep body shading -->
    <path d="M40 185 Q40 110 75 110 Q80 110 85 185 Z" fill="#000" opacity="0.4"/>
    
    <!-- neck -->
    <rect x="65" y="98" width="20" height="24" rx="8" fill="url(#skinGrad)" filter="url(#paperCut)"/>
    
    ${generateLocsSVG(s.loc,s.style)}
    
    <!-- head -->
    <ellipse cx="75" cy="72" rx="29" ry="33" fill="url(#skinGrad)" filter="url(#paperCut)"/>
    <!-- Face highlight -->
    <ellipse cx="68" cy="65" rx="18" ry="22" fill="#fff" opacity="0.1"/>
    
    <!-- hair base -->
    <path d="M44 66 Q75 30 106 66 Q106 42 75 36 Q44 42 44 66Z" fill="url(#hairGrad)" filter="url(#paperCut)"/>
    ${[48,58,68,78,88,98].map(x=>`<circle cx="${x}" cy="${42+Math.abs(75-x)*0.18}" r="5" fill="url(#hairGrad)" filter="url(#paperCut)"/>`).join('')}
    
    <!-- eyes -->
    <path d="M60 72 Q66 65 72 72 Q66 78 60 72Z" fill="#fff" filter="url(#paperCut)"/>
    <path d="M78 72 Q84 65 90 72 Q84 78 78 72Z" fill="#fff" filter="url(#paperCut)"/>
    
    <!-- irises with glow -->
    <ellipse cx="66" cy="72" rx="2.5" ry="4.5" fill="${s.eye}" filter="url(#heavyGlow)"/>
    <ellipse cx="84" cy="72" rx="2.5" ry="4.5" fill="${s.eye}" filter="url(#heavyGlow)"/>
    <circle cx="65.5" cy="71" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="83.5" cy="71" r="1" fill="#fff" opacity="0.8"/>
    
    <!-- mouth -->
    <path d="M69 88 Q75 92 81 88" stroke="#331c18" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M72 87 Q75 90 78 87" stroke="#8a4242" stroke-width="2" fill="none" stroke-linecap="round"/>
    
    <!-- floating sigil -->
    <text x="30" y="90" fill="${auraColor}" font-size="38" font-family="sans-serif" text-anchor="middle" filter="url(#heavyGlow)" opacity="0.95">${sigil}</text>
    
    <!-- Familiar (Much larger and framed as an embedded photo cutout) -->
    <g filter="url(#paperCut)">
      <rect x="108" y="78" width="84" height="114" rx="17" ry="17" fill="url(#goldGrad)"/>
      <rect x="110" y="80" width="80" height="110" rx="15" ry="15" fill="#000"/>
      <image href="/assets/${s.fam}" x="110" y="80" width="80" height="110" clip-path="url(#famClip)" preserveAspectRatio="xMidYMid slice" opacity="0.9"/>
    </g>
    
  </g>
  `;
}
