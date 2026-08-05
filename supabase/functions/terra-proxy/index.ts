import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { start_date, end_date } = await req.json();

    if (!start_date || !end_date) {
      return new Response(JSON.stringify({ error: 'Missing start_date or end_date' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const terraApiKey = Deno.env.get('TERRA_API_KEY');
    const terraDevId = Deno.env.get('TERRA_DEV_ID');

    if (!terraApiKey || !terraDevId) {
      return new Response(JSON.stringify({ error: 'Terra API credentials not configured in Edge Function' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const terraUrl = `https://api.tryterra.co/v2/daily?start_date=${start_date}&end_date=${end_date}`;

    const response = await fetch(terraUrl, {
      method: 'GET',
      headers: {
        'x-api-key': terraApiKey,
        'dev-id': terraDevId,
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Terra API error: ${response.status} ${errText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
