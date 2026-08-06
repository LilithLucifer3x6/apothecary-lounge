import { supabase } from '../lib/supabase.js';

/**
 * Checks an array of ingredients against the Codex (blocklist).
 * Also hard-checks for 'lavender', 'lavandula', 'lavandin'.
 * 
 * @param {string[]} ingredientList - List of ingredients to check
 * @returns {Promise<{blocked: boolean, matches: Array<{ingredient: string, reason: string}>}>}
 */
export async function checkCodex(ingredientList) {
  if (!ingredientList || !ingredientList.length) {
    return { blocked: false, matches: [] };
  }

  const matches = [];
  const lowerIngredients = ingredientList.map(i => i.toLowerCase());

  try {
    const { data: codexEntries, error } = await supabase
      .from('codex_entries')
      .select('*');
      
    if (error) {
      console.error('Error fetching codex:', error);
      return { blocked: matches.length > 0, matches };
    }

    for (const ing of lowerIngredients) {
      // Find matching entry in the DB
      const entry = codexEntries.find(c => ing.includes(c.ingredient.toLowerCase()));
      if (entry) {
        // Avoid duplicating if we already caught it via regex
        const alreadyCaught = matches.some(m => m.ingredient.toLowerCase() === ing);
        if (!alreadyCaught) {
          matches.push({
            ingredient: ing,
            reason: entry.reason || 'Found in the Grimoire of forbidden elements'
          });
        }
      }
    }
  } catch (e) {
    console.error('Failed to query codex:', e);
  }

  return {
    blocked: matches.length > 0,
    matches
  };
}

/**
 * Adds a new entry to the Codex.
 * @param {string} ingredient 
 * @param {string} reason 
 * @param {string} source 
 */
export async function addToCodex(ingredient, reason, source = 'manual') {
  const { data, error } = await supabase
    .from('codex_entries')
    .insert([
      { ingredient, reason, source, is_permanent: false }
    ])
    .select();
    
  if (error) throw error;
  return data;
}

/**
 * Retrieves all Codex entries.
 */
export async function getCodex() {
  const { data, error } = await supabase
    .from('codex_entries')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}

