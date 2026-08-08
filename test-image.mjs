import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://gwezojwujynharoqjuio.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXpvand1anluaGFyb3FqdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NDUwNzgsImV4cCI6MjEwMTIyMTA3OH0.BPF1s-QjY0EF8xE6lumPDXxbZbg7XgPg1csVfPTNWdQ');

async function run() {
  const { data, error } = await supabase.functions.invoke('image-proxy', {
    body: {
      version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      input: { prompt: 'test', width: 1024, height: 1024 }
    }
  });
  if (error) {
    if (error.context) {
      const errText = await error.context.text();
      console.error('Edge function body:', errText);
    } else {
      console.error('Error invoking function:', error);
    }
  } else {
    console.log('Success:', JSON.stringify(data));
  }
}
run();
