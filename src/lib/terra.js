// lib/terra.js

export async function fetchTerraData(devId, apiKey) {
  if (!devId || !apiKey) return null;
  
  // Note: Terra API blocks direct cross-origin browser requests in a real production app.
  // This is a direct fetch for demonstration purposes. In production, this requires a backend proxy.
  try {
    const end = new Date();
    const start = new Date(end.getTime() - (24 * 60 * 60 * 1000));
    
    const response = await fetch(`https://api.tryterra.co/v2/daily?start_date=${start.toISOString().split('T')[0]}&end_date=${end.toISOString().split('T')[0]}`, {
      headers: {
        'x-api-key': apiKey,
        'dev-id': devId
      }
    });
    
    if (!response.ok) throw new Error("Failed to fetch Terra data");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Terra API fetch error:", err);
    return null;
  }
}
