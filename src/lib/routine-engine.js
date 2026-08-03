/**
 * Routine Engine
 * Sorts items by time of day and layering weight.
 * Enforces the Deterministic Safety Layer (Codex, Melanin Ward, 4C Hair, Zonal Rules).
 */

// Hardcoded Codex Blocks
const CODEX_BANS = ['lavender', 'lavandula'];

// Risk Ward checks (presence-based triggers)
const MELANIN_TRIGGERS = ['hydroquinone', 'citrus', 'lemon', 'lime', 'grapefruit'];
const HAIR_4C_BUILDUP = ['beeswax', 'petrolatum', 'mineral oil', 'dimethicone']; // Heavy waxes/silicones
const INTIMATE_DISRUPTORS = ['fragrance', 'parfum', 'baking soda', 'sodium bicarbonate'];
const DEPILATORY_CAUTIONS = ['thioglycolate', 'calcium hydroxide', 'potassium hydroxide'];

// Helper to check if any ingredient contains any of the bad words
function checkIngredients(ingredients, badList) {
  if (!ingredients || !Array.isArray(ingredients)) return false;
  return ingredients.some(ing => {
    const lower = ing.toLowerCase();
    return badList.some(bad => lower.includes(bad));
  });
}

function parseFlags(item) {
  let rf = item.risk_flags;
  let bf = item.behavior_flags;
  let ing = item.ingredients;
  
  if (typeof rf === 'string') try { rf = JSON.parse(rf); } catch(e) { rf = {}; }
  if (typeof bf === 'string') try { bf = JSON.parse(bf); } catch(e) { bf = {}; }
  if (typeof ing === 'string') try { ing = JSON.parse(ing); } catch(e) { ing = []; }
  
  item.risk_flags = rf || {};
  item.behavior_flags = bf || {};
  item.ingredients = Array.isArray(ing) ? ing : [];
  return item;
}

export function buildRoutines(items, userProfile = {}, wearables = {}) {
  const amItems = [];
  const pmItems = [];
  
  const d = new Date();
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  
  const { readiness = 100, sleepDuration = 8, heavySweat = false } = wearables;
  
  items.forEach(rawItem => {
    const item = parseFlags(rawItem);
    
    // THE CODEX: Absolute Ban
    if (checkIngredients(item.ingredients, CODEX_BANS)) {
      return; // Stripped entirely
    }

    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    
    let isAm = true;
    let isPm = true;

    // Master Invocations & Time-of-day parsing
    if (item.risk_flags.retinoid || cat.includes('sleeping mask') || name.includes('night') || name.includes('tretinoin')) {
      isAm = false; // Retinoids at night
    }
    if (cat.includes('sunscreen') || cat.includes('spf')) {
      isPm = false;
    }
    if (name.includes('drysol')) {
      isAm = false; // Drysol at bedtime only
    }

    // Wearables adaptation: 
    // Poor sleep (under 6 hours) -> De-puffing eye products in AM
    if (sleepDuration < 6 && (cat.includes('eye') && cat.includes('de-puff'))) {
      isAm = true; 
    }
    // Heavy sweat -> Gentle body cleanse
    if (heavySweat && cat.includes('body wash') && item.risk_flags.gentle) {
      isAm = true;
      isPm = true;
    }

    if (isAm) amItems.push(item);
    if (isPm) pmItems.push(item);
  });

  const getWeight = (item) => {
    if (item.behavior_flags && item.behavior_flags.layering_weight) {
      return item.behavior_flags.layering_weight;
    }
    const cat = (item.category || '').toLowerCase();
    if (cat.includes('cleanser') || cat.includes('wash')) return 1;
    if (cat.includes('toner') || cat.includes('essence') || cat.includes('mist')) return 2;
    if (cat.includes('serum') || cat.includes('ampoule')) return 3;
    if (cat.includes('lotion') || cat.includes('emulsion')) return 5;
    if (cat.includes('cream') || cat.includes('moisturizer')) return 7;
    if (cat.includes('oil')) return 8;
    if (cat.includes('balm') || cat.includes('ointment')) return 9;
    if (cat.includes('sunscreen') || cat.includes('spf')) return 10;
    return 5;
  };

  amItems.sort((a, b) => getWeight(a) - getWeight(b));
  pmItems.sort((a, b) => getWeight(a) - getWeight(b));
  
  // No hardcoded evening steps. All steps must come from the Rootwork inventory.
  // This allows the user to track stock levels for contact solution, body wash, etc.

  return { amItems, pmItems, getWeight };
}

