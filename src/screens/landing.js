import { go } from '../main.js';
import { getAvatarConfig, generateAvatarSVG } from '../lib/avatar.js';
import { render as renderIntake } from './intake.js';

export function render(container) {
  const avatarConfig = getAvatarConfig();

  function drawCottage() {
    const candle=(x,base,hgt)=>`<rect x="${x-2.5}" y="${base-hgt}" width="5" height="${hgt}" rx="1" fill="#e6dcc3"/>
      <rect x="${x-3.5}" y="${base-2}" width="7" height="3" rx="1" fill="#8f939c"/>
      <ellipse cx="${x}" cy="${base-hgt-4}" rx="2.6" ry="4.6" fill="#d8a04a"/>
      <ellipse cx="${x}" cy="${base-hgt-3}" rx="1.1" ry="2.3" fill="#fff5d8"/>
      <ellipse cx="${x}" cy="${base-hgt-4}" rx="8" ry="10" fill="#d8a04a" opacity=".07"/>`;
    const pent=(cx,cy,r)=>{const p=[];for(let i=0;i<5;i++){const a=(-90+i*144)*Math.PI/180;
      p.push(`${cx+r*Math.cos(a)},${cy+r*0.42*Math.sin(a)}`);}
      return `<polygon points="${p.join(' ')}" fill="none" stroke="#b08494" stroke-width="1.3" opacity=".7"/>`;};

    return `
      <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1424"/><stop offset="100%" stop-color="#0d0a12"/></linearGradient>
      <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#241c2a"/><stop offset="100%" stop-color="#161020"/></linearGradient>
      <pattern id="stone" width="34" height="18" patternUnits="userSpaceOnUse">
        <rect width="34" height="18" fill="#241d28"/>
        <path d="M0 18 H34 M17 0 V18" stroke="#191320" stroke-width="1.5"/></pattern>
      </defs>
      <rect width="520" height="340" fill="url(#wall)"/>
      ${[...Array(13)].map((_,i)=>`<rect x="${i*41}" y="0" width="38" height="286" fill="#1e1728" opacity="${i%2?.5:.22}"/>`).join('')}
      <rect x="0" y="282" width="520" height="58" fill="url(#floor)"/>
      <path d="M0 282 H520" stroke="#3a3145" stroke-width="2"/>

      <!-- working circle -->
      <ellipse cx="258" cy="314" rx="80" ry="19" fill="none" stroke="#a9adb8" stroke-width="1.3" opacity=".5"/>
      <ellipse cx="258" cy="314" rx="62" ry="14" fill="none" stroke="#a9adb8" stroke-width=".9" opacity=".32"/>
      ${pent(258,314,62)}
      <ellipse cx="258" cy="314" rx="84" ry="22" fill="#b08494" opacity=".05"/>

      <!-- hearth -->
      <rect x="12" y="140" width="112" height="142" fill="url(#stone)" stroke="#3a3145" stroke-width="2"/>
      <rect x="12" y="140" width="112" height="10" fill="#2e2636"/>
      <path d="M24 282 V198 Q68 176 112 198 V282Z" fill="#07050c"/>
      <path d="M24 282 V198 Q68 176 112 198" fill="none" stroke="#3a3145" stroke-width="2"/>
      <rect x="30" y="272" width="76" height="6" rx="2" fill="#2a2130"/>
      <ellipse cx="68" cy="270" rx="30" ry="9" fill="#3a1408"/>
      <path d="M50 270 Q58 238 68 258 Q80 232 86 270Z" fill="#c4531e" opacity=".9"/>
      <path d="M59 270 Q66 248 73 270Z" fill="#f0d48a" opacity=".9"/>
      <path d="M40 236 Q68 226 96 236" stroke="#4a4252" stroke-width="2.5" fill="none"/>
      <ellipse cx="68" cy="248" rx="21" ry="13" fill="#14121a" stroke="#4a4252" stroke-width="2"/>
      <ellipse cx="68" cy="242" rx="17" ry="5.5" fill="#3a1148"/>
      <path d="M61 232 Q65 220 68 229 Q71 217 75 232" fill="none" stroke="#8a6aa8" stroke-width="1.3" opacity=".5"/>
      <ellipse cx="68" cy="258" rx="62" ry="44" fill="#c4531e" opacity=".07"/>
      ${candle(28,140,24)}${candle(108,140,30)}

      <!-- apothecary shelves -->
      <rect x="150" y="118" width="122" height="7" rx="2" fill="#2e2636"/>
      <rect x="150" y="168" width="122" height="7" rx="2" fill="#2e2636"/>
      ${[156,176,196,216,236,254].map((x,i)=>`<rect x="${x}" y="${i%2?94:98}" width="14" height="${i%2?24:20}" rx="3" fill="${['#5a0a10','#3a1148','#4a4252','#6b4a2a','#3a1148','#5a0a10'][i]}" opacity=".93"/>
        <rect x="${x}" y="${i%2?94:98}" width="14" height="4" rx="1" fill="#8f939c" opacity=".6"/>`).join('')}
      ${[156,180,206,230,254].map((x,i)=>`<rect x="${x}" y="${i%2?144:148}" width="16" height="${i%2?24:20}" rx="3" fill="${['#b08494','#3d4438','#5a0a10','#3a1148','#4a4252'][i]}" opacity=".93"/>
        <rect x="${x}" y="${i%2?144:148}" width="16" height="4" rx="1" fill="#8f939c" opacity=".6"/>`).join('')}

      <!-- alchemy bench -->
      <rect x="298" y="206" width="132" height="9" rx="2" fill="#2e2636"/>
      <rect x="304" y="215" width="9" height="67" fill="#251d2c"/><rect x="416" y="215" width="9" height="67" fill="#251d2c"/>
      <rect x="304" y="246" width="121" height="5" fill="#251d2c" opacity=".8"/>
      <ellipse cx="330" cy="196" rx="15" ry="10" fill="#1a1622" stroke="#8f939c" stroke-width="1.4"/>
      <path d="M330 186 V172 M323 172 h14" stroke="#8f939c" stroke-width="1.4" fill="none"/>
      <path d="M322 197 Q330 180 338 197Z" fill="#6a8a7a" opacity=".4"/>
      <path d="M344 190 Q356 176 368 190" stroke="#8f939c" stroke-width="1.2" fill="none" opacity=".55"/>
      <rect x="352" y="190" width="8" height="16" rx="2" fill="#3a1148" opacity=".9"/>
      <rect x="364" y="186" width="8" height="20" rx="2" fill="#5a0a10" opacity=".9"/>
      <rect x="376" y="192" width="8" height="14" rx="2" fill="#3d4438" opacity=".9"/>
      <ellipse cx="400" cy="199" rx="11" ry="7" fill="#1a1622" stroke="#8f939c" stroke-width="1.2"/>
      ${candle(392,206,20)}

      <!-- bed -->
      <rect x="440" y="240" width="74" height="42" rx="5" fill="#2e2636"/>
      <rect x="440" y="226" width="28" height="16" rx="6" fill="#e6dcc3" opacity=".28"/>
      <rect x="446" y="234" width="64" height="14" rx="4" fill="${avatarConfig.robe}" opacity=".9"/>
      <rect x="440" y="248" width="74" height="4" fill="#a9adb8" opacity=".22"/>

      <!-- hanging herbs -->
      ${[158,178,198,218].map(x=>`<path d="M${x} 54 L${x} 80" stroke="#3a3028" stroke-width="1.4"/>
        <path d="M${x} 80 Q${x-7} 70 ${x} 60 Q${x+7} 70 ${x} 80Z" fill="#3d4438" opacity=".7"/>`).join('')}
      ${[306,326,346].map(x=>`<path d="M${x} 50 L${x} 72" stroke="#3a3028" stroke-width="1.3"/>
        <path d="M${x} 72 Q${x-6} 63 ${x} 54 Q${x+6} 63 ${x} 72Z" fill="#b08494" opacity=".5"/>`).join('')}

      <g transform="translate(196,152) scale(0.7)">${generateAvatarSVG(avatarConfig)}</g>
      <text x="300" y="278" font-size="24">${avatarConfig.fam}</text>
    `;
  }

  container.innerHTML = `
    <div class="land">
      <div class="scene"><svg id="cottage" viewBox="0 0 520 340" width="100%">${drawCottage()}</svg></div>
      <h1 style="font-family:'Pinyon Script', cursive; font-size:3.1em; margin:.7rem 0 .1rem; color:var(--parch);">The Apothecary Lounge</h1>
      <div class="tag" style="font-family:'Cormorant Garamond', serif; font-style:italic; color:var(--silver); font-size:1.06em; margin-bottom:1.2rem;">a place to keep the work of caring for yourself</div>
      <button class="btn plum" id="btn-cross">Cross the Threshold</button>
    </div>
  `;

  document.getElementById('btn-cross').addEventListener('click', () => {
    renderIntake(document.getElementById('s-ins'));
    go('s-ins');
  });
}
