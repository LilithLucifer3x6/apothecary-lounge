const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to app...');
  await page.goto('https://shadowsanctuary.vercel.app');

  await page.evaluate(() => {
    localStorage.setItem('intake_completed', 'true');
    localStorage.setItem('avatar_config', JSON.stringify({ name: 'Test' }));
    sessionStorage.setItem('al_currentScreen', 'app');
    sessionStorage.setItem('al_activeTab', 'root');
  });

  await page.route('**/rest/v1/items*', async route => {
    const json = [
      {
        id: 'item-expired',
        name: 'Expired Serum',
        item_type: 'consumable',
        category: 'Tincture',
        quantity: 'full',
        lifecycle_state: 'stocked',
        opened_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString(),
        period_after_opening_months: 6,
        is_empty: false
      },
      {
        id: 'item-waning',
        name: 'Empty Cleanser',
        item_type: 'consumable',
        category: 'Purifier',
        quantity: 'empty',
        lifecycle_state: 'hollow',
        opened_date: new Date().toISOString(),
        period_after_opening_months: 12,
        is_empty: true,
        is_essential: true
      },
      {
        id: 'item-ebbing',
        name: 'Almost Empty Cream',
        item_type: 'consumable',
        category: 'Purifier',
        quantity: 'low',
        lifecycle_state: 'ebbing',
        opened_date: new Date().toISOString(),
        period_after_opening_months: 12,
        is_empty: false
      },
      {
        id: 'item-active',
        name: 'Fresh Moisturizer',
        item_type: 'consumable',
        category: 'Veil',
        quantity: 'full',
        lifecycle_state: 'stocked',
        opened_date: new Date().toISOString(),
        period_after_opening_months: 12,
        is_empty: false
      }
    ];
    await route.fulfill({ json });
  });

  await page.route('**/rest/v1/user_profile*', async route => {
    await route.fulfill({ json: [{ id: 'test-user', settings: {} }] });
  });
  
  await page.route('**/rest/v1/restock_list*', async route => {
    await route.fulfill({ json: [
        { id: 'restock-1', name: 'Magic Potion', is_purchased: false, needs_research: false, status: 'pending' },
        { id: 'restock-2', name: 'Holy Water', is_purchased: false, needs_research: true, status: 'pending' }
    ] });
  });

  await page.reload();
  await page.waitForTimeout(3000);

  const html = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card'));
    let result = '';
    for (const card of cards) {
      const h3 = card.querySelector('h3');
      if (h3) {
        result += '\n--- ' + h3.innerText + ' ---\n';
        const rows = Array.from(card.querySelectorAll('.row'));
        if (rows.length === 0) {
            result += '(no rows, possibly ' + (card.querySelector('.empty')?.innerText || 'empty') + ')\n';
        } else {
            for (const row of rows) {
                const nm = row.querySelector('.nm')?.innerText || 'Unknown Item';
                const pill = row.querySelector('.pill')?.innerText || '';
                result += `- ${nm} ${pill ? '[' + pill + ']' : ''}\n`;
            }
        }
      }
    }
    return result;
  });

  console.log('Rootwork contents:');
  console.log(html);

  await browser.close();
})().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
