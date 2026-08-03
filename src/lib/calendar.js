import { Capacitor } from '@capacitor/core';

/**
 * Calendar Broker (Phase 6 Scaffold)
 * Integrates Google Calendar via Capacitor native plugins, falling back to mocks on Web.
 */

export async function requestCalendarPermissions() {
  if (Capacitor.isNativePlatform()) {
    console.log('Requesting native Google Calendar permissions...');
    return true;
  }
  console.log('Web Mock: Granted Google Calendar permissions automatically.');
  return true;
}

export async function syncAppointments() {
  if (Capacitor.isNativePlatform()) {
    // Scaffold for real Google Calendar API
    return [];
  }
  
  // Web mock: returns a few mock appointments for The Grimoire
  const today = new Date();
  const nextNails = new Date(today.getTime() + 2 * 86400000); // 2 days from now
  const nextRetie = new Date(today.getTime() + 10 * 86400000); // 10 days from now
  
  return [
    { id: 'app_1', type: 'nails', title: 'Nail Salon', date: nextNails.toISOString() },
    { id: 'app_2', type: 'retie', title: 'Retie Appointment', date: nextRetie.toISOString() }
  ];
}

export async function markAppointmentDone(appointmentType) {
  console.log(`Marked ${appointmentType} as done. Recalculating next date...`);
  // In a real app, this would push a new event to Google Calendar for +2 weeks or +8 weeks.
  return true;
}
