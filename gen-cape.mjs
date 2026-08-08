import fs from 'fs';

async function run() {
  const desc = 'Elegant royal purple ceremonial outfit with a sweeping dramatic floor-length cape';
  const color = 'royal purple';
  const img = 'robe_cape_gown_1785969860343.jpg';
  const prompt = `Hand-painted 2D animated dark-fantasy illustration of a ${color} Cape & Gown Ensemble. ${desc}. Displayed beautifully on a dress form mannequin. Lush painterly rendering, expressive stylized design, gothic dark-fantasy video-game aesthetic, moody atmospheric lighting with dramatic shadows. Plain neutral gray background. No velvet texture anywhere; prefer flowing silk, brocade, or heavy wool-like fabrics instead. Soft glowing aura.`;
  
  const response = await fetch('http://127.0.0.1:54321/functions/v1/generate-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    console.error('Failed to generate cape_gown: Status ' + response.status + '. Body: ' + await response.text());
    return;
  }

  const { imageUrl } = await response.json();
  const fileRes = await fetch(imageUrl);
  const buffer = await fileRes.arrayBuffer();
  fs.writeFileSync('public/assets/' + img, Buffer.from(buffer));
  console.log('Saved public/assets/' + img + ' (' + buffer.byteLength + ' bytes)');
}
run();
