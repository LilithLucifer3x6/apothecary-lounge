const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('avatar_config', '{"name":"Tester"}');
    window.localStorage.setItem('intake_completed', 'true');
    window.sessionStorage.setItem('al_currentScreen', 'avatar');
  });

  await page.setViewport({ width: 1200, height: 900 });
  
  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'C:/Users/purpl/.gemini/antigravity/brain/0c01db80-c57e-4d3d-a041-67ad5aece128/conjure_visage_before.png', fullPage: true });
  
  console.log('Done.');
  await browser.close();
})();
