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