export function checkConflicts(items, userProfile = {}) {
  const conflicts = [];
  
  // ZONAL MAPPING
  // Map items to their zones to check overlaps
  const zoneMap = {};
  
  items.forEach(rawItem => {
    const item = parseFlags(rawItem);
    const zone = (item.application_zone || 'full-face').toLowerCase();
    if (!zoneMap[zone]) zoneMap[zone] = [];
    zoneMap[zone].push(item);
  });

  // ZONAL CONFLICT RESOLUTION
  for (const [zone, zoneItems] of Object.entries(zoneMap)) {
    const hasRetinoid = zoneItems.some(i => i.risk_flags.retinoid || i.name.toLowerCase().includes('tretinoin'));
    const hasAcid = zoneItems.some(i => i.risk_flags.acid || i.risk_flags.exfoliant);
    const hasVitC = zoneItems.some(i => i.risk_flags.vitamin_c);
    
    if (hasRetinoid && hasAcid) {
      conflicts.push(`Zonal Conflict [${zone}]: Mixing Retinoids and Acids in the same zone causes severe irritation. Reschedule acid to alternate days.`);
    }
    if (hasRetinoid && hasVitC) {
      conflicts.push(`Zonal Conflict [${zone}]: Vitamin C and Retinoids destabilize each other. Move Vitamin C to the Morning Rite.`);
    }
    
    // MELANIN WARD
    const photosensitizers = zoneItems.filter(i => i.risk_flags.photosensitizer || checkIngredients(i.ingredients, MELANIN_TRIGGERS));
    if (photosensitizers.length > 0 && !items.some(i => i.category.toLowerCase().includes('spf') || i.category.toLowerCase().includes('sunscreen'))) {
      conflicts.push(`Melanin Ward Warning: ${photosensitizers.map(i=>i.name).join(', ')} increases photosensitivity. Sun protection is load-bearing. Add SPF to your routine!`);
    }
  }

  // 4C HAIR & INTIMATE WARDS
  const crownItems = items.filter(i => (i.domain || '').toLowerCase() === 'crown');
  if (crownItems.some(i => checkIngredients(i.ingredients, HAIR_4C_BUILDUP))) {
    conflicts.push("4C Crown Ward: Heavy waxes or non-soluble silicones detected. Risk of buildup in microlocs.");
  }

  const vesselItems = items.filter(i => (i.domain || '').toLowerCase() === 'vessel');
  if (vesselItems.some(i => i.application_zone === 'intimate' && checkIngredients(i.ingredients, INTIMATE_DISRUPTORS))) {
    conflicts.push("Intimate Care Ward: pH disruptors or fragrance detected. Risk to microbiome.");
  }
  
  // SENSITIVE SKIN (Depilatories)
  const depilatories = items.filter(i => checkIngredients(i.ingredients, DEPILATORY_CAUTIONS) || (i.category||'').toLowerCase().includes('depilatory'));
  if (depilatories.length > 0) {
    conflicts.push(`Sensitive Ward: Depilatory (${depilatories.map(i=>i.name).join(', ')}) requires a low-pH cleanse post-care to neutralize alkaline burns.`);
  }

  // DRYSOL HARD RULE
  const hasDrysol = items.some(i => i.name.toLowerCase().includes('drysol'));
  const hasBathRitual = items.some(i => i.name.toLowerCase().includes('bath soak') || i.category.toLowerCase().includes('soak'));
  const hasWitchHazel = items.some(i => i.name.toLowerCase().includes('witch hazel'));
  if (hasDrysol && (hasBathRitual || hasWitchHazel)) {
    conflicts.push("Drysol Hard Rule: Never apply aluminum chloride on the same day as the bath ritual or astringents to avoid chemical burning.");
  }

  // ORAL MEDICATIONS (IMMUNOSUPPRESSANTS)
  const orals = userProfile.orals || [];
  const isImmunosuppressed = orals.some(m => m.toLowerCase().includes('methotrexate') || m.toLowerCase().includes('etanercept'));
  const hasExtractions = items.some(i => i.name.toLowerCase().includes('extraction'));
  
  if (isImmunosuppressed && hasExtractions) {
    conflicts.push("Keeper's Caution: Immunosuppressants detected (Methotrexate/Etanercept). Extractions carry high infection risk. Submerge steel tools in 70% isopropyl alcohol for 10 mins before/after use.");
  }

  return conflicts;
}
