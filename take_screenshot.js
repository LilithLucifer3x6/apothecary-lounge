import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 800 });
    
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
    
    // Evaluate in page to set current_screen explicitly!
    await page.evaluate(() => {
      // Just bypass the entire Conjure Visage and Landing by faking the state or local storage
      localStorage.setItem('avatar_config', JSON.stringify({ name: 'Puppeteer', avatarVibe: 'witch' }));
      localStorage.setItem('intake_completed', 'true');
    });
    
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Check if we are on landing
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enterBtn = btns.find(b => b.textContent.includes('Enter the Sanctuary'));
      if (enterBtn) enterBtn.click();
    });
    
    try {
      await page.waitForSelector('.tabs', { timeout: 3000 });
    } catch(e) {
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.textContent.includes('Bind the Runes'));
        if (nextBtn) nextBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const enterBtn = btns.find(b => b.textContent.includes('Enter the Sanctuary'));
        if (enterBtn) enterBtn.click();
      });
      await page.waitForSelector('.tabs', { timeout: 3000 }).catch(()=>{});
    }
    
    await page.screenshot({ path: 'C:/Users/purpl/.gemini/antigravity/brain/0c01db80-c57e-4d3d-a041-67ad5aece128/.tempmediaStorage/nav_screenshot.png', clip: {x: 0, y: 0, width: 400, height: 150} });
    
    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
