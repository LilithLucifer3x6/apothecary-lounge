const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://shadowsanctuary.vercel.app');
  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({name: 'Test'}));
  });
  await page.reload();
  
  await page.waitForTimeout(3000);
  const enterBtn = await page.$('text=Enter the Sanctuary');
  if (enterBtn) {
     await enterBtn.click();
  }
  
  await page.waitForTimeout(3000);
  const html = await page.content();
  require('fs').writeFileSync('dom2.html', html);
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
