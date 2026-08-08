const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://shadowsanctuary.vercel.app');
  
  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({name: 'Test'}));
  });
  
  console.log('Before reload avatar_config:', await page.evaluate(() => localStorage.getItem('avatar_config')));
  
  await page.reload();
  
  console.log('After reload avatar_config:', await page.evaluate(() => localStorage.getItem('avatar_config')));
  
  await browser.close();
})();
