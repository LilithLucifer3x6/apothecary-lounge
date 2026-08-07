const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));

  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('avatar_config', '{"name":"Tester"}');
    window.localStorage.setItem('intake_completed', 'true');
    window.sessionStorage.setItem('al_currentScreen', 'app');
    window.sessionStorage.setItem('al_activeTab', 'grim');
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  await page.waitForSelector('.nm', { timeout: 10000 });
  
  console.log('Clicking Commune...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn'));
    const communeBtn = btns.find(b => b.textContent.includes('Commune'));
    if (communeBtn) communeBtn.click();
  });

  // Wait 25 seconds to see if the timeout fires
  console.log('Waiting 25 seconds for logs...');
  await new Promise(r => setTimeout(r, 25000));
  
  console.log('Done.');
  await browser.close();
})();
