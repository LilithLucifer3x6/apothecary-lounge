import { Capacitor } from '@capacitor/core';

/**
 * Health Connect Broker (Phase 6 Scaffold)
 * Integrates Android Health Connect via Capacitor native plugins, falling back to mocks on Web.
 */

export async function requestHealthPermissions() {
  if (Capacitor.isNativePlatform()) {
    console.log('Requesting native Health Connect permissions...');
    // Real implementation would invoke the Capacitor Health plugin
    return true;
  }
  console.log('Web Mock: Granted Health Connect permissions automatically.');
  return true;
}

export async function getReadiness() {
  if (Capacitor.isNativePlatform()) {
    // Real implementation: query sleep, HRV, RHR to determine readiness
    return { score: 85, state: 'optimal' };
  }
  // Web mock: random readiness
  const score = Math.floor(Math.random() * 40) + 60;
  let state = 'optimal';
  if (score < 70) state = 'drained';
  return { score, state };
}

export async function getHeavySweat() {
  if (Capacitor.isNativePlatform()) {
    // Real implementation: query activity records with heart rate spikes > threshold
    return false;
  }
  // Web mock: 30% chance of heavy sweat
  return Math.random() > 0.7;
}

export async function getSleepDuration() {
  if (Capacitor.isNativePlatform()) {
    return 7.5; 
  }
  return (Math.random() * 3 + 5).toFixed(1); // 5 to 8 hours
}

