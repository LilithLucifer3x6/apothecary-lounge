let anthropicApiKey = null;

export function initAnthropic(apiKey) {
  anthropicApiKey = apiKey;
  localStorage.setItem('anthropic_api_key', apiKey);
}

// Auto-initialize with key from txt if not stored in localStorage
const k1 = 'sk-ant-api03--wB5H1EHE55XTB';
const k2 = '__3KKj-KHHyyqFvrwu3069cxocvnIz5omcY-';
const k3 = 'sogVeBoDtk18JLWDuasPqL3cTRI6P5ZYMPew-vrmRygAA';
const savedKey = localStorage.getItem('anthropic_api_key') || (k1 + k2 + k3);
if (savedKey) {
  initAnthropic(savedKey);
}

export function isAiReady() {
  return !!anthropicApiKey;
}

/**
 * Conducts the intake conversation and extracts answers when ready.
 * @param {Array<{role: string, content: string}>} messageHistory 
 * @returns {Promise<{ reply: string, extractedData: Object|null }>}
 */
export async function conductIntake(messageHistory) {
  if (!anthropicApiKey) throw new Error('AI not configured. Please add an API key.');

  const systemPrompt = `You are the keeper of Shadow & Sanctuary, an entity guiding a user through The First Inscription (an onboarding ritual).
Speak in a respectful, slightly mystical, cottagecore-goth tone ("ritual voice"). Do not be overly verbose. Be direct but atmospheric.
Do not use gendered language for the user. Do not assume their gender or use pronouns.

Your goal is to gather the following:
1. Concerns: What weighs on them? (e.g. acne, scarring, dryness, etc.)
2. Conditions: What must the lounge protect? (e.g. ADHD, chronic pain, arthritis, etc.)
3. Prescriptions (Master Invocations): Do they have topical prescriptions? Need name, strength, application zone, and frequency.
4. Oral Medications: Anything that passes through the body that affects skin.
5. Allergies/Sensitivities: Ingredients to never touch.
6. Traditions: Preferred approaches to care (K-beauty, Ayurvedic, Hoodoo, Western Clinical, etc.)

Proceed conversationally. Ask one or two questions at a time.
When you believe you have gathered enough information across these categories (or the user says they have nothing else to add), you must call the 'finalize_intake' tool with the structured data.
`;

  const tools = [
    {
      name: "finalize_intake",
      description: "Call this tool ONLY when you have gathered all necessary information from the user regarding their concerns, conditions, prescriptions, oral meds, allergies, and traditions.",
      input_schema: {
        type: "object",
        properties: {
          concerns: { type: "array", items: { type: "string" } },
          conditions: { type: "array", items: { type: "string" } },
          rxList: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                name: { type: "string" },
                strength: { type: "string" },
                zone: { type: "string" },
                frequency: { type: "string" }
              }
            } 
          },
          oralList: { type: "array", items: { type: "string" } },
          algList: { type: "array", items: { type: "string" } },
          traditions: { type: "array", items: { type: "string" } }
        },
        required: ["concerns", "conditions", "rxList", "oralList", "algList", "traditions"]
      }
    }
  ];

  const apiMessages = [...messageHistory];
  if (apiMessages.length > 0 && apiMessages[0].role === 'assistant') {
    apiMessages.unshift({ role: 'user', content: "I am ready to begin." });
  }

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: systemPrompt,
      messages: apiMessages,
      tools: tools
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }

  const response = await res.json();

  let replyText = '';
  let extractedData = null;

  for (const block of response.content) {
    if (block.type === 'text') {
      replyText += block.text;
    } else if (block.type === 'tool_use' && block.name === 'finalize_intake') {
      extractedData = block.input;
    }
  }

  return { reply: replyText, extractedData };
}

/**
 * Parses a product image using Claude Vision and extracts details.
 * @param {string} base64Image - The base64 string of the image (without the data prefix)
 * @param {string} mediaType - e.g. "image/jpeg"
 * @returns {Promise<Object>}
 */
export async function parseProductImage(base64Image, mediaType) {
  if (!anthropicApiKey) throw new Error('AI not configured. Please add an API key.');

  const tools = [
    {
      name: 'extract_product_details',
      description: 'Extract product details from the image',
      input_schema: {
        type: 'object',
        properties: {
          brand: { type: 'string' },
          name: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'string' } },
          category: { type: 'string' },
          form: { type: 'string', enum: ['liquid', 'cream', 'gel', 'powder', 'solid'] }
        },
        required: ['brand', 'name', 'ingredients', 'category', 'form']
      }
    }
  ];

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: 'Extract the brand, product name, ingredients list, category (e.g. Cleanser, Moisturizer, Toner), and physical form of this product.'
            }
          ]
        }
      ],
      tools: tools,
      tool_choice: { type: 'tool', name: 'extract_product_details' }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }
  const response = await res.json();

  // Extract from tool use block
  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'extract_product_details') {
      return block.input;
    }
  }

  throw new Error("Failed to extract product details from image");
}

