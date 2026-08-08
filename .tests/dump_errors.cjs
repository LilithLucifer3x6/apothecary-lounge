const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('Browser Error:', msg.text());
    else console.log('Browser Log:', msg.text());
  });

  await page.goto('https://shadowsanctuary.vercel.app');
  
  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({name: 'Test'}));
    sessionStorage.setItem('al_currentScreen', 'app');
    sessionStorage.setItem('al_activeTab', 'grim');
  });
  await page.reload();
  
  await page.waitForTimeout(3000);
  
  await page.click('text=Commune');
  
  await page.waitForTimeout(15000);
  
  await browser.close();
})().catch(console.error);
