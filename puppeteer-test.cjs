const puppeteer = require('puppeteer-core');
const chromeLauncher = require('chrome-launcher');
const { spawn } = require('child_process');

async function run() {
  const devServer = spawn('npm', ['run', 'dev'], { shell: true });
  
  await new Promise(r => setTimeout(r, 4000)); // wait for dev server

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => console.log('FAILED REQUEST:', request.url(), request.failure().errorText));
  page.on('response', async res => {
    if (res.url().includes('anthropic-proxy')) {
      console.log('PROXY RESPONSE STATUS:', res.status());
      try {
        console.log('PROXY RESPONSE BODY:', await res.text());
      } catch(e) {}
    }
  });

  await page.goto('http://localhost:5173');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Injecting AI test...');
  await page.evaluate(async () => {
    const aiEngine = await import('/src/lib/ai-engine.js');
    console.log('Imported ai-engine');
    try {
      const res = await aiEngine.invokeAnthropicProxy({
        max_tokens: 300,
        system: 'Test',
        messages: [{ role: 'user', content: 'hello' }]
      });
      console.log('INVOKE SUCCESS:', JSON.stringify(res));
    } catch (e) {
      console.log('INVOKE ERROR:', e.message);
    }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  browser.disconnect();
  chrome.kill();
  devServer.kill();
  process.exit(0);
}
run();
