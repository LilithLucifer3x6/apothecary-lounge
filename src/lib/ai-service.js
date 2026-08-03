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
    { id: 'scarring', label: 'Hyperpigmentation & Scarring' },
    { id: 'dryness', label: 'Barrier Damage & Dryness' },
    { id: 'aging', label: 'Fine Lines & Elasticity' },
    { id: 'psoriasis', label: 'Sebopsoriasis / Flaking' },
    { id: 'moisture', label: 'Hair Moisture Retention' }
  ];
}

export async function generateConditions() {
  await delay();
  return [
    { id: 'adhd', label: 'ADHD (Executive Function)' },
    { id: 'arthritis', label: 'Rheumatoid Arthritis' },
    { id: 'osteo', label: 'Osteoarthritis' },
    { id: 'fibro', label: 'Fibromyalgia' },
    { id: 'mobility', label: 'General Mobility Limits' },
    { id: 'sensory', label: 'Sensory Overload' }
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
