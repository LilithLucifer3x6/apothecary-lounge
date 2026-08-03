export const DEFAULT_AVATAR = {skin:'#5b3a29', loc:'#141118', eye:'#c4243a', robe:'#3a1148', style:'free', fam:'🐈‍⬛'};

export const AVO = [
  {k:'skin', l:'Their complexion', v:[['#6b4630','Warm deep'],['#5b3a29','Rich umber'],['#4a2e20','Espresso'],['#3a2318','Deepest']]},
  {k:'loc', l:'The colour of their crown', v:[['#141118','Black'],['#3b1d24','Oxblood'],['#2a1a3a','Violet-black'],['#6b4a2a','Bronze']]},
  {k:'eye', l:'Their eyes', v:[['#c4243a','Red'],['#a9adb8','Amber'],['#7a4ec4','Violet'],['#3aa88a','Jade']]},
  {k:'robe', l:'Their garment', v:[['#3a1148','Plum'],['#5a0a10','Crimson'],['#14141a','Obsidian'],['#3d4438','Moss']]},
  {k:'style', l:'How they wear their crown', v:[['free','Loose'],['buns','Twin buns'],['high','Crowned high'],['wrap','Wrapped'],['side','Swept aside']]},
  {k:'fam', l:'Their familiar', v:[['fam_cat.jpg','Cat'],['fam_bat.jpg','Bat'],['fam_snake.jpg','Serpent'],['fam_owl.jpg','Owl'],['fam_rat.jpg','Rat']]},
];

export function getAvatarConfig() {
  return JSON.parse(localStorage.getItem('avatar_config')) || DEFAULT_AVATAR;
}

export function generateLocsSVG(c, style) {
  if(style==='buns') return `<circle cx="55" cy="36" r="13" fill="${c}"/><circle cx="95" cy="36" r="13" fill="${c}"/>
    ${[50,60,90,100].map(x=>`<circle cx="${x}" cy="26" r="4" fill="${c}"/>`).join('')}`;
  if(style==='high') return `<ellipse cx="75" cy="28" rx="20" ry="15" fill="${c}"/>
    ${[62,70,78,86].map((x,i)=>`<circle cx="${x}" cy="${16+i%2*5}" r="4.5" fill="${c}"/>`).join('')}`;
  if(style==='wrap') return `<path d="M46 58 Q75 30 104 58 Q104 40 75 36 Q46 40 46 58Z" fill="${c}"/>
    <path d="M44 56 Q75 40 106 56 L106 64 Q75 50 44 64Z" fill="#a9adb8" opacity=".8"/>
    <path d="M104 60 Q118 74 112 92" stroke="#a9adb8" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>`;
  if(style==='side') return `<path d="M104 60 Q126 106 108 156" stroke="${c}" stroke-width="13" fill="none" stroke-linecap="round"/>
    ${[100,106,110,112].map((x,i)=>`<circle cx="${x+8}" cy="${80+i*22}" r="5" fill="${c}"/>`).join('')}`;
  return `<path d="M46 60 Q38 126 50 160" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M104 60 Q112 126 100 160" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M58 62 Q52 120 60 152" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M92 62 Q98 120 90 152" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>`;
}

export function generateAvatarSVG(s) {
  return `<path d="M45 180 Q45 112 75 112 Q105 112 105 180 Z" fill="${s.robe}" stroke="#1a1110" stroke-width="2.5"/>
  <!-- body shading -->
  <path d="M45 180 Q45 112 75 112 Q80 112 85 180 Z" fill="#000" opacity="0.15"/>
  <path d="M45 180 Q75 172 105 180" fill="none" stroke="rgba(201,162,90,.5)" stroke-width="2"/>
  
  <!-- neck -->
  <rect x="66" y="98" width="18" height="20" rx="6" fill="${s.skin}" stroke="#1a1110" stroke-width="2.5"/>
  <!-- chin shadow -->
  <path d="M66 100 Q75 115 84 100 Z" fill="#000" opacity="0.25"/>
  
  ${generateLocsSVG(s.loc,s.style)}
  
  <!-- head -->
  <ellipse cx="75" cy="72" rx="27" ry="30" fill="${s.skin}" stroke="#1a1110" stroke-width="2.5"/>
  <!-- face shading -->
  <ellipse cx="70" cy="72" rx="22" ry="30" fill="#fff" opacity="0.05"/>
  
  <!-- hair base -->
  <path d="M48 66 Q75 34 102 66 Q102 44 75 40 Q48 44 48 66Z" fill="${s.loc}" stroke="#1a1110" stroke-width="2"/>
  ${[52,60,68,76,84,92,98].map(x=>`<circle cx="${x}" cy="${44+Math.abs(75-x)*0.16}" r="3.4" fill="${s.loc}"/>`).join('')}
  
  <!-- eyes -->
  <path d="M62 72 Q67 66 73 72 Q67 77 62 72Z" fill="#fff" stroke="#1a1110" stroke-width="1.5"/>
  <path d="M77 72 Q83 66 88 72 Q83 77 77 72Z" fill="#fff" stroke="#1a1110" stroke-width="1.5"/>
  
  <!-- irises -->
  <ellipse cx="67.5" cy="72" rx="2.1" ry="4.2" fill="${s.eye}"/>
  <ellipse cx="82.5" cy="72" rx="2.1" ry="4.2" fill="${s.eye}"/>
  
  <!-- mouth -->
  <path d="M70 86 Q75 89 80 86" stroke="#1a1110" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  
  <!-- book -->
  <rect x="88" y="132" width="26" height="32" rx="3" fill="#2a1a10" stroke="#a9adb8" stroke-width="2"/>
  <path d="M101 134 V162" stroke="#a9adb8" stroke-width="1.5" opacity=".7"/>
  <path d="M92 140 h7 M92 146 h7 M104 140 h7 M104 146 h7" stroke="#e6dcc3" stroke-width="1.2" opacity=".6"/>
  
  <!-- familiar -->
  <defs>
    <clipPath id="famClip"><circle cx="132" cy="165" r="16"/></clipPath>
  </defs>
  <circle cx="132" cy="165" r="17.5" fill="#1a1110"/>
  <image href="/assets/${s.fam}" x="116" y="149" width="32" height="32" clip-path="url(#famClip)"/>`;
}
