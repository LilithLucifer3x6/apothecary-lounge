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
    { id: 'kbeauty', label: 'K-Beauty / Korean Heritage' },
    { id: 'jbeauty', label: 'J-Beauty / Japanese Heritage' },
    { id: 'ayurvedic', label: 'Ayurvedic Principles' },
    { id: 'tcm', label: 'Traditional Chinese Medicine (TCM)' },
    { id: 'western', label: 'Western Clinical / Dermatological' },
    { id: 'french', label: 'French Pharmacy / Dermo-Cosmetics' },
    { id: 'nordic', label: 'Nordic / Arctic Botanicals' },
    { id: 'mediterranean', label: 'Mediterranean Heritage' },
    { id: 'holistic', label: 'Holistic / Plant-Based' },
    { id: 'clean', label: 'Clean Beauty / Minimalist' },
    { id: 'naturopathy', label: 'Naturopathy / Herbalism' },
    { id: 'african', label: 'African Botanicals & Butters' },
    { id: 'indigenous', label: 'Indigenous / Ancestral Remedies' },
    { id: 'diy', label: 'DIY / Home-Crafted' },
    { id: 'hoodoo', label: 'Hoodoo / Rootwork' }
  ];
}

export async function generateMoods() {
  await delay();
  return [
    { id: 'drained', label: 'Drained of Essence' },
    { id: 'tender', label: 'Tender & Bruised' },
    { id: 'rushed', label: 'Chased by the Hourglass' },
    { id: 'restored', label: 'Bathed in Moonlight' },
    { id: 'capable', label: 'Brimming with Power' },
    { id: 'heavy', label: 'Carrying the Weight of Stone' },
    { id: 'clear', label: 'Clear as Spring Water' },
    { id: 'foggy', label: 'Lost in the Mists' },
    { id: 'anxious', label: 'Shadowed by Worry' },
    { id: 'creative', label: 'Sparking with Creation' },
    { id: 'melancholic', label: 'Singing a Mournful Tune' },
    { id: 'radiant', label: 'Glowing with Inner Fire' },
    { id: 'frustrated', label: 'Tangled in Thorns' },
    { id: 'nostalgic', label: 'Hearing Echoes of the Past' },
    { id: 'serene', label: 'Still as a Mirror Lake' },
    { id: 'agitated', label: 'Stirred by the Wind' },
    { id: 'peaceful', label: 'At Rest in the Sanctuary' },
    { id: 'inspired', label: 'Touched by the Muses' },
    { id: 'grounded', label: 'Rooted Deep in the Earth' },
    { id: 'scattered', label: 'Like Leaves on the Autumn Wind' },
    { id: 'reflective', label: 'Gazing into the Scrying Bowl' },
    { id: 'overwhelmed', label: 'Drowning in the Deep' },
    { id: 'hopeful', label: 'Watching the Dawn Break' },
    { id: 'lethargic', label: 'Lethargic' },
    { id: 'vibrant', label: 'Vibrant' },
    { id: 'withdrawn', label: 'Withdrawn' },
    { id: 'connected', label: 'Connected' }
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
