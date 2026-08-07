import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://gwezojwujynharoqjuio.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXpvand1anluaGFyb3FqdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUwNzgsImV4cCI6MjEwMTIyMTA3OH0.BPF1s-QjY0EF8xE6lumPDXxbZbg7XgPg1csVfPTNWdQ');

async function test() {
  console.log('Invoking function...');
  const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
    body: { model: 'claude-sonnet-5', max_tokens: 300, system: 'Test', messages: [{ role: 'user', content: 'hello' }] }
  });
  console.log('DATA:', data);
  console.log('ERROR:', error);
}
test();
