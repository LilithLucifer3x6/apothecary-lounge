import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase.js';

/**
 * Calendar Broker
 * Integrates real Google Calendar REST API via Supabase provider_token.
 */

export async function requestCalendarPermissions() {
  if (Capacitor.isNativePlatform()) {
    console.log('Requesting native Google Calendar permissions...');
    return true;
  }
  return true;
}

export async function syncAppointments() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.provider_token) {
      console.warn("No Google provider token found. Cannot sync real Google Calendar.");
      return [];
    }

    const token = session.provider_token;
    
    // We fetch events from the primary calendar for the next 30 days
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 86400000).toISOString();
    
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      // If 401, token might be expired. Should handle refresh in real app.
      throw new Error(`Calendar fetch failed: ${res.status}`);
    }

    const data = await res.json();
    
    // Parse Google events into our appointment format
    const appointments = [];
    if (data.items) {
      data.items.forEach(item => {
        const title = item.summary ? item.summary.toLowerCase() : '';
        const date = item.start.dateTime || item.start.date; // fallback for all-day
        
        let type = 'other';
        if (title.includes('nail') || title.includes('manicure')) type = 'nails';
        else if (title.includes('retie') || title.includes('locs') || title.includes('hair')) type = 'retie';
        else if (title.includes('derm') || title.includes('facial') || title.includes('skin')) type = 'derm';

        if (type !== 'other') {
          appointments.push({
            id: item.id,
            type,
            title: item.summary,
            date
          });
        }
      });
    }
    return appointments;
  } catch (err) {
    console.error("Failed to sync real Google Calendar:", err);
    return [];
  }
}

