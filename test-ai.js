import { invokeAnthropicProxy } from './src/lib/ai-engine.js';
async function test() {
  try {
    console.log('Testing proxy...');
    const result = await invokeAnthropicProxy({
      max_tokens: 300,
      system: 'Test',
      messages: [{ role: 'user', content: 'hello' }]
    });
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
