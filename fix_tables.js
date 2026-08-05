import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  
  // Find CREATE TABLE followed by table name
  // Exclude IF NOT EXISTS if already there
  const regex = /CREATE\s+TABLE\s+(?!IF\s+NOT\s+EXISTS\s+)([a-zA-Z0-9_]+)/gi;
  
  let matchesFound = 0;
  
  content = content.replace(regex, (match, tableName) => {
    matchesFound++;
    return `CREATE TABLE IF NOT EXISTS ${tableName}`;
  });

  if (matchesFound > 0) {
    fs.writeFileSync(p, content, 'utf8');
    console.log(`Updated ${matchesFound} tables in ${file}`);
  }
}
