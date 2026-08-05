// lib/gcal.js
// GoogleAuth (Capacitor plugin) is only available on native (Android/iOS).
// On web, we use the Supabase provider_token from the OAuth session instead.
// We use a dynamic import so Rollup/Vite never tries to bundle the native plugin.

import { Capacitor } from '@capacitor/core';

let accessToken = null;

async function getGoogleAuth() {
  if (!Capacitor.isNativePlatform()) return null;
  const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
  return GoogleAuth;
}

export async function initGoogleCalendar(clientId, onTokenReceived) {
  const GoogleAuth = await getGoogleAuth();
  if (GoogleAuth) {
    GoogleAuth.initialize({
      clientId: clientId,
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
      grantOfflineAccess: true,
    });
  }

  const stored = localStorage.getItem('gcal_token');
  if (stored) {
    accessToken = stored;
    if (onTokenReceived) onTokenReceived(accessToken);
  }
}

export async function requestCalendarAccess(onTokenReceived) {
  const GoogleAuth = await getGoogleAuth();
  if (!GoogleAuth) {
    // On web, auth is handled via Supabase Google OAuth — provider_token
    // is available on the session after sign-in. Nothing to do here.
    console.log('Web: Google Calendar access is provided by Supabase OAuth session.');
    return;
  }

  try {
    const user = await GoogleAuth.signIn();
    if (user && user.authentication && user.authentication.accessToken) {
      accessToken = user.authentication.accessToken;
      localStorage.setItem('gcal_token', accessToken);
      if (onTokenReceived) onTokenReceived(accessToken);
    }
  } catch (error) {
    console.error('Google Auth error:', error);
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

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('gcal_token');
        accessToken = null;
      }
      throw new Error('Failed to fetch events');
    }
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error('Google Calendar fetch error:', err);
    return [];
  }
}

export async function fetchMonthEvents(year, month) {
  const token = accessToken || localStorage.getItem('gcal_token');
  if (!token) return [];

  try {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=2500`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('gcal_token');
        accessToken = null;
      }
      throw new Error('Failed to fetch month events');
    }
    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.error('Google Calendar month fetch error:', err);
    return [];
  }
}
