// lib/gcal.js

let tokenClient;
let accessToken = null;

export function initGoogleCalendar(clientId, onTokenReceived) {
  if (!window.google) {
    console.error("Google Identity Services script not loaded");
    return;
  }
  
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
        localStorage.setItem('gcal_token', accessToken);
        if (onTokenReceived) onTokenReceived(accessToken);
      }
    },
  });
}

export function requestCalendarAccess() {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  }
}

export async function fetchTodayEvents() {
  const token = accessToken || localStorage.getItem('gcal_token');
  if (!token) return [];
  
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('gcal_token');
        accessToken = null;
      }
      throw new Error("Failed to fetch events");
    }
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error("Google Calendar fetch error:", err);
    return [];
  }
}

export async function fetchMonthEvents(year, month) {
  const token = accessToken || localStorage.getItem('gcal_token');
  if (!token) return [];
  
  try {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=2500`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('gcal_token');
        accessToken = null;
      }
      throw new Error("Failed to fetch month events");
    }
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error("Google Calendar month fetch error:", err);
    return [];
  }
}

