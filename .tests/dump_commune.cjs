const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to app...');
  await page.goto('https://shadowsanctuary.vercel.app');
  
  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({name: 'Test'}));
    sessionStorage.setItem('al_currentScreen', 'app');
    sessionStorage.setItem('al_activeTab', 'grim');
  });
  await page.reload();
  
  await page.waitForTimeout(3000);
  
  console.log('Clicking Commune...');
  await page.click('text=Commune');
  
  console.log('Waiting 15 seconds for opening question...');
  await page.waitForTimeout(15000);
  
  const html = await page.content();
  require('fs').writeFileSync('dom_commune.html', html);
  await page.screenshot({ path: 'commune.png' });
  
  await browser.close();
})().catch(e => {
  console.error(e);
  process.exit(1);
});
