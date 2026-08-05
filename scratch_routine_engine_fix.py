import re

with open('c:/Users/purpl/apothecary-lounge/src/lib/routine-engine.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Refactor the name.includes checks in buildRoutines

# 1. Night specific items
content = content.replace(
    "if (cat.includes('sleeping mask') || name.includes('night')) {",
    "if (cat.includes('sleeping mask') || (item.behavior_flags && item.behavior_flags.night_only)) {"
)

# 2. Day specific items
content = content.replace(
    "if (cat.includes('sunscreen') || name.includes('spf') || name.includes('day')) {",
    "if (cat.includes('sunscreen') || cat.includes('spf') || (item.behavior_flags && item.behavior_flags.day_only)) {"
)

# 3. Drysol
content = content.replace(
    "if (name.includes('drysol')) {",
    "if (item.risk_flags && item.risk_flags.hyperhidrosis_treatment) {"
)

# Refactor checkConflicts
# 4. Drysol hard rule
content = content.replace(
    "const hasDrysol = items.some(i => i.name.toLowerCase().includes('drysol'));",
    "const hasDrysol = items.some(i => i.risk_flags && i.risk_flags.hyperhidrosis_treatment);"
)

# 5. Bath Ritual
content = content.replace(
    "const hasBathRitual = items.some(i => i.name.toLowerCase().includes('bath soak') || i.category.toLowerCase().includes('soak'));",
    "const hasBathRitual = items.some(i => (i.category || '').toLowerCase().includes('soak'));"
)

# 6. Witch Hazel
content = content.replace(
    "const hasWitchHazel = items.some(i => i.name.toLowerCase().includes('witch hazel'));",
    "const hasWitchHazel = items.some(i => i.risk_flags && i.risk_flags.astringent);"
)

with open('c:/Users/purpl/apothecary-lounge/src/lib/routine-engine.js', 'w', encoding='utf-8') as f:
    f.write(content)
