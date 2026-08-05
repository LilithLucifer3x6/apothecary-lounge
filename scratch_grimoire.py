import re

with open('c:/Users/purpl/apothecary-lounge/src/screens/Grimoire.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

block = """  const overrides = profile?.settings?.appointment_overrides || {};
  let retieAppt = appointments.find(a => a.type === 'retie');
  if (retieAppt && overrides['retie']) retieAppt = { ...retieAppt, date: overrides['retie'] };
  
  let nailsAppt = appointments.find(a => a.type === 'nails');
  if (nailsAppt && overrides['nails']) nailsAppt = { ...nailsAppt, date: overrides['nails'] };
"""

# Remove from bottom
content = content.replace(block + "\n  const wheelDays = [", "  const wheelDays = [")

# Insert before emptyDays
insertion_target = "  const emptyDays = [];\n  for (let i = 0; i < firstDay; i++) {"
content = content.replace(insertion_target, block + "\n" + insertion_target)

# Update hasRetie and hasNails
old_has_retie = "const hasRetie = appointments.some(app => new Date(app.date).getDate() === i && app.type === 'retie');"
new_has_retie = "const hasRetie = retieAppt && retieAppt.date && new Date(retieAppt.date).getDate() === i && new Date(retieAppt.date).getMonth() === month && new Date(retieAppt.date).getFullYear() === year;"

old_has_nails = "const hasNails = appointments.some(app => new Date(app.date).getDate() === i && app.type === 'nails');"
new_has_nails = "const hasNails = nailsAppt && nailsAppt.date && new Date(nailsAppt.date).getDate() === i && new Date(nailsAppt.date).getMonth() === month && new Date(nailsAppt.date).getFullYear() === year;"

content = content.replace(old_has_retie, new_has_retie)
content = content.replace(old_has_nails, new_has_nails)

with open('c:/Users/purpl/apothecary-lounge/src/screens/Grimoire.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
