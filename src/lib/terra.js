// lib/terra.js

import { supabase } from './supabase.js';

export async function fetchTerraData(devId, apiKey) {
  if (!devId || !apiKey) return null;
  
  try {
    const end = new Date();
    const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
    
    // The actual DEV_ID and API_KEY should ideally live securely in Supabase environment variables.
    // However, since they were passed here in the original design, we'll pass them in the payload if needed, 
    // or just let the Edge Function use its environment variables. The Edge Function relies on process.env.
    
    // We will invoke the Supabase Edge Function to avoid CORS and hide credentials in prod
    const { data, error } = await supabase.functions.invoke('terra-proxy', {
      body: {
        start_date: start.toISOString().split('T')[0],
        end_date: end.toISOString().split('T')[0]
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (err) {
    console.error("Terra API fetch error:", err);
    return null;
  }
}

