const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.evaluateOnNewDocument(() => {
    window.localStorage.setItem('avatar_config', '{"name":"Tester"}');
    window.localStorage.setItem('intake_completed', 'true');
    window.sessionStorage.setItem('al_currentScreen', 'app');
  });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('.nm', { timeout: 10000 });
  
  async function clickTab(name) {
    await page.evaluate((tabName) => {
      const tabs = Array.from(document.querySelectorAll('.tb'));
      const tab = tabs.find(t => t.textContent.includes(tabName));
      if (tab) tab.click();
    }, name);
    await new Promise(r => setTimeout(r, 800));
  }
  
  try {
      console.log('Test 1: Composite Items');
      await clickTab('Altars');
      // Look for the "Cleanser" label
      await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll('.nm'));
        const cl = labels.find(l => l.textContent.includes('Cleanser'));
        if (cl) cl.parentElement.parentElement.querySelector('input[type="checkbox"]').click();
      });
      await new Promise(r => setTimeout(r, 1000));
      // Click OCM in the modal
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.act'));
        const ocm = btns.find(b => b.textContent.includes('OCM'));
        if (ocm) ocm.click();
      });
      await new Promise(r => setTimeout(r, 1000));
      await clickTab('Scrying');
      const scrying = await page.evaluate(() => document.body.innerText);
      if (scrying.includes('OCM')) console.log('-> SUCCESS: OCM found in Scrying Pool');
      else console.log('-> FAILED: OCM not found');

      console.log('Test 2: The Echo');
      await clickTab('Rootwork');
      await page.evaluate(() => {
        const input = document.querySelector('textarea[placeholder="Paste an ingredient list..."]');
        if (input) {
            input.value = 'Water, Glycerin';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            const btns = Array.from(document.querySelectorAll('.btn'));
            const analyze = btns.find(b => b.textContent.includes('Analyze'));
            if (analyze) analyze.click();
        }
      });
      let echoFound = false;
      for (let i=0; i<15; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const res = await page.evaluate(() => document.querySelector('.rx')?.innerText);
        if (res && res.includes('Glycerin')) { echoFound = true; break; }
      }
      if (echoFound) console.log('-> SUCCESS: The Echo analyzed ingredients');
      else console.log('-> FAILED: The Echo did not analyze');

      console.log('Test 3: Isotretinoin Log');
      await clickTab('Rites');
      await page.evaluate(() => {
        const acts = Array.from(document.querySelectorAll('.act'));
        const tookIt = acts.find(a => a.textContent.includes('Took It'));
        if (tookIt) tookIt.click();
      });
      await new Promise(r => setTimeout(r, 2000));
      const { Pool } = require('pg');
      const pool = new Pool({ connectionString: `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.gwezojwujynharoqjuio.supabase.co:5432/postgres` });
      const res = await pool.query("SELECT * FROM isotretinoin_log ORDER BY created_at DESC LIMIT 1");
      if (res.rows.length > 0) console.log('-> SUCCESS: Log inserted', res.rows[0]);
      else console.log('-> FAILED: No log found');
      await pool.end();

      console.log('Test 4: The Reading');
      await clickTab('Grimoire');
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.btn'));
        const cb = btns.find(b => b.textContent.includes('Commune'));
        if (cb) cb.click();
      });
      // Wait up to 10s for Keeper is typing to DISAPPEAR
      for(let i=0; i<10; i++){
          await new Promise(r => setTimeout(r, 1000));
          const t = await page.evaluate(() => document.body.innerText.includes('typing'));
          if (!t) break;
      }
      
      // Send Reply 1
      await page.evaluate(() => {
          const inp = document.querySelector('input[type="text"]');
          if (inp) {
              inp.value = 'I am stressed';
              inp.dispatchEvent(new Event('input', {bubbles: true}));
              const b = Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('Reply'));
              if(b) b.click();
          }
      });
      await new Promise(r => setTimeout(r, 1500));
      for(let i=0; i<10; i++){
        await new Promise(r => setTimeout(r, 1000));
        const t = await page.evaluate(() => document.body.innerText.includes('typing'));
        if (!t) break;
      }
      
      // Send Reply 2
      await page.evaluate(() => {
        const inp = document.querySelector('input[type="text"]');
        if (inp) {
            inp.value = 'breaking out';
            inp.dispatchEvent(new Event('input', {bubbles: true}));
            const b = Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('Reply'));
            if(b) b.click();
        }
    });
    await new Promise(r => setTimeout(r, 1500));
    for(let i=0; i<10; i++){
      await new Promise(r => setTimeout(r, 1000));
      const t = await page.evaluate(() => document.body.innerText.includes('typing'));
      if (!t) break;
    }
    
    const text = await page.evaluate(() => document.body.innerText);
    if (text.includes('stressed') || text.includes('breaking out')) console.log('-> SUCCESS: Reading multiple exchanges completed');
    else console.log('-> FAILED: Reading did not complete properly');

  } catch (e) {
      console.log("Error during tests:", e);
  }

  await browser.close();
})();
