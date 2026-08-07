import { supabase } from './src/lib/supabase.js';
import { checkConflicts } from './src/lib/routine-engine.js';
import { checkConflicts as checkSynergyConflicts } from './src/safety/synergy.js';

async function run() {
  const component = {
    id: 'test-comp-1',
    name: 'Witch Hazel Toner',
    category: 'toner',
    item_type: 'consumable',
    risk_flags: { astringent: true },
    ingredients: ['witch hazel', 'water'],
    application_zones: ['underarms']
  };

  const composite = {
    id: 'test-comp-2',
    name: 'My Special Blend',
    category: 'blend',
    item_type: 'composite',
    is_composite: true,
    composite_form: 'other',
    risk_flags: {},
    ingredients: ['salt'],
    components: [component] // Hypothetical hydrated state
  };

  const drysol = {
    id: 'test-comp-3',
    name: 'Drysol',
    category: 'treatment',
    item_type: 'consumable',
    risk_flags: { hyperhidrosis_treatment: true },
    ingredients: ['aluminum chloride'],
    application_zones: ['underarms']
  };

  console.log("Checking synergy between composite and drysol...");
  const synergyResult = await checkSynergyConflicts(drysol, composite);
  console.log("Synergy Result:", JSON.stringify(synergyResult.conflicts, null, 2));

  console.log("Checking routine conflicts...");
  const engineResult = checkConflicts([drysol, composite]);
  console.log("Routine Result:", JSON.stringify(engineResult, null, 2));
}

run();