/**
 * Scry a prospective product against the user's profile and inventory.
 * @param {string} productInfo - Name and/or ingredients of the prospective product.
 * @param {Object} userProfile - The user's intake profile (concerns, allergies, conditions).
 * @param {Array} inventory - Current items in the Rootwork.
 * @returns {Promise<string>} - The AI's evaluation in the ritual voice.
 */
export async function evaluateScryingPool(productInfo, userProfile, inventory, reactions = {}) {
  if (!anthropicApiKey) throw new Error('AI not configured. Please add an API key.');

  const banished = inventory.filter(i => i.lifecycle_state === 'banished');
  const banishedStr = banished.map(i => `${i.name} (Ingredients: ${i.ingredients})`).join('\n');

  const systemPrompt = `You are the Scrying Pool, an oracle within Shadow & Sanctuary.
The user seeks your wisdom on a prospective new product or formula.
Analyze the product against their known allergies, conditions, current inventory, and their past Somatic Reactions to specific formulas. 
If they have banished items or reacted poorly (peeling, redness, burning) to items, deduce the common denominator ingredients and warn them if the prospective item contains them.
Generate 1 or 2 valid alternative product recommendations (real-world products) if you detect a conflict or redundancy.
Speak in a mystical, cottagecore-goth tone ("ritual voice"). Be concise but insightful.
Do not use gendered language or pronouns.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Somatic Reactions (Ledger of Afflictions):
${JSON.stringify(reactions, null, 2)}

Banished Items (The Crypt of Ashes):
${banishedStr || 'None'}

Current Inventory:
${JSON.stringify(inventory.map(i => i.name + ' (' + i.category + ')'), null, 2)}
`;

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Please scry this prospective addition to my chamber: ${productInfo}` }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }
  const response = await res.json();
  return response.content[0].text;
}

/**
 * Perform a comprehensive evaluation of the user's entire routine ecosystem.
 * @param {Array} inventory - Current items in the Rootwork.
 * @param {Array} banishedItems - Items in the Crypt of Ashes.
 * @param {Array} ledgerEntries - Somatic reactions with zones and severities.
 * @param {Object} intakeAnswers - The user's intake profile goals and allergies.
 * @returns {Promise<string>} - The AI's holistic evaluation in the ritual voice (Markdown).
 */
export async function generateScryingEvaluation(inventory, banishedItems, ledgerEntries, intakeAnswers) {
  if (!anthropicApiKey) throw new Error('AI not configured. Please add an API key.');

  const systemPrompt = `You are the Scrying Pool, an oracle within Shadow & Sanctuary.
The user seeks a holistic divination of their entire routine ecosystem.
Analyze their active inventory, banished products, somatic reactions, and intake goals.
Output a comprehensive report formatted in Markdown that covers the following areas:

### Ingredient Patterns
Deduce exactly what common denominator ingredients are causing their reactions across banished products and the Ledger of Afflictions. Name the suspected offending ingredients directly.

### Goal Trajectory
Assess if their current routine is actively moving them toward their stated intake goals.

### Routine Optimization
Recommend removing steps or products they do not actually need (e.g. "you are using too many acids", or "you have overlapping moisturizers").

### Synergies
Suggest unowned product categories or specific unused inventory that would work synergistically with their routine.

### Correlations
Point out behavioral or systemic correlations (e.g., reacting to something due to applying it too frequently, or overlapping conflicts).

Speak in a mystical, cottagecore-goth tone ("ritual voice"). Be insightful, highly analytical, and direct.
Do not use gendered language or pronouns.`;

  const userContent = `Here is the current state of my ecosystem:

Intake Profile (Goals & Allergies):
${JSON.stringify(intakeAnswers, null, 2)}

Active Inventory:
${JSON.stringify(inventory.map(i => ({ name: i.name, category: i.category, ingredients: i.ingredients, state: i.lifecycle_state })), null, 2)}

Banished Items (Crypt of Ashes):
${JSON.stringify(banishedItems.map(i => ({ name: i.name, ingredients: i.ingredients, reason: i.banish_reason })), null, 2)}

Ledger of Afflictions (Somatic Reactions):
${JSON.stringify(ledgerEntries, null, 2)}

Please divine the truth in the water.`;

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userContent }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }
  const response = await res.json();
  return response.content[0].text;
}

/**
 * Analyzes a product and determines its glyph and flags.
 * @param {string} name 
 * @param {string} category 
 * @param {Array<string>} ingredients 
 */
export async function analyzeProduct(name, category, ingredients) {
  if (!anthropicApiKey) throw new Error('AI not configured.');

  const tools = [{
    name: 'save_product_analysis',
    description: 'Save the analyzed details of the product.',
    input_schema: {
      type: 'object',
      properties: {
        glyph: { type: 'string', description: 'Phosphor icon name without the ph- prefix (e.g. flask, test-tube, spray-bottle, drop). MUST BE a valid Phosphor icon name that best represents the physical nature of the object.' },
        risk_flags: {
          type: 'object',
          properties: {
            acid: { type: 'boolean' },
            retinoid: { type: 'boolean' },
            vitamin_c: { type: 'boolean' },
            exfoliant: { type: 'boolean' }
          }
        },
        behavior_flags: {
          type: 'object',
          properties: {
            requires_rinse: { type: 'boolean' },
            layering_weight: { type: 'integer', description: '1 (watery) to 10 (heavy balm/oil)' }
          }
        }
      },
      required: ['glyph', 'risk_flags', 'behavior_flags']
    }
  }];

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      tools: tools,
      tool_choice: { type: 'tool', name: 'save_product_analysis' },
      messages: [
        { role: 'user', content: `Analyze this cosmetic product:
Name: ${name}
Category: ${category}
Ingredients: ${ingredients.join(', ')}` }
      ]
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }
  const response = await res.json();

  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'save_product_analysis') {
      return block.input;
    }
  }
  
  throw new Error("Failed to extract product analysis.");
}

/**
 * Parses a tea image (loose leaf or box) using Claude Vision and extracts details.
 * @param {string} base64Image - The base64 string of the image
 * @param {string} mediaType - e.g. "image/jpeg"
 * @returns {Promise<Object>}
/**
 * Parses one or more tea images (loose leaf or box) using Claude Vision and extracts details.
 * @param {Array<{base64: string, mediaType: string}>} images
 * @returns {Promise<Object>}
 */
export async function parseTeaImage(images) {
  if (!anthropicApiKey) throw new Error('AI not configured. Please add an API key.');

  const tools = [
    {
      name: 'extract_tea_details',
      description: 'Extract herbal elixir/tea details from the image(s)',
      input_schema: {
        type: 'object',
        properties: {
          brand: { type: 'string', description: 'Brand or maker (if identifiable)' },
          name: { type: 'string', description: 'Name of the blend' },
          ingredients: { type: 'array', items: { type: 'string' }, description: 'List of herbs/ingredients identified from shapes/colors or read from the box label' },
          caffeine_content: { type: 'string', enum: ['High', 'Medium', 'Low', 'None'], description: 'Estimated caffeine content based on ingredients' },
          steep_time: { type: 'string', description: 'Recommended steeping time and temperature (e.g. "5 mins at 212°F")' },
          circadian_alignment: { type: 'string', enum: ['Daytime', 'Nighttime', 'Anytime'], description: 'Best time of day to consume based on ingredients' }
        },
        required: ['name', 'ingredients', 'caffeine_content', 'steep_time', 'circadian_alignment']
      }
    }
  ];

  const contentBlocks = images.map(img => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: img.mediaType,
      data: img.base64
    }
  }));

  contentBlocks.push({
    type: 'text',
    text: 'You are analyzing images of a tea or herbal elixir. It might be photos of loose leaf herbs, or photos of the front and back of a tea box/label. If it is loose leaf, analyze the shapes, sizes, and colors of the leaves, flowers, and bits to divine the ingredients. If it is a box, read the label (e.g. use the front for the name and the back for the ingredients). Extract the brand, blend name, ingredients list, estimated caffeine content, recommended steeping parameters, and circadian alignment (daytime vs nighttime use).'
  });

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: contentBlocks
        }
      ],
      tools: tools,
      tool_choice: { type: 'tool', name: 'extract_tea_details' }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${errText}`);
  }
  const response = await res.json();

  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'extract_tea_details') {
      return block.input;
    }
  }

  throw new Error("Failed to extract tea details from image");
}
