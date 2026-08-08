// Direct edge function test — bypasses the browser entirely.
// Calls the anthropic-proxy with a real conversation history payload
// to confirm the edge function responds correctly to multi-turn messages.
require('dotenv').config({ path: '../.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const EDGE_URL = `${SUPABASE_URL}/functions/v1/anthropic-proxy`;

async function callProxy(payload, label) {
  console.log(`\n[${label}] Calling edge function...`);
  const start = Date.now();
  try {
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000) // 60s timeout
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  Status: ${res.status} (${elapsed}s)`);
    if (!res.ok) {
      const errText = await res.text();
      console.log(`  Error body: ${errText}`);
      return null;
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (text) {
      console.log(`  Response: "${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`); 
    } else {
      console.log('  RAW RESPONSE:', JSON.stringify(data, null, 2).substring(0, 800));
    }
    return text || null;
  } catch (e) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`  FAILED after ${elapsed}s: ${e.message}`);
    return null;
  }
}

(async () => {
  const systemPrompt = `You are the Keeper of the Sanctuary, leading "The Reading", a monthly reflection on the user's wellness rituals.
Goal: Have a short conversation to check if they are experiencing any new skin concerns, lifestyle changes, or if any products are causing irritation.
Ask one question at a time. Be empathetic, poetic, and concise (1-2 sentences).
If you have gathered enough information (after 2-3 exchanges), conclude the reading by ending your final response with exactly: "[READING_COMPLETE: <summary or 'No changes'>]".`;

  // Test 1: Opening message (same as handleStartReading)
  const opening = await callProxy({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: 'I am ready for the reading.' }]
  }, 'Turn 0 — Opening');

  if (opening === null) { console.log('\nFAIL: Opening did not respond.'); return; }

  // Test 2: Reply turn (same as handleSendReading with history)
  const reply1 = await callProxy({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { role: 'user', content: 'I am ready for the reading.' },
      { role: 'assistant', content: opening },
      { role: 'user', content: 'My skin has been feeling dry around my cheeks and I had a few breakouts on my chin this past month.' }
    ]
  }, 'Turn 1 — User reply');

  if (reply1 === null) { console.log('\nFAIL: Turn 1 did not respond.'); return; }

  // Test 3: Second reply turn
  const reply2 = await callProxy({
    model: 'claude-sonnet-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { role: 'user', content: 'I am ready for the reading.' },
      { role: 'assistant', content: opening },
      { role: 'user', content: 'My skin has been feeling dry around my cheeks and I had a few breakouts on my chin this past month.' },
      { role: 'assistant', content: reply1 },
      { role: 'user', content: 'I started using a new gel cleanser about three weeks ago. Otherwise my routine has been the same.' }
    ]
  }, 'Turn 2 — Second reply');

  if (reply2 === null) { console.log('\nFAIL: Turn 2 did not respond.'); return; }

  console.log('\n✅ EDGE FUNCTION: All 3 turns responded successfully end-to-end.');
})();
