/**
 * Mock AI Service (Phase 4 Scaffold)
 * Simulates the runtime list generation and structuring that will be provided by an LLM in Phase 5.
 */

// Simulate network latency for the mock AI service
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateConcerns() {
  await delay();
  return [
    { id: 'acne', label: 'Acne & Breakouts' },
    { id: 'cystic_acne', label: 'Cystic Acne' },
    { id: 'hyperpigmentation', label: 'Hyperpigmentation & Dark Spots' },
    { id: 'pih', label: 'Post-Inflammatory Hyperpigmentation' },
    { id: 'scarring', label: 'Acne Scarring (Atrophic/Hypertrophic)' },
    { id: 'rosacea', label: 'Rosacea / Persistent Redness' },
    { id: 'eczema', label: 'Eczema (Atopic Dermatitis)' },
    { id: 'psoriasis', label: 'Psoriasis / Sebopsoriasis' },
    { id: 'dryness', label: 'Barrier Damage & Flaking' },
    { id: 'dehydration', label: 'Dehydration (Tightness)' },
    { id: 'oiliness', label: 'Excessive Sebum & Oiliness' },
    { id: 'pores', label: 'Enlarged or Congested Pores' },
    { id: 'texture', label: 'Uneven Texture / Roughness' },
    { id: 'dullness', label: 'Dullness & Lack of Radiance' },
    { id: 'aging', label: 'Fine Lines & Loss of Elasticity' },
    { id: 'dark_circles', label: 'Dark Circles / Under Eye Bags' },
    { id: 'keratosis', label: 'Keratosis Pilaris (Strawberry Skin)' },
    { id: 'moisture', label: 'Hair Moisture Retention' },
    { id: 'scalp_flaking', label: 'Scalp Flaking / Dandruff' }
  ];
}

export async function generateConditions() {
  await delay();
  return [
    { id: 'adhd', label: 'ADHD (Executive Function)' },
    { id: 'autism', label: 'Autism Spectrum / Sensory Overload' },
    { id: 'arthritis', label: 'Rheumatoid Arthritis' },
    { id: 'osteo', label: 'Osteoarthritis' },
    { id: 'spondylo', label: 'Spondyloarthritis' },
    { id: 'fibro', label: 'Fibromyalgia' },
    { id: 'lupus', label: 'Lupus (SLE)' },
    { id: 'pcos', label: 'PCOS (Hormonal Fluctuations)' },
    { id: 'endo', label: 'Endometriosis' },
    { id: 'ehlers', label: 'Ehlers-Danlos Syndrome (EDS)' },
    { id: 'pots', label: 'POTS / Dysautonomia' },
    { id: 'cfs', label: 'Chronic Fatigue Syndrome (ME/CFS)' },
    { id: 'migraine', label: 'Chronic Migraines' },
    { id: 'asthma', label: 'Asthma' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'thyroid', label: 'Thyroid Conditions (Hypo/Hyper)' },
    { id: 'mobility', label: 'General Mobility Limits' },
    { id: 'dexterity', label: 'Fine Motor / Dexterity Issues' }
  ];
}

export async function generateTraditions() {
  await delay();
  return [
    { id: 'kbeauty', label: 'K-Beauty / Asian Heritage' },
    { id: 'ayurvedic', label: 'Ayurvedic Principles' },
    { id: 'western', label: 'Western Clinical / Dermatological' },
    { id: 'holistic', label: 'Holistic / Plant-Based' },
    { id: 'hoodoo', label: 'Hoodoo / Rootwork' }
  ];
}

export async function generateMoods() {
  await delay();
  return [
    { id: 'drained', label: 'Drained' },
    { id: 'tender', label: 'Tender' },
    { id: 'rushed', label: 'Rushed' },
    { id: 'restored', label: 'Restored' },
    { id: 'capable', label: 'Capable' },
    { id: 'heavy', label: 'Heavy' },
    { id: 'clear', label: 'Clear' },
    { id: 'foggy', label: 'Foggy' }
  ];
}

export async function extractIngredients(text) {
  // Mock NLP extraction of ingredients
  await delay();
  return text.split(',').map(i => i.trim()).filter(Boolean);
}

export async function evaluateTolerance(history) {
  await delay();
  // Mock tolerance evaluation
  return { status: 'tolerated', suggestion: 'Maintain current cadence.' };
}
