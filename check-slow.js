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

  console.log('Testing slow click-close cycling...');
  
  for (let i = 0; i < 3; i++) {
    console.log('Clicking Commune...');
    await clickCommune();
    
    // Wait for AI to finish
    await new Promise(r => setTimeout(r, 4000));
    
    const isOpen = await page.evaluate(() => !!document.querySelector('.modal'));
    console.log('Is Modal Open?', isOpen);
    
    console.log('Clicking Close...');
    await clickClose();
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500));
  }

  // Check if we can still open it
  await clickCommune();
  const isOpenAfter = await page.evaluate(() => !!document.querySelector('.modal'));
  console.log('Is Modal Open after slow cycles?', isOpenAfter);
  
  await browser.close();
})();
