import Anthropic from '@anthropic-ai/sdk';

let anthropic = null;

export function initAnthropic(apiKey) {
  anthropic = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // This is a single-user local app
  });
  localStorage.setItem('anthropic_api_key', apiKey);
}

const savedKey = localStorage.getItem('anthropic_api_key') || import.meta.env.VITE_ANTHROPIC_API_KEY;
if (savedKey) {
  initAnthropic(savedKey);
}

export function isAiReady() {
  return !!anthropic;
}

/**
 * Conducts the intake conversation and extracts answers when ready.
 * @param {Array<{role: string, content: string}>} messageHistory 
 * @returns {Promise<{ reply: string, extractedData: Object|null }>}
 */
export async function conductIntake(messageHistory) {
  if (!anthropic) throw new Error('AI not configured. Please add an API key.');

  const systemPrompt = `You are the keeper of The Apothecary Lounge, an entity guiding a user through The First Inscription (an onboarding ritual).
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
      name: 'finalize_intake',
      description: 'Call this when you have collected sufficient intake information or the user indicates they are finished.',
      input_schema: {
        type: 'object',
        properties: {
          concerns: { type: 'array', items: { type: 'string' } },
          conditions: { type: 'array', items: { type: 'string' } },
          traditions: { type: 'array', items: { type: 'string' } },
          prescriptions: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                name: { type: 'string' },
                strength: { type: 'string' },
                zone: { type: 'string' },
                frequency: { type: 'string' }
              }
            } 
          },
          orals: { type: 'array', items: { type: 'string' } },
          allergies: { type: 'array', items: { type: 'string' } }
        },
        required: ['concerns', 'conditions', 'traditions', 'prescriptions', 'orals', 'allergies']
      }
    }
  ];

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messageHistory,
    tools: tools
  });

  let textReply = "";
  let extractedData = null;

  for (const block of response.content) {
    if (block.type === 'text') {
      textReply += block.text;
    } else if (block.type === 'tool_use' && block.name === 'finalize_intake') {
      extractedData = block.input;
    }
  }

  return { reply: textReply, extractedData };
}

/**
 * Parses a product image using Claude Vision and extracts details.
 * @param {string} base64Image - The base64 string of the image (without the data prefix)
 * @param {string} mediaType - e.g. "image/jpeg"
 * @returns {Promise<Object>}
 */
export async function parseProductImage(base64Image, mediaType) {
  if (!anthropic) throw new Error('AI not configured. Please add an API key.');

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

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
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
  });

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
export async function evaluateScryingPool(productInfo, userProfile, inventory) {
  if (!anthropic) throw new Error('AI not configured. Please add an API key.');

  const systemPrompt = `You are the Scrying Pool, an oracle within The Apothecary Lounge.
The user seeks your wisdom on a prospective new product or formula.
Analyze the product against their known allergies, concerns, conditions, and current inventory.
Speak in a mystical, cottagecore-goth tone ("ritual voice"). Be concise but insightful.
Do not use gendered language or pronouns.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Current Inventory:
${JSON.stringify(inventory.map(i => i.name + ' (' + i.category + ')'), null, 2)}
`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Please scry this prospective addition to my chamber: ${productInfo}` }
    ]
  });

  return response.content.map(b => b.text).join('\n');
}

/**
 * Analyzes a product and determines its glyph and flags.
 * @param {string} name 
 * @param {string} category 
 * @param {Array<string>} ingredients 
 */
export async function analyzeProduct(name, category, ingredients) {
  if (!anthropic) throw new Error('AI not configured.');

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

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 500,
    tools: tools,
    tool_choice: { type: 'tool', name: 'save_product_analysis' },
    messages: [
      { role: 'user', content: `Analyze this cosmetic product:
Name: ${name}
Category: ${category}
Ingredients: ${ingredients.join(', ')}` }
    ]
  });

  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'save_product_analysis') {
      return block.input;
    }
  }
  
  throw new Error("Failed to extract product analysis.");
}
