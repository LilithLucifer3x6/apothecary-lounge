import fs from 'fs';

async function run() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const token = envContent.match(/REPLICATE_API_TOKEN=(.*)/)[1].trim();

  const robe = { id: 'flowing_ceremonial', label: 'Flowing Ceremonial Robe', desc: 'Full-length flowing robe with wide sleeves and embroidered magical trim', img: 'test_robe_flowing.jpg', color: 'deep emerald green' };
  
  const prompt = `Hand-painted 2D animated dark-fantasy illustration of a full-figured Black woman with microlocs wearing a ${robe.color} ${robe.label}. ${robe.desc}. Lush painterly rendering, expressive stylized design, gothic dark-fantasy video-game aesthetic, moody atmospheric lighting with dramatic shadows. Plain neutral gray background. No velvet texture anywhere; prefer flowing silk, brocade, or heavy wool-like fabrics instead. Soft glowing aura.`;

  console.log(`Generating test image...`);

  // Start prediction
  let res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: '0a1710e0187b01a255302738ca0158ff02a22f4638679533e111082f9dd1b615',
      input: { prompt, negative_prompt: 'ugly, deformed, noisy, blurry, bad anatomy, bad hands, extra fingers, missing fingers, poorly drawn face, mutation, mutated, messy, floating limbs, disconnected limbs', width: 768, height: 1024, num_inference_steps: 7, guidance_scale: 2 }
    })
  });

  if (!res.ok) {
    console.error(`Failed to start: ${res.status} ${await res.text()}`);
    return;
  }

  let prediction = await res.json();
  const getUrl = prediction.urls.get;

  while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
    console.log('Status: ' + prediction.status); await new Promise(r => setTimeout(r, 2000));
    res = await fetch(getUrl, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    prediction = await res.json();
  }

  if (prediction.status === 'failed') {
    console.error('Prediction failed', prediction.error);
    return;
  }

  console.log(`Downloading ${prediction.output[0]}...`);
  const imgRes = await fetch(prediction.output[0]);
  const buffer = await imgRes.arrayBuffer();
  fs.writeFileSync('public/assets/' + robe.img, Buffer.from(buffer));
  console.log(`Saved public/assets/${robe.img} (${buffer.byteLength} bytes)`);
}
run();


