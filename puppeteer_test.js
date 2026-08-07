import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching Puppeteer...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    console.log("Navigating to http://localhost:5176/ ...");
    await page.goto('http://localhost:5176/', { waitUntil: 'networkidle2' });
    
    const title = await page.title();
    console.log("Successfully connected! App title:", title);

    await browser.close();
  } catch (error) {
    console.error("Puppeteer test failed:", error);
  }
})();
