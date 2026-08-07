const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const { spawn } = require('child_process');

async function run() {
  const devServer = spawn('npm', ['run', 'dev'], { shell: true });
  await new Promise(r => setTimeout(r, 4000));

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const browser = await puppeteer.connect({ browserURL: `http://localhost:${chrome.port}` });
  const page = await browser.newPage();
  
  // Navigate and skip intake
  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  // Seed the DB
  await page.evaluate(async () => {
    // Dynamic import to use Vite's built-in resolution in the browser context
    const { supabase } = await import('/src/lib/supabase.js');
    await supabase.from('user_profile').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_profile').insert([{
      intake_completed: true,
      intake_answers: { oralList: ['Isotretinoin'] },
      avatar_config: { skin: '#e2b9a3', hair: 'short', eyes: '#7b5c46', garment: 'black', familiar: 'cat' }
    }]);
    
    // Seed an item for the scroll
    await supabase.from('items').insert([{
      name: 'Test Serum',
      brand: 'Test Brand',
      status: 'active',
      category: 'serum',
      am_pm: 'both',
      target_zone: 'face'
    }]);
  });
  
  await page.reload();
  await new Promise(r => setTimeout(r, 2000));
  
  // Test 1: Isotretinoin Took/Missed buttons
  console.log("--- 1. Isotretinoin Logic ---");
  await page.evaluate(() => {
    const ritesTab = Array.from(document.querySelectorAll('.tb')).find(t => t.textContent.includes('Rites'));
    if (ritesTab) ritesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  const isoState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card'));
    const morningRite = cards.find(c => c.textContent.includes('The Morning Rite'));
    if (!morningRite) return { error: 'Morning Rite not found' };
    
    const isoSection = Array.from(morningRite.querySelectorAll('.row')).find(r => r.textContent.includes('Isotretinoin'));
    if (!isoSection) return { status: 'Isotretinoin not rendered in Morning Rite' };
    
    return {
      text: isoSection.textContent,
      buttons: Array.from(isoSection.querySelectorAll('button')).map(b => b.textContent)
    };
  });
  console.log('Isotretinoin State:', JSON.stringify(isoState, null, 2));

  // Test 2: The Echo Analyzer
  console.log("--- 2. The Echo Analyzer ---");
  await page.evaluate(() => {
    const altarsTab = Array.from(document.querySelectorAll('.tb')).find(t => t.textContent.includes('Altars'));
    if (altarsTab) altarsTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  const echoState = await page.evaluate(() => {
    const analyzer = Array.from(document.querySelectorAll('.card')).find(c => c.textContent.includes('The Echo'));
    if (!analyzer) return { error: 'Echo analyzer not found' };
    
    const input = analyzer.querySelector('textarea');
    return {
      found: true,
      hasInput: !!input,
      buttons: Array.from(analyzer.querySelectorAll('button')).map(b => b.textContent)
    };
  });
  console.log('Echo Analyzer State:', JSON.stringify(echoState, null, 2));

  // Test 3: Scroll Population
  console.log("--- 3. Scroll Population ---");
  await page.evaluate(() => {
    const poolTab = Array.from(document.querySelectorAll('.tb')).find(t => t.textContent.includes('Pool'));
    if (poolTab) poolTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  const scrollState = await page.evaluate(() => {
    const scrolls = Array.from(document.querySelectorAll('.card')).filter(c => c.textContent.includes('Scroll'));
    return scrolls.map(s => {
      const title = s.querySelector('h3') ? s.querySelector('h3').textContent.trim() : 'Unknown';
      const items = Array.from(s.querySelectorAll('.row')).map(r => r.textContent.trim());
      return { title, itemCount: items.length };
    });
  });
  console.log('Scroll State:', JSON.stringify(scrollState, null, 2));

  await browser.close();
  await chrome.kill();
  devServer.kill();
}
run().catch(console.error);
