const fs = require('fs');
const path = require('path');

const files = [
  'supabase_migration_full.sql',
  'migrations/001_missing_tables.sql',
  'supabase/migrations/001_core_schema.sql',
  'supabase/migrations/002_seed_data.sql',
  'supabase/migrations/003_shadowtome_elixirs.sql'
];

for (const file of files) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) continue;

  let content = fs.readFileSync(p, 'utf8');
  
  // Find CREATE POLICY "name" ON table
  const regex = /CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+([^\s]+)/gi;
  
  let match;
  let matchesFound = 0;
  
  content = content.replace(regex, (match, p1, p2) => {
    matchesFound++;
    return `DROP POLICY IF EXISTS "${p1}" ON ${p2};\n${match}`;
  });

  if (matchesFound > 0) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${matchesFound} policies in ${file}`);
  }
}
