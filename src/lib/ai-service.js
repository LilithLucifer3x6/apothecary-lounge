import { supabase } from './supabase.js';
import { invokeAnthropicProxy } from './ai-engine.js';

async function queryClaudeForList(promptText) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 1024,
        messages: [{ role: 'user', content: promptText }]
    });
    
    if (error) throw error;
    
    const responseText = data.content[0].text;
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (err) {
    console.error('Failed to query Claude for list:', err);
    return [];
  }
}

export async function generateConcerns() {
  const fallback = [
    { id: 'acne', label: 'Acne & Breakouts' },
    { id: 'dryness', label: 'Barrier Damage & Flaking' }
  ];
  const list = await queryClaudeForList('Output a JSON array of 15 common skincare concerns. Each object must have an "id" (snake_case string) and "label" (user-friendly string). Only output the JSON array.');
  return list.length > 0 ? list : fallback;
}

export async function generateConditions() {
  const fallback = [
    { id: 'adhd', label: 'ADHD (Executive Function)' },
    { id: 'arthritis', label: 'Rheumatoid Arthritis' }
  ];
  const list = await queryClaudeForList('Output a JSON array of 15 common chronic health conditions that might affect daily routines (like autoimmune, neurodivergence, physical limitations). Each object must have an "id" (snake_case string) and "label" (user-friendly string). Only output the JSON array.');
  return list.length > 0 ? list : fallback;
}

export async function generateTraditions() {
  const fallback = [
    { id: 'western', label: 'Western Clinical / Dermatological' },
    { id: 'kbeauty', label: 'K-Beauty / Korean Heritage' }
  ];
  const list = await queryClaudeForList('Output a JSON array of 15 common skincare traditions or heritages (like K-Beauty, Ayurvedic, Western Clinical). Each object must have an "id" (snake_case string) and "label" (user-friendly string). Only output the JSON array.');
  return list.length > 0 ? list : fallback;
}

export async function generateMoods() {
  const fallback = [
    { id: 'drained', label: 'Drained of Essence' },
    { id: 'vibrant', label: 'Vibrant' }
  ];
  const list = await queryClaudeForList('Output a JSON array of 15 poetic, gothic-cottagecore moods or feelings for a journal. Each object must have an "id" (snake_case string) and "label" (poetic string). Only output the JSON array.');
  return list.length > 0 ? list : fallback;
}

export async function extractIngredients(text) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 512,
        messages: [{ role: 'user', content: `Extract the skincare ingredients from the following text and return them as a JSON array of strings. Text: "${text}"` }]
    });
    if (error) throw error;
    const jsonMatch = data.content[0].text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error(err);
  }
  return text.split(',').map(i => i.trim()).filter(Boolean);
}

export async function evaluateTolerance(history) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 512,
        messages: [{ role: 'user', content: `Evaluate the user's tolerance based on this history: ${JSON.stringify(history)}. Return a JSON object with "status" (tolerated, irritated, escalating) and "suggestion" (string).` }]
    });
    if (error) throw error;
    const jsonMatch = data.content[0].text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error(err);
  }
  return { status: 'tolerated', suggestion: 'Maintain current cadence.' };
}

export async function generateAdaptiveSuggestions(wearables, availableItems) {
  const { sleepDuration, heavySweat } = wearables;
  if (sleepDuration >= 6 && !heavySweat) return []; // No special needs

  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const promptText = `
You are the Keeper of the Sanctuary, powering a cosmetic wellness app.
Health Data:
- Sleep: ${sleepDuration} hours
- Heavy Sweat: ${heavySweat ? 'Yes' : 'No'}

Available Items:
${JSON.stringify(availableItems.map(i => ({id: i.id, name: i.name, category: i.category, risk_flags: i.risk_flags})))}

Based on this, suggest any items that should be explicitly added to the morning routine (e.g. de-puffing eye products for poor sleep, gentle body washes for heavy sweat).
Return ONLY a JSON array of item IDs that you recommend adding to the AM routine. No other text.
`;
    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 512,
        messages: [{ role: 'user', content: promptText }]
    });
    
    if (error) throw error;
    
    const responseText = data.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('Failed to get adaptive suggestions:', err);
  }
  return [];
}

export async function converseBanish(item, history) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const promptText = `
You are the Keeper of the Sanctuary. The user is banishing "${item.name}" from their apothecary.
Goal: Have a brief conversation to discover exactly WHY they are banishing it (adverse reaction, cost, availability, ineffectiveness, etc.) and extract any ingredient patterns if it's an adverse reaction.
If you have determined the reason, your final response must end with exactly this phrase: "[BANISH_REASON: <the reason>]".
Otherwise, reply sympathetically and ask a clarifying question. Keep responses to 1-2 short sentences.
`;
    // Format history for Anthropic
    const msgs = history.map(h => ({ role: h.role, content: h.text }));
    msgs.unshift({ role: 'user', content: promptText }); // Use user role since system role might not be supported here

    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 256,
        messages: msgs
    });
    
    if (error) throw error;
    
    return data.content[0].text;
  } catch (err) {
    console.error('Failed to converse about banish:', err);
    return "I sense a disturbance. Tell me plainly, why must we banish this? (Type your reason to proceed)";
  }
}

export async function converseReading(history, userProfile) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  try {
    const promptText = `
You are the Keeper of the Sanctuary, leading "The Reading", a monthly reflection on the user's wellness rituals.
Goal: Have a short conversation to check if they are experiencing any new skin concerns (dryness, breakouts), lifestyle changes (more stress, less sleep), or if any products are causing irritation.
Ask one question at a time. Be empathetic, poetic, and concise (1-2 sentences).
If you have gathered enough information (after 2-3 exchanges), conclude the reading by ending your final response with exactly: "[READING_COMPLETE: <summary of changes or 'No changes'>]".
Current profile: ${JSON.stringify(userProfile?.intake_answers || {})}
`;
    const msgs = history.map(h => ({ role: h.role, content: h.text }));
    msgs.unshift({ role: 'user', content: promptText });

    const { data, error } = await invokeAnthropicProxy({
        max_tokens: 300,
        messages: msgs
    });
    
    if (error) throw error;
    
    return data.content[0].text;
  } catch (err) {
    console.error('Failed to converse for reading:', err);
    return "The stars are obscured tonight. How has your flesh and spirit fared this past cycle?";
  }
}
