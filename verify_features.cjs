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

  console.log('Navigating to app...');
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

  // --- Test 1: Composite Items ---
  console.log('\n--- Test 1: The Altars Composite Items ---');
  await clickTab('Altars');
  await page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('.step .nm'));
    const cleanser = steps.find(s => s.textContent.includes('Cleanser'));
    if (cleanser) cleanser.closest('.step').querySelector('input[type="checkbox"]').click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const opts = Array.from(document.querySelectorAll('.act'));
    const ocm = opts.find(o => o.textContent.includes('OCM'));
    if (ocm) ocm.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  await clickTab('Scrying');
  const scryingHtml = await page.evaluate(() => document.body.innerHTML);
  if (scryingHtml.includes('OCM')) {
    console.log('SUCCESS: Composite Item (OCM) found in Scrying Pool.');
  } else {
    console.log('FAILED: Composite Item not found in Scrying Pool.');
  }

  // --- Test 2: The Echo ---
  console.log('\n--- Test 2: The Echo ---');
  await clickTab('The Echo');
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="Paste an ingredient list..."]');
    if (input) {
      input.value = 'Water, Glycerin, Niacinamide, Salicylic Acid';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btn = Array.from(document.querySelectorAll('.btn')).find(b => b.textContent.includes('Analyze'));
    if (btn) btn.click();
  });
  // Wait up to 15s for the echo result
  let echoResult = '';
  for (let i=0; i<15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    echoResult = await page.evaluate(() => document.querySelector('.rx')?.textContent || '');
    if (echoResult) break;
  }
  if (echoResult) {
    console.log('SUCCESS: The Echo returned a result:', echoResult.substring(0, 50) + '...');
  } else {
    console.log('FAILED: The Echo returned no result.');
  }

  // --- Test 3: Isotretinoin ---
  console.log('\n--- Test 3: Isotretinoin Buttons ---');
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
  if (res.rows.length > 0) {
    console.log('SUCCESS: Isotretinoin log inserted:', res.rows[0]);
  } else {
    console.log('FAILED: No isotretinoin log found.');
  }
  await pool.end();

  // --- Test 4: The Reading ---
  console.log('\n--- Test 4: The Reading ---');
  await clickTab('Grimoire');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.btn'));
    const communeBtn = btns.find(b => b.textContent.includes('Commune'));
    if (communeBtn) communeBtn.click();
  });
  
  // Wait for first response
  for (let i=0; i<20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const isTyping = await page.evaluate(() => document.body.innerHTML.includes('Keeper is typing'));
    if (!isTyping) break;
  }
  await new Promise(r => setTimeout(r, 1000));
  
  // reply 1
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.value = 'I have been very stressed.';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('.btn'));
    const replyBtn = btns.find(b => b.textContent.includes('Reply'));
    if (replyBtn) replyBtn.click();
  });
  
  // wait for second response
  await new Promise(r => setTimeout(r, 1000));
  for (let i=0; i<20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const isTyping = await page.evaluate(() => document.body.innerHTML.includes('Keeper is typing'));
    if (!isTyping) break;
  }
  await new Promise(r => setTimeout(r, 1000));

  // reply 2
  await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]');
    if (input) {
      input.value = 'My skin is breaking out.';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const btns = Array.from(document.querySelectorAll('.btn'));
    const replyBtn = btns.find(b => b.textContent.includes('Reply'));
    if (replyBtn) replyBtn.click();
  });
  
  // wait for final response
  await new Promise(r => setTimeout(r, 1000));
  for (let i=0; i<20; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const isTyping = await page.evaluate(() => document.body.innerHTML.includes('Keeper is typing'));
    if (!isTyping) break;
  }
  await new Promise(r => setTimeout(r, 1000));

  const readingState = await page.evaluate(() => {
    const texts = Array.from(document.querySelectorAll('.step .body')).map(el => el.textContent);
    return texts.join(' | ');
  });
  console.log('Reading History:', readingState);
  if (readingState.includes('stressed') || readingState.includes('breaking out')) {
    console.log('SUCCESS: Multiple exchanges completed in The Reading.');
  } else {
    console.log('FAILED: The Reading failed to complete multiple exchanges.');
  }

  await browser.close();
})();
