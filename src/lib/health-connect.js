import { Capacitor } from '@capacitor/core';

// @capgo/capacitor-health is a native-only plugin. Dynamic import guarded
// by isNativePlatform() so it is never resolved on web — not installed in
// web package.json and listed in rollupOptions.external in vite.config.js.
async function getHealth() {
  if (!Capacitor.isNativePlatform()) return null;
  const { Health } = await import('@capgo/capacitor-health');
  return Health;
}

/**
 * Health Connect Broker
 * Integrates Android Health Connect via Capacitor native plugins, falling back to mocks on Web.
 */

export async function requestHealthPermissions() {
  const Health = await getHealth();
  if (Health) {
    try {
      await Health.requestAuthorization({
        read: ['sleepAnalysis', 'heartRate', 'activeEnergyBurned', 'workouts']
      });
      return true;
    } catch (e) {
      console.error('Failed to request health permissions:', e);
      return false;
    }
  }
  return true;
}

let cachedSnapshot = undefined;

async function fetchLatestSnapshot() {
  if (cachedSnapshot !== undefined) return cachedSnapshot;
  try {
    const { supabase } = await import('./supabase.js');
    const { data } = await supabase
      .from('wearable_snapshots')
      .select('*')
      .order('captured_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    cachedSnapshot = data || null;
  } catch(e) {
    console.error('Failed to fetch snapshot:', e);
    cachedSnapshot = null;
  }
  return cachedSnapshot;
}

export async function syncWearableSnapshot() {
  if (!Capacitor.isNativePlatform()) return;
  const readiness = await getReadiness();
  const heavySweat = await getHeavySweat();
  const sleepDuration = await getSleepDuration();
  
  try {
    const { supabase } = await import('./supabase.js');
    await supabase.from('wearable_snapshots').insert([{
      readiness_score: readiness.score,
      readiness_state: readiness.state,
      heavy_sweat: heavySweat,
      sleep_duration: parseFloat(sleepDuration)
    }]);
  } catch (e) {
    console.error('Failed to sync wearable snapshot:', e);
  }
}

export async function getReadiness() {
  const Health = await getHealth();
  if (Health) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      const hrData = await Health.query({
        sampleType: 'heartRate',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      const score = hrData && hrData.samples && hrData.samples.length > 0 ? 85 : 75;
      let state = 'optimal';
      if (score < 70) state = 'drained';
      return { score, state };
    } catch (e) {
      console.error('Health Connect query error:', e);
      return { score: 80, state: 'optimal' };
    }
  }
  
  const snap = await fetchLatestSnapshot();
  if (snap) {
    return { score: snap.readiness_score, state: snap.readiness_state, captured_at: snap.captured_at };
  }
  return null; // degrade cleanly
}

export async function getHeavySweat() {
  const Health = await getHealth();
  if (Health) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      const workoutData = await Health.query({
        sampleType: 'workouts',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      return workoutData && workoutData.samples && workoutData.samples.length > 0;
    } catch (e) {
      return false;
    }
  }
  
  const snap = await fetchLatestSnapshot();
  return snap ? snap.heavy_sweat : false;
}

export async function getSleepDuration() {
  const Health = await getHealth();
  if (Health) {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
      const sleepData = await Health.query({
        sampleType: 'sleepAnalysis',
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });
      if (sleepData && sleepData.samples && sleepData.samples.length > 0) {
        const totalMs = sleepData.samples.reduce((acc, sample) => {
          return acc + (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime());
        }, 0);
        return (totalMs / (1000 * 60 * 60)).toFixed(1);
      }
      return 7.5;
    } catch (e) {
      return 7.5;
    }
  }
  
  const snap = await fetchLatestSnapshot();
  return snap ? snap.sleep_duration : 7.5;
}
