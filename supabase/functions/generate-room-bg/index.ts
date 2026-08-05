import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, image_size = "landscape_16_9" } = await req.json()
    const falKey = Deno.env.get('FAL_KEY')

    if (!falKey) {
      return new Response(
        JSON.stringify({ error: 'FAL_KEY is not set' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Call fal.ai FLUX Schnell
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: image_size,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Fal API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const imageUrl = data.images && data.images[0] && data.images[0].url

    return new Response(
      JSON.stringify({ url: imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
