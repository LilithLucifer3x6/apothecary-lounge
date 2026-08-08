const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async response => {
    if (response.url().includes('anthropic-proxy') && response.status() === 400) {
      console.log('Anthropic Proxy 400 Response Body:', await response.text());
    }
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
  
  await page.waitForTimeout(10000);
  
  await browser.close();
})().catch(console.error);
