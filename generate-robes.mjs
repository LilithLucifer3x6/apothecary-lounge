import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

const ROBE_DESIGNS = [{ id: 'cape_gown', label: 'Cape & Gown Ensemble', desc: 'Elegant royal purple ceremonial outfit with a sweeping dramatic floor-length cape', img: 'robe_cape_gown_1785969860343.jpg', color: 'royal purple' }];

async function generateRobe(robe) {
  const prompt = `Hand-painted 2D animated dark-fantasy illustration of a ${robe.color} ${robe.label}. ${robe.desc}. Displayed beautifully on a dress form mannequin. Lush painterly rendering, expressive stylized design, gothic dark-fantasy video-game aesthetic, moody atmospheric lighting with dramatic shadows. Plain neutral gray background. No velvet texture anywhere; prefer flowing silk, brocade, or heavy wool-like fabrics instead. Soft glowing aura.`;

  console.log(`Generating ${robe.id}...`);
  
  const response = await fetch(`${urlMatch[1].trim()}/functions/v1/image-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keyMatch[1].trim()}`
    },
    body: JSON.stringify({
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: { prompt, width: 768, height: 1024 }
    })
  });
  
  const text = await response.text();
  
  if (!response.ok) {
    console.error(`Failed to generate ${robe.id}: Status ${response.status}. Body: ${text}`);
    return;
  }
  
  const data = JSON.parse(text);
  if (!data || !data.output || !data.output[0]) {
    console.error(`Failed to generate ${robe.id}: Bad JSON output: ${text}`);
    return;
  }

  const imageUrl = data.output[0];
  console.log(`Downloading ${imageUrl}...`);
  
  const imgRes = await fetch(imageUrl);
  const arrayBuffer = await imgRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const targetPath = path.join('public', 'assets', robe.img);
  fs.writeFileSync(targetPath, buffer);
  console.log(`Saved ${targetPath} (${buffer.length} bytes)`);
}

async function run() {
  for (const robe of ROBE_DESIGNS) {
    try {
      // wait 2 seconds between requests to avoid rate limits
      await new Promise(r => setTimeout(r, 11000));
      await generateRobe(robe);
    } catch (e) {
      console.error(`Exception generating ${robe.id}:`, e);
    }
  }
}

run();

