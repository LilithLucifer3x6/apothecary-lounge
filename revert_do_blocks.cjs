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
  
  // Revert DO blocks back to CREATE TABLE IF NOT EXISTS
  // The structure is:
  // DO $$
  // BEGIN
  //   IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tableName') THEN
  //     CREATE TABLE tableName ( ...
  //   END IF;
  // END $$;
  
  const regex = /DO\s+\$\$\s*BEGIN\s*IF\s+NOT\s+EXISTS\s*\([^\)]+\)\s*THEN\s*CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?)^\s*END\s+IF;\s*END\s+\$\$;/gm;
  
  let matchesFound = 0;
  content = content.replace(regex, (match, tableName, body) => {
    matchesFound++;
    return `CREATE TABLE IF NOT EXISTS ${tableName} (${body}`;
  });

  if (matchesFound > 0) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Reverted ${matchesFound} DO blocks to CREATE TABLE IF NOT EXISTS in ${file}.`);
  }
}
