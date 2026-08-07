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
  
  const clickCommune = async () => {
    return page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.btn'));
      const communeBtn = btns.find(b => b.textContent.includes('Commune'));
      if (communeBtn) {
        communeBtn.click();
        return true;
      }
      return false;
    });
  };

  const clickClose = async () => {
    return page.evaluate(() => {
      const closeBtn = document.querySelector('.modal .spk');
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
      return false;
    });
  };

  const isModalOpen = async () => {
    return page.evaluate(() => !!document.querySelector('.modal'));
  };

  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- Iteration ${i} ---`);
    console.log('Clicking Commune...');
    await clickCommune();
    
    console.log('Waiting 50ms...');
    await new Promise(r => setTimeout(r, 50));
    
    console.log('Is Modal Open?', await isModalOpen());
    
    console.log('Clicking Close...');
    await clickClose();
    
    console.log('Waiting 50ms...');
    await new Promise(r => setTimeout(r, 50));
    
    console.log('Is Modal Open after close?', await isModalOpen());
  }

  // Wait 1 second and check state again
  await new Promise(r => setTimeout(r, 1000));
  console.log('\n--- Final State after 1s ---');
  console.log('Is Modal Open?', await isModalOpen());

  await browser.close();
})();
