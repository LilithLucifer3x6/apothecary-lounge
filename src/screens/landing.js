import { go } from '../main.js';
import { getAvatarConfig, generateAvatarSVG } from '../lib/avatar.js';
import { render as renderIntake } from './intake.js';

export function render(container) {
  const avatarConfig = getAvatarConfig();
  container.innerHTML = `
    <div class="scene">
      <svg viewBox="0 0 520 340" class="cottage-scene" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        <!-- Background Walls -->
        <rect width="520" height="340" fill="var(--bg)" />
        <path d="M 0 0 L 520 0 L 520 200 L 0 200 Z" fill="var(--card)" />
        <path d="M 0 200 L 520 200 L 520 340 L 0 340 Z" fill="#050407" /> <!-- Floor -->
        
        <!-- Wooden Beams -->
        <rect x="0" y="0" width="520" height="15" fill="#221815" />
        <rect x="100" y="0" width="15" height="200" fill="#221815" />
        <rect x="300" y="0" width="15" height="200" fill="#221815" />
        
        <!-- Arched Doorway -->
        <path d="M 380 200 L 380 70 A 40 40 0 0 1 460 70 L 460 200 Z" fill="#0b090e" stroke="var(--border)" stroke-width="2"/>
        
        <!-- Hearth -->
        <path d="M 40 200 L 40 100 L 160 100 L 160 200 Z" fill="#1b171f" stroke="var(--border)"/>
        <path d="M 60 200 L 60 140 A 20 20 0 0 1 140 140 L 140 200 Z" fill="#050407" />
        <path d="M 80 190 Q 100 160 120 190 Z" fill="var(--crimson)" />
        <circle cx="100" cy="180" r="15" fill="#c4a035" filter="url(#glow)" opacity="0.6"/>
        <!-- Cauldron -->
        <path d="M 85 180 C 85 195, 115 195, 115 180 Z" fill="#111" />
        
        <!-- Apothecary Bench -->
        <rect x="200" y="150" width="90" height="50" fill="#18131d" />
        <!-- Bottles -->
        <rect x="210" y="130" width="10" height="20" fill="var(--ash)" rx="2" />
        <circle cx="235" cy="140" r="8" fill="var(--plum)" />
        <rect x="250" y="125" width="12" height="25" fill="var(--rose)" rx="2" />
        <rect x="270" y="135" width="8" height="15" fill="var(--gold)" rx="2" />
        
        <!-- Sleeping Area -->
        <rect x="420" y="160" width="80" height="40" fill="#110e15" rx="5" />
        
        <!-- Ritual Circle -->
        <ellipse cx="260" cy="270" rx="100" ry="40" fill="none" stroke="var(--border)" stroke-width="2" stroke-dasharray="5,5" />
        <ellipse cx="260" cy="270" rx="80" ry="30" fill="none" stroke="var(--plum)" stroke-width="1" />
        
        <!-- Alchemy Station -->
        <rect x="50" y="220" width="60" height="40" fill="#111" />
        <circle cx="80" cy="210" r="10" fill="none" stroke="var(--silver)" stroke-width="2" />
        
        <!-- Dynamic Avatar and Familiar -->
        <g transform="translate(220, 200)">
          ${generateAvatarSVG(avatarConfig, 0.4)}
        </g>
        
        <!-- Candles -->
        <g id="candles">
          <circle cx="70" cy="140" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 68 142 L 72 142 L 70 135 Z" fill="#fff"/>
          
          <circle cx="205" cy="125" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 203 127 L 207 127 L 205 120 Z" fill="#fff"/>
          
          <circle cx="285" cy="125" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 283 127 L 287 127 L 285 120 Z" fill="#fff"/>
          
          <circle cx="430" cy="150" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 428 152 L 432 152 L 430 145 Z" fill="#fff"/>
          
          <circle cx="180" cy="270" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 178 272 L 182 272 L 180 265 Z" fill="#fff"/>
          
          <circle cx="340" cy="270" r="8" fill="#c4a035" filter="url(#glow)" opacity="0.4"/>
          <path d="M 338 272 L 342 272 L 340 265 Z" fill="#fff"/>
        </g>
      </svg>
      <div class="land-content" style="text-align:center; padding-top:2rem;">
        <h1 style="font-family:'Pinyon Script', cursive; font-size:3rem; color:var(--parch); margin-bottom:0.5rem;">The Apothecary Lounge</h1>
        <p style="font-family:'Cormorant Garamond', serif; font-style:italic; font-size:1.2rem; color:var(--ash); margin-bottom:2rem;">a place to keep the work of caring for yourself</p>
        <button id="btn-cross" class="btn plum">Cross the Threshold</button>
      </div>
    </div>
  `;

  document.getElementById('btn-cross').addEventListener('click', () => {
    renderIntake(document.getElementById('s-ins'));
    go('s-ins'); // Go to intake
  });
}
