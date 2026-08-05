import os
import re

AI_ENGINE_PATH = 'c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js'
AI_SERVICE_PATH = 'c:/Users/purpl/apothecary-lounge/src/lib/ai-service.js'

# Update ai-engine.js
with open(AI_ENGINE_PATH, 'r', encoding='utf-8') as f:
    engine_code = f.read()

# Add constant and helper
helper_code = """export const ANTHROPIC_MODEL = 'claude-3-5-sonnet-20240620';

export async function invokeAnthropicProxy(body, retries = 2) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  for (let i = 0; i <= retries; i++) {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const { data, error } = await supabase.functions.invoke('anthropic-proxy', {
        headers: { Authorization: `Bearer ${apiKey}` },
        body: { model: ANTHROPIC_MODEL, ...body },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      if (error) throw error;
      if (!data) throw new Error("No data returned from Anthropic proxy.");
      return { data, error: null };
    } catch (err) {
      if (i === retries) return { data: null, error: err };
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
"""

engine_code = engine_code.replace("export function isAiReady() {", helper_code + "\nexport function isAiReady() {")

# Replace direct invocations in ai-engine.js
def replace_invoke_engine(match):
    return "const { data, error } = await invokeAnthropicProxy({\n" + match.group(1) + "    });"

engine_code = re.sub(
    r"const \{ data, error \} = await supabase\.functions\.invoke\('anthropic-proxy',\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{anthropicApiKey\}`\s*\},\s*body:\s*\{\s*model:\s*'claude-3-5-sonnet-20240620',\s*(.*?)\s*\}\s*\];\s*",
    # wait, the regex needs to be more robust
    r"ERROR",
    engine_code, flags=re.DOTALL
)
