const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  await page.goto('https://shadowsanctuary.vercel.app', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await browser.close();
})();
