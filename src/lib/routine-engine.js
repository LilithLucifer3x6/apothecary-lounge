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
  
  const intake = userProfile.intake_answers || {};
  const oralsList = intake.oralList || [];
  const rxList = intake.rxList || [];
  const orals = oralsList.map(o => (o.name || '').toLowerCase());
  const hasIsotretinoin = orals.some(m => m.includes('isotretinoin') || m.includes('accutane'));

  const virtualRxItems = rxList.map((rx, idx) => {
    const rxName = (rx.name || '').toLowerCase();
    
    return {
      id: `rx-${idx}`,
      name: rx.name,
      category: 'treatment',
      domain: rxName.includes('drysol') ? 'vessel' : 'visage',
      risk_flags: { retinoid: rxName.includes('tretinoin') },
      behavior_flags: { layering_weight: 9 }, // Default treatment weight
      ingredients: [],
      isInjected: false,
      isRx: true,
      application_zone: rx.zone || ''
    };
  });
  
  const allItems = [...items, ...virtualRxItems];

  allItems.forEach(rawItem => {
    const item = parseFlags(rawItem);
    
    // THE CODEX: Absolute Ban
    if (checkIngredients(item.ingredients, CODEX_BANS)) {
      return; // Stripped entirely
    }

    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    
    // HARD MEDICAL BLOCK: Isotretinoin (Oral) + Tretinoin (Topical)
    if (hasIsotretinoin && name.includes('tretinoin') && !name.includes('isotretinoin')) {
      return; // Stripped entirely to prevent chemical burns
    }

    let isAm = true;
    let isPm = true;

    // Master Invocations & Time-of-day parsing
    if (cat.includes('sleeping mask') || name.includes('night')) {
      isAm = false; // Night-specific items
    }
    if (cat.includes('sunscreen') || name.includes('spf') || name.includes('day')) {
      isPm = false; // Day-specific items
    }
    if (name.includes('drysol')) {
      isAm = false; // Drysol at bedtime only
    }

    // Mask scheduling logic based on time availability
    if (cat.includes('mask')) {
      const requiresRinse = item.behavior_flags?.requires_rinse;
      if (requiresRinse) {
        // Rinse-off masks require more time, routed to weekends
        if (!isWeekend) {
          isAm = false;
          isPm = false;
        }
      } else {
        // Leave-on masks are scheduled for the rest of the week
        if (isWeekend) {
          isAm = false;
          isPm = false;
        }
      }
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

  // Zone-based Conflict Rescheduling
  // If Retinoid is in PM, move Vitamin C and Exfoliating Acids to AM
  const pmRetinoids = pmItems.filter(i => i.risk_flags?.retinoid || (i.name || '').toLowerCase().includes('tretinoin'));
  if (pmRetinoids.length > 0) {
    // Find all Vit C and Acids in PM that share a zone with the retinoid
    for (let i = pmItems.length - 1; i >= 0; i--) {
      const item = pmItems[i];
      const isVitC = item.risk_flags?.vitamin_c;
      const isAcid = item.risk_flags?.acid || item.risk_flags?.exfoliant;
      
      if (isVitC || isAcid) {
        // Check zone overlap
        const itemZone = (item.application_zone || 'full-face').toLowerCase();
        const overlaps = pmRetinoids.some(r => {
          const rZone = (r.application_zone || 'full-face').toLowerCase();
          return rZone === itemZone || rZone === 'full-face' || itemZone === 'full-face';
        });
        
        if (overlaps) {
          // Reschedule to AM
          pmItems.splice(i, 1);
          if (!amItems.find(a => a.id === item.id)) {
            amItems.push(item);
          }
        }
      }
    }
  }

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
  
  // IMMUTABLE BASELINE ROUTINES (From Spec Section 21)
  const immutableGrinAM = [
    { id: 'grin-am-1', name: 'Floss Picks', category: 'immutable', domain: 'grin', weight: -0.4, isInjected: true },
    { id: 'grin-am-2', name: 'Waterpik', category: 'immutable', domain: 'grin', weight: -0.3, isInjected: true },
    { id: 'grin-am-3', name: 'Mouthwash', category: 'immutable', domain: 'grin', weight: -0.2, isInjected: true },
    { id: 'grin-am-4', name: 'Brush Teeth', category: 'immutable', domain: 'grin', weight: -0.1, isInjected: true }
  ];
  
  const immutableGrinPM = [
    { id: 'grin-pm-1', name: 'Floss Picks', category: 'immutable', domain: 'grin', weight: -0.4, isInjected: true },
    { id: 'grin-pm-2', name: 'Waterpik', category: 'immutable', domain: 'grin', weight: -0.3, isInjected: true },
    { id: 'grin-pm-3', name: 'Mouthwash', category: 'immutable', domain: 'grin', weight: -0.2, isInjected: true },
    { id: 'grin-pm-4', name: 'Brush Teeth', category: 'immutable', domain: 'grin', weight: -0.1, isInjected: true }
  ];

  const immutableWindDown = [
    { id: 'wd-1', name: 'The Cleansing Waters', category: 'immutable', domain: 'vessel', weight: 0.1, isInjected: true },
    { id: 'wd-2', name: 'The Drying', desc: 'With the aid of another', category: 'immutable', domain: 'vessel', weight: 0.2, isInjected: true },
    { id: 'wd-3', name: 'The Purging of Blemishes & The Warm Gaze', desc: 'Purify implements before and after.', category: 'immutable', domain: 'visage', weight: 0.3, isInjected: true }
  ];
  
  if (isWeekend) {
    // Left intentionally blank. Rituals must be user-defined.
  }

  amItems.unshift(...immutableGrinAM);
  pmItems.unshift(...immutableWindDown);
  pmItems.push(...immutableGrinPM);

  return { amItems, pmItems, getWeight };
}

export function checkConflicts(items, userProfile = {}) {
  const conflicts = [];
  
  const intake = userProfile.intake_answers || {};
  const oralsList = intake.oralList || [];
  const orals = oralsList.map(o => (o.name || '').toLowerCase());
  const hasIsotretinoin = orals.some(m => m.includes('isotretinoin') || m.includes('accutane'));
  const hasMethotrexate = orals.some(m => m.includes('methotrexate'));
  
  // ZONAL MAPPING
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
    
    // MELANIN WARD (Methotrexate is heavily photosensitizing)
    const photosensitizers = zoneItems.filter(i => i.risk_flags.photosensitizer || checkIngredients(i.ingredients, MELANIN_TRIGGERS));
    if (hasMethotrexate || photosensitizers.length > 0) {
      if (!items.some(i => i.category.toLowerCase().includes('spf') || i.category.toLowerCase().includes('sunscreen'))) {
        let source = hasMethotrexate ? "Oral Methotrexate" : photosensitizers.map(i=>i.name).join(', ');
        conflicts.push(`Melanin Ward Warning: ${source} increases photosensitivity. Sun protection is load-bearing. Add SPF to your routine!`);
      }
    }
  }

  // HARD MEDICAL BLOCK: Isotretinoin + Tretinoin
  const hasTopicalTret = items.some(i => i.name.toLowerCase().includes('tretinoin') && !i.name.toLowerCase().includes('isotretinoin'));
  if (hasIsotretinoin && hasTopicalTret) {
    conflicts.push("CRITICAL HAZARD: Oral Isotretinoin detected. Concomitant use of topical Tretinoin causes severe chemical burns and barrier damage. Topical Tretinoin has been suspended from all Rites.");
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
  const isImmunosuppressed = orals.some(m => m.includes('methotrexate') || m.includes('etanercept') || m.includes('enbrel'));
  // The extractions step is immutable, so we can just assume it exists in PM, but let's check items too in case user adds tools
  if (isImmunosuppressed) {
    conflicts.push("Keeper's Caution: Immunosuppressants detected (Methotrexate/Enbrel). Extractions carry high infection risk. Submerge steel tools in 70% isopropyl alcohol for 10 mins before/after use.");
  }

  return conflicts;
}
