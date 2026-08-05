import re

with open('c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import if not exists
if "import { supabase }" not in content:
    content = "import { supabase } from './supabase.js';\n" + content

content = re.sub(
    r"const res = await fetch\('https://api\.anthropic\.com/v1/messages', \{\s*method:\s*'POST',\s*headers:\s*\{[^}]+\},\s*body:\s*JSON\.stringify\((.*?)\)\s*\}\);",
    r"const { data, error } = await supabase.functions.invoke('anthropic-proxy', {\n    body: \1\n  });\n  if (error) throw error;\n  const response = data;\n  // removed res.ok check since error handles it",
    content,
    flags=re.DOTALL
)

# Remove the res.ok check block that usually follows
content = re.sub(
    r"if \(!res\.ok\) \{[^}]+\}\s*const response = await res\.json\(\);",
    r"",
    content,
    flags=re.DOTALL
)
# Clean up duplicate const response = data; if we have them
content = content.replace("const response = data;\n  // removed res.ok check since error handles it\n\n\n  for (const block of response.content)", "const response = data;\n  for (const block of response.content)")
content = content.replace("const response = data;\n  // removed res.ok check since error handles it\n\n\n  return response.content[0].text;", "const response = data;\n  return response.content[0].text;")
content = content.replace("const response = data;\n  // removed res.ok check since error handles it\n\n\n  for (const block", "const response = data;\n  for (const block")

# Also need to remove the `anthropicApiKey` check at the top of functions
content = re.sub(r"if \(!anthropicApiKey\) throw new Error\('AI not configured[^']*'\);", "", content)

# Remove the global let anthropicApiKey and initAnthropic
content = re.sub(r"let anthropicApiKey = null;", "", content)
content = re.sub(r"export function initAnthropic\([^)]*\) \{[^}]*\}", "", content)

# Write it back
with open('c:/Users/purpl/apothecary-lounge/src/lib/ai-engine.js', 'w', encoding='utf-8') as f:
    f.write(content)
