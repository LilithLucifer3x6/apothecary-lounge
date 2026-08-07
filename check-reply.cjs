const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
  page.on('requestfailed', req => console.log('BROWSER_NET_FAIL:', req.url(), req.failure().errorText));

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

  // Wait for the modal and the first AI response to finish typing
  // The first response might take a few seconds
  await new Promise(r => setTimeout(r, 6000));
  
  console.log('Typing reply...');
  // The input field is in the modal
  await page.evaluate(() => {
    const input = document.querySelector('.modal input[type="text"]');
    if (input) {
      input.value = 'I am feeling great today.';
      // Trigger React's onChange
      const tracker = input._valueTracker;
      if (tracker) tracker.setValue('');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  console.log('Clicking Reply...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.modal .btn'));
    const replyBtn = btns.find(b => b.textContent.includes('Reply'));
    if (replyBtn) {
        replyBtn.click();
    } else {
        console.log('BROWSER_CONSOLE: Reply button not found');
    }
  });

  // Wait a moment to capture the error in the console
  await new Promise(r => setTimeout(r, 3000));
  
  console.log('Done.');
  await browser.close();
})();
