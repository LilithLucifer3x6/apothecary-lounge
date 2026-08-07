import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://gwezojwujynharoqjuio.supabase.co', 'dummy_key');

(async () => {
  console.log('Testing signal support in invoke...');
  const controller = new AbortController();
  
  // Abort immediately
  controller.abort();
  
  try {
    const start = Date.now();
    const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
      body: { test: true },
      signal: controller.signal
    });
    console.log('Finished in', Date.now() - start, 'ms');
    console.log('Data:', data, 'Error:', error);
  } catch (err) {
    console.log('CAUGHT EXCEPTION:', err);
  }
})();
