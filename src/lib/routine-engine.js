/**
 * Routine Engine
 * Sorts items by time of day and layering weight.
 */

export function buildRoutines(items) {
  const amItems = [];
  const pmItems = [];

  items.forEach(item => {
    let rf = item.risk_flags;
    let bf = item.behavior_flags;
    
    // Parse strings if they are JSON (Supabase sometimes returns strings for jsonb)
    if (typeof rf === 'string') try { rf = JSON.parse(rf); } catch(e) { rf = {}; }
    if (typeof bf === 'string') try { bf = JSON.parse(bf); } catch(e) { bf = {}; }
    
    rf = rf || {};
    bf = bf || {};

    // For sorting, re-assign parsed back so we don't parse multiple times
    item.risk_flags = rf;
    item.behavior_flags = bf;

    const name = (item.name || '').toLowerCase();
    const cat = (item.category || '').toLowerCase();
    
    let isAm = true;
    let isPm = true;

    if (rf.retinoid || cat.includes('sleeping mask') || name.includes('night')) {
      isAm = false;
    }
    if (cat.includes('sunscreen') || cat.includes('spf')) {
      isPm = false;
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

  return { amItems, pmItems, getWeight };
}

export function checkConflicts(items) {
  const conflicts = [];
  
  const hasRetinoid = items.some(i => i.risk_flags?.retinoid);
  const hasAcid = items.some(i => i.risk_flags?.acid || i.risk_flags?.exfoliant);
  const hasVitC = items.some(i => i.risk_flags?.vitamin_c);

  if (hasRetinoid && hasAcid) {
    conflicts.push("Mixing Retinoids and Acids in the same ritual can cause severe irritation.");
  }
  if (hasRetinoid && hasVitC) {
    conflicts.push("Vitamin C and Retinoids can destabilize each other and irritate the skin.");
  }

  return conflicts;
}
