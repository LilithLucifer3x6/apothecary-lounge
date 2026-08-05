import re

with open('c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add anthropicApiKey and initAnthropic
new_top = """import { supabase } from './supabase.js';

let anthropicApiKey = '';

export function initAnthropic(key) {
  anthropicApiKey = key;
  localStorage.setItem('al_anthropic_key', key);
}

const savedKey = localStorage.getItem('al_anthropic_key');
if (savedKey) {
  initAnthropic(savedKey);
}

export function isAiReady() {
  return !!anthropicApiKey;
}
"""

content = re.sub(r"import \{ supabase \} from '\./supabase\.js';.*?export function isAiReady\(\) \{\s*return !!anthropicApiKey;\s*\}", new_top, content, flags=re.DOTALL)

# Now, we need to pass the key in all `supabase.functions.invoke` calls.
# We replace `await supabase.functions.invoke('anthropic-proxy', {` 
# with `await supabase.functions.invoke('anthropic-proxy', { headers: { Authorization: `Bearer ${anthropicApiKey}` }, `

content = content.replace(
    "await supabase.functions.invoke('anthropic-proxy', {",
    "await supabase.functions.invoke('anthropic-proxy', { headers: { Authorization: `Bearer ${anthropicApiKey}` },"
)

with open('c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js', 'w', encoding='utf-8') as f:
    f.write(content)
