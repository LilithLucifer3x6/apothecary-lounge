export function getAvatarConfig() {
  return JSON.parse(localStorage.getItem('avatar_config') || '{"skin":"#5c3a21","hair":"shoulder","eyes":"#c4243a","garment":"#5a0a10","familiar":"cat"}');
}

export function generateAvatarSVG(config, scale = 1) {
  const { skin, hair, eyes, garment, familiar } = config;

  let hairSVG = '';
  // Scalloped / bumpy paths to represent microlocs texture
  if (hair === 'shoulder') {
    hairSVG = `<path d="M 45 40 Q 30 70 40 100 Q 42 105 45 100 Q 55 110 50 80 Z M 105 40 Q 120 70 110 100 Q 108 105 105 100 Q 95 110 100 80 Z" fill="#111" stroke="#222" stroke-width="2"/>
               <path d="M 45 40 Q 75 10 105 40 Q 75 20 45 40 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2"/>`;
  } else if (hair === 'waist') {
    hairSVG = `<path d="M 45 40 Q 20 90 35 150 Q 38 155 42 150 Q 55 140 50 80 Z M 105 40 Q 130 90 115 150 Q 112 155 108 150 Q 95 140 100 80 Z" fill="#111" stroke="#222" stroke-width="2"/>
               <path d="M 45 40 Q 75 10 105 40 Q 75 20 45 40 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2"/>`;
  } else if (hair === 'buns') {
    hairSVG = `<path d="M 45 20 Q 25 20 25 40 Q 25 60 45 60 Q 65 60 65 40 Q 65 20 45 20 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2"/>
               <path d="M 105 20 Q 85 20 85 40 Q 85 60 105 60 Q 125 60 125 40 Q 125 20 105 20 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2"/>`;
  } else if (hair === 'updo') {
    hairSVG = `<path d="M 45 30 Q 75 -10 105 30 Q 75 10 45 30 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2"/>`;
  } else if (hair === 'short') {
    hairSVG = `<path d="M 50 40 Q 40 10 75 15 Q 110 10 100 40 Q 75 25 50 40 Z" fill="#111" stroke="#222" stroke-width="2" stroke-dasharray="2,2" />`;
  } else if (hair === 'wrapped') {
    hairSVG = `<path d="M 40 50 Q 75 0 110 50 Z" fill="${garment}" />`;
  }

  let familiarSVG = '';
  if (familiar === 'cat') {
    familiarSVG = `<path d="M 120 160 Q 125 140 135 150 L 140 160 Z" fill="#111"/><circle cx="128" cy="152" r="2" fill="var(--gold)"/><circle cx="134" cy="152" r="2" fill="var(--gold)"/>`;
  } else if (familiar === 'raven') {
    familiarSVG = `<path d="M 120 150 L 135 140 L 140 160 Z" fill="#111"/>`;
  } else if (familiar === 'toad') {
    familiarSVG = `<ellipse cx="130" cy="170" rx="10" ry="8" fill="#3d4438"/>`;
  } else if (familiar === 'moth') {
    familiarSVG = `<path d="M 120 140 L 130 130 L 140 140 L 130 150 Z" fill="var(--silver)"/>`;
  } else if (familiar === 'snake') {
    familiarSVG = `<path d="M 120 170 Q 130 160 140 170 Q 135 180 120 175" fill="#3d4438" stroke="var(--gold)" stroke-width="1"/>`;
  }

  return `
    <g transform="scale(${scale})">
      <!-- Hair Back -->
      ${hairSVG}

      <!-- Body / Garment -->
      <path d="M 40 100 C 40 90, 110 90, 110 100 L 140 195 L 10 195 Z" fill="${garment}" />
      
      <!-- Head / Skin -->
      <circle cx="75" cy="65" r="30" fill="${skin}" />
      <path d="M 65 90 L 75 110 L 85 90 Z" fill="${skin}" /> <!-- Neck -->

      <!-- Eyes -->
      <circle cx="62" cy="60" r="4" fill="${eyes}" />
      <circle cx="88" cy="60" r="4" fill="${eyes}" />
      ${eyes === '#c4243a' ? `
        <ellipse cx="62" cy="60" rx="1" ry="3" fill="#000" />
        <ellipse cx="88" cy="60" rx="1" ry="3" fill="#000" />
      ` : `
        <circle cx="62" cy="60" r="2" fill="#000" />
        <circle cx="88" cy="60" r="2" fill="#000" />
      `}
      
      <!-- Familiar -->
      ${familiarSVG}
    </g>
  `;
}
