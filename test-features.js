import { conductIntake, evaluateScryingPool } from './src/lib/ai-engine.js';
import { converseReading } from './src/lib/ai-service.js';

async function testAll() {
  try {
    console.log('Testing Intake...');
    const inRes = await conductIntake([{ role: 'user', content: 'hello' }]);
    console.log('INTAKE SUCCESS:', inRes);
  } catch(e) {
    console.error('INTAKE ERROR:', e);
  }

  try {
    console.log('Testing Reading...');
    const readRes = await converseReading([{ role: 'user', content: 'hello' }], {});
    console.log('READING SUCCESS:', readRes);
  } catch(e) {
    console.error('READING ERROR:', e);
  }

  try {
    console.log('Testing Echo Analyzer...');
    const echoRes = await evaluateScryingPool('cerave cleanser', {}, []);
    console.log('ECHO SUCCESS:', echoRes);
  } catch(e) {
    console.error('ECHO ERROR:', e);
  }
}

testAll();
