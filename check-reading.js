import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  // Intercept the request to anthropic-proxy and HANG it!
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().includes('anthropic-proxy')) {
      console.log('Intercepted anthropic-proxy request! Hanging it...');
      // Just don't respond!
    } else {
      req.continue();
    }
  });

  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('avatar_config', '{"name":"Tester"}');
    window.localStorage.setItem('intake_completed', 'true');
    window.sessionStorage.setItem('al_currentScreen', 'app');
    window.sessionStorage.setItem('al_activeTab', 'grim');
  });

  await page.goto('http://localhost:5173');
  
  console.log('Waiting for the Grimoire...');
  await page.waitForSelector('.nm', { timeout: 10000 });
  
  console.log('Clicking The Reading button (Commune)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn'));
    const communeBtn = btns.find(b => b.textContent.includes('Commune'));
    if (communeBtn) communeBtn.click();
  });
  
  console.log('Waiting 35 seconds to see if it recovers (timeout is 15s * 2)...');
  await new Promise(r => setTimeout(r, 35000));
  
  // Check the DOM state
  const state = await page.evaluate(() => {
    const isModalOpen = !!document.querySelector('.modal');
    const isTypingText = document.body.innerText.includes('The Keeper consults the stars');
    const hasFallbackText = document.body.innerText.includes('The stars are obscured');
    return { isModalOpen, isTypingText, hasFallbackText };
  });
  console.log('DOM State after 35s:', state);
  
  await browser.close();
})();
