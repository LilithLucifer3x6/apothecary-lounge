import { Capacitor } from '@capacitor/core';
import { Health } from '@capgo/capacitor-health';

/**
 * Health Connect Broker
 * Integrates Android Health Connect via Capacitor native plugins, falling back to mocks on Web.
 */

export async function requestHealthPermissions() {
  if (Capacitor.isNativePlatform()) {
    try {
      console.log('Requesting native Health Connect permissions...');
      await Health.requestAuthorization({
        read: ['sleepAnalysis', 'heartRate', 'activeEnergyBurned', 'workouts']
      });
      return true;
    } catch (e) {
      console.error('Failed to request health permissions:', e);
      return false;
    }
  }
  console.log('Web Mock: Granted Health Connect permissions automatically.');
  return true;
}

export async function getReadiness() {
  if (Capacitor.isNativePlatform()) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      
      const hrData = await Health.query({
        sampleType: 'heartRate',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      // Simple heuristic based on having data
      const score = hrData && hrData.samples && hrData.samples.length > 0 ? 85 : 75;
      let state = 'optimal';
      if (score < 70) state = 'drained';
      return { score, state };
    } catch (e) {
      console.error('Health Connect query error:', e);
      return { score: 80, state: 'optimal' }; // Fallback
    }
  }
  // Web mock: random readiness
  const score = Math.floor(Math.random() * 40) + 60;
  let state = 'optimal';
  if (score < 70) state = 'drained';
  return { score, state };
}

export async function getHeavySweat() {
  if (Capacitor.isNativePlatform()) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      const workoutData = await Health.query({
        sampleType: 'workouts',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      // Assume heavy sweat if there are any intense workouts
      return workoutData && workoutData.samples && workoutData.samples.length > 0;
    } catch(e) {
      return false;
    }
  }
  // Web mock: 30% chance of heavy sweat
  return Math.random() > 0.7;
}

export async function getSleepDuration() {
  if (Capacitor.isNativePlatform()) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      const sleepData = await Health.query({
        sampleType: 'sleepAnalysis',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      
      if (sleepData && sleepData.samples && sleepData.samples.length > 0) {
        // Calculate total hours of sleep from samples
        const totalMs = sleepData.samples.reduce((acc, sample) => {
          return acc + (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime());
        }, 0);
        return (totalMs / (1000 * 60 * 60)).toFixed(1);
      }
      return 7.5; 
    } catch(e) {
      return 7.5;
    }
  }
  return (Math.random() * 3 + 5).toFixed(1); // 5 to 8 hours
}

