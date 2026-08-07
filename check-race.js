import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('avatar_config', '{"name":"Tester"}');
    window.localStorage.setItem('intake_completed', 'true');
    window.sessionStorage.setItem('al_currentScreen', 'app');
    window.sessionStorage.setItem('al_activeTab', 'grim');
  });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('.nm', { timeout: 10000 });
  
  const clickCommune = async () => page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn'));
    const communeBtn = btns.find(b => b.textContent.includes('Commune'));
    if (communeBtn) { communeBtn.click(); return true; }
    return false;
  });

  const clickClose = async () => page.evaluate(() => {
    const closeBtn = document.querySelector('.modal .spk');
    if (closeBtn) { closeBtn.click(); return true; }
    return false;
  });

  console.log('Clicking Commune (A)...');
  await clickCommune();
  await new Promise(r => setTimeout(r, 100)); // AI request is pending
  
  console.log('Closing Modal (A)...');
  await clickClose();
  await new Promise(r => setTimeout(r, 100));
  
  console.log('Clicking Commune (B)...');
  await clickCommune(); // A is still pending, B is now pending!
  
  // Now we wait a few seconds so A and B both resolve.
  console.log('Waiting 5 seconds for AI requests to finish...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Closing Modal (B)...');
  await clickClose();
  await new Promise(r => setTimeout(r, 100));
  
  console.log('Clicking Commune (C)...');
  const clicked = await clickCommune();
  console.log('Was Commune clicked?', clicked);
  
  const isModalOpen = await page.evaluate(() => !!document.querySelector('.modal'));
  console.log('Is Modal Open?', isModalOpen);
  
  await browser.close();
})();
