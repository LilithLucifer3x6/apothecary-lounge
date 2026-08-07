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

  console.log('Testing rapid click-close cycling...');
  
  for (let i = 0; i < 20; i++) {
    await clickCommune();
    await clickClose();
  }

  // Check if we can still open it
  await clickCommune();
  const isOpen = await page.evaluate(() => !!document.querySelector('.modal'));
  console.log('Is Modal Open after 20 rapid cycles?', isOpen);
  
  await browser.close();
})();
