const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');

  // Inject session state to bypass intake and start at Grimoire
  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({ name: 'Test' }));
    sessionStorage.setItem('al_currentScreen', 'app');
    sessionStorage.setItem('al_activeTab', 'grim');
  });

  // Mock initial history for Commune
  await page.route('**/rest/v1/user_profile*', async route => {
    await route.fulfill({
      json: [{ id: 'test-user', settings: {} }]
    });
  });

  await page.reload();

  console.log('Waiting for Grimoire to load...');
  await page.waitForTimeout(4000);

  console.log('Clicking Commune...');
  // Use a more robust selector in case text="Commune" is finicky
  await page.click('button:has-text("Commune")');

  console.log('Waiting for opening question (up to 130s)...');
  await page.waitForSelector('.msg-bot', { timeout: 130000 });
  await page.waitForTimeout(2000); // Let UI settle and any typing animation finish

  let botMessages = await page.$$eval('.msg-bot', msgs => msgs.map(m => m.innerText));
  console.log('=== ASSISTANT OPENING ===\n' + botMessages[0] + '\n');

  const userReplies = [
    "My skin has been feeling dry around my cheeks and I had a few breakouts on my chin this past month.",
    "I started using a new gel cleanser about three weeks ago. Otherwise my routine has been the same.",
    "It leaves it feeling a bit tight and stripped, yes.",
    "Okay, I will stop using it. I have nothing else to report.",
    "Yes, thank you."
  ];

  const fillReact = async (selector, value) => {
    await page.fill(selector, value);
  };

  for (let turn = 1; turn <= 5; turn++) {
    const userMsg = userReplies[turn - 1];
    console.log(`\nFilling reply ${turn}...`);
    await page.fill('textarea[placeholder="Speak your truth..."]', userMsg);
    await page.click('button:has-text("Reply")');
    
    console.log(`Waiting for reply ${turn} (up to 120s)...`);
    
    // Wait for the new message to appear
    const initialMsgCount = botMessages.length;
    let newMsgAppeared = false;
    for (let wait = 0; wait < 120; wait++) {
      await page.waitForTimeout(1000);
      botMessages = await page.$$eval('.msg-bot', msgs => msgs.map(m => m.innerText));
      if (botMessages.length > initialMsgCount) {
        newMsgAppeared = true;
        break;
      }
    }

    if (!newMsgAppeared) {
      console.log(`TIMEOUT waiting for reply ${turn}.`);
      break;
    }

    const latestBotMessage = botMessages[botMessages.length - 1];
    console.log(`=== ASSISTANT REPLY ${turn} ===\n${latestBotMessage}\n`);
    
    if (latestBotMessage.includes('[READING_COMPLETE')) {
      console.log('✅ COMMUNE FLOW: PASS — Reached READING_COMPLETE successfully.');
      break;
    }
  }

  await browser.close();
})().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
