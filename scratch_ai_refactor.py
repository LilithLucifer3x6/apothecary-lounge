import re

def process_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match the invoke call and the outer body envelope
    # We want to remove the supabase.functions.invoke envelope and the model line
    
    # First, let's just do a string replace for the start of the call
    content = re.sub(
        r"const \{ data, error \} = await supabase\.functions\.invoke\('anthropic-proxy',\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer \S+?`\s*\},\s*body:\s*\{",
        r"const { data, error } = await invokeAnthropicProxy({",
        content
    )
    
    # Also handle ai-service.js which uses apiKey instead of anthropicApiKey and has different formatting
    content = re.sub(
        r"const \{ data, error \} = await supabase\.functions\.invoke\('anthropic-proxy',\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer \$\{apiKey\}`\s*\},\s*body:\s*\{",
        r"const { data, error } = await invokeAnthropicProxy({",
        content
    )

    # Now remove the model line
    content = re.sub(r"model:\s*'claude-3-5-sonnet-20240620',\s*", "", content)
    
    # Now fix the closing braces of the invoke call
    # The original call ended with:
    #       }
    #     });
    # Since we removed the `body: {`, we only need one closing brace.
    # Actually, we can just look for `    });` after `invokeAnthropicProxy` and make sure it matches.
    # A simple regex for `      }\n    });` -> `    });`
    content = re.sub(r"      \}\n    \}\);", r"    });", content)
    
    return content

# 1. ai-engine.js
engine_path = 'c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js'
with open(engine_path, 'r', encoding='utf-8') as f:
    engine_content = f.read()

helper = """
export const ANTHROPIC_MODEL = 'claude-3-5-sonnet-20240620';

export async function invokeAnthropicProxy(body, retries = 2) {
  const apiKey = localStorage.getItem('al_anthropic_key') || '';
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
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

engine_content = engine_content.replace("export function isAiReady() {", helper + "\nexport function isAiReady() {")

with open(engine_path, 'w', encoding='utf-8') as f:
    f.write(engine_content)

# Apply regex to ai-engine.js
engine_content = process_file(engine_path)
with open(engine_path, 'w', encoding='utf-8') as f:
    f.write(engine_content)

# 2. ai-service.js
service_path = 'c:/Users/purpl/apothecary-lounge/src/lib/ai-service.js'
with open(service_path, 'r', encoding='utf-8') as f:
    service_content = f.read()

service_content = service_content.replace("import { supabase } from './supabase.js';", "import { supabase } from './supabase.js';\nimport { invokeAnthropicProxy } from './ai-engine.js';")
with open(service_path, 'w', encoding='utf-8') as f:
    f.write(service_content)

service_content = process_file(service_path)
# Clean up duplicate apiKey declarations in ai-service.js if any, but they are harmless.
with open(service_path, 'w', encoding='utf-8') as f:
    f.write(service_content)
