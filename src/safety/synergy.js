import { supabase } from '../lib/supabase.js';
import { zonesOverlap, zonesAdjacent } from './zone-resolver.js';

/**
 * Checks for ingredient conflicts between two items.
 * 
 * @param {Object} itemA 
 * @param {Object} itemB 
 * @returns {Promise<{conflicts: Array<{rule: string, type: string, description: string, canOverride: boolean}>}>}
 */
export async function checkConflicts(itemA, itemB) {
  const conflicts = [];
  
  // Hardcoded Drysol check removed; now handled dynamically via conflict_rules from Supabase.

  // Zone check
  const zonesA = itemA.application_zones || [];
  const zonesB = itemB.application_zones || [];
  
  const overlap = zonesOverlap(zonesA, zonesB);
  const adjacent = zonesAdjacent(zonesA, zonesB);
  
  // If they don't touch, no further conflict checks needed
  if (!overlap && !adjacent) {
    return { conflicts };
  }

  try {
    const { data: rules, error } = await supabase
      .from('conflict_rules')
      .select('*');
      
    if (error) {
      console.error('Error fetching conflict rules:', error);
      return { conflicts };
    }
    
    // Normalize ingredients for checking
    const getIngs = (item) => {
      if (!item.ingredients) return [];
      const arr = typeof item.ingredients === 'string' ? JSON.parse(item.ingredients) : item.ingredients;
      return arr.map(i => i.toLowerCase());
    };
    
    const lowerIngA = getIngs(itemA);
    const lowerIngB = getIngs(itemB);

    const flagsA = itemA.risk_flags || {};
    const flagsB = itemB.risk_flags || {};
    
    const hasCategory = (item, itemFlags, itemIngs, category) => {
      if (itemFlags[category]) return true;
      if (itemIngs.some(i => i.includes(category))) return true;
      if (item.name && item.name.toLowerCase().includes(category)) return true;
      if (item.category && item.category.toLowerCase().includes(category)) return true;
      return false;
    };

    for (const rule of rules) {
      const { ingredient_a, ingredient_b, conflict_type, description, zone_specific } = rule;
      
      // If zone specific and they are only adjacent but not overlapping, we might skip
      if (zone_specific && !overlap) continue;
      
      const aHasFirst = hasCategory(itemA, flagsA, lowerIngA, ingredient_a);
      const bHasSecond = hasCategory(itemB, flagsB, lowerIngB, ingredient_b);
      
      const aHasSecond = hasCategory(itemA, flagsA, lowerIngA, ingredient_b);
      const bHasFirst = hasCategory(itemB, flagsB, lowerIngB, ingredient_a);
      
      if ((aHasFirst && bHasSecond) || (aHasSecond && bHasFirst)) {
        conflicts.push({
          rule: `${ingredient_a} + ${ingredient_b}`,
          type: conflict_type,
          description: description,
          canOverride: conflict_type === 'advisory' || conflict_type === 'separate_am_pm'
        });
      }
    }
  } catch (e) {
    console.error('Failed to evaluate conflicts:', e);
  }

  return { conflicts };
}

