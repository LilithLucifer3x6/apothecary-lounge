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
  
  // First, revert any CREATE TABLE IF NOT EXISTS back to CREATE TABLE
  content = content.replace(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/gi, 'CREATE TABLE');
  
  // Now, wrap CREATE TABLE statements in a DO block.
  // We need to match from CREATE TABLE <name> ( up to the closing );
  // This is a bit tricky with regex, so we'll do it carefully.
  
  const regex = /CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\(([\s\S]*?^\);)/gm;
  
  let matchesFound = 0;
  content = content.replace(regex, (match, tableName, body) => {
    matchesFound++;
    return `DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '${tableName}') THEN
    CREATE TABLE ${tableName} (${body}
  END IF;
END $$;`;
  });

  if (matchesFound > 0) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${matchesFound} tables in ${file} to use DO blocks.`);
  }
}
