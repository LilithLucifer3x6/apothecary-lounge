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
  
  console.log('Clicking Enter the Sanctuary...');
  await page.evaluate(() => {
    const enterBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Enter the Sanctuary'));
    if (enterBtn) enterBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Navigating to Grimoire tab...');
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('.tb'));
    const grimoireTab = tabs.find(t => t.textContent.includes('Grimoire'));
    if (grimoireTab) grimoireTab.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));

  const buttonBox = await page.evaluate(() => {
    const communeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Commune'));
    if (!communeBtn) return null;
    communeBtn.scrollIntoView({ behavior: 'instant', block: 'start' });
    const rect = communeBtn.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  console.log(`Clicking at X:${buttonBox.x} Y:${buttonBox.y}`);
  
  const clickState = await page.evaluate((bx, by) => {
    const el = document.elementFromPoint(bx, by);
    return {
      elementAtPoint: el ? el.tagName + (el.className ? '.' + el.className : '') : null,
      topbarRect: document.querySelector('.topbar') ? document.querySelector('.topbar').getBoundingClientRect() : null
    };
  }, buttonBox.x, buttonBox.y);
  
  console.log('Intercept State:', JSON.stringify(clickState, null, 2));
  process.exit(0);

  await new Promise(r => setTimeout(r, 2000));
  const modalInfo = await page.evaluate(() => {
    const modal = document.querySelector('.modal');
    return modal ? modal.outerHTML.substring(0, 500) : 'No modal found';
  });
  console.log('Modal HTML:', modalInfo);
  browser.disconnect();
  chrome.kill();
  devServer.kill();
  process.exit(0);
}
run();
