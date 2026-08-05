const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'supabase/migrations/001_core_schema.sql');
let content = fs.readFileSync(file, 'utf8');

// Replace table name and policy names
content = content.replace(/CREATE TABLE IF NOT EXISTS reactions/g, 'CREATE TABLE IF NOT EXISTS somatic_reactions');
content = content.replace(/ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;/g, 'ALTER TABLE somatic_reactions ENABLE ROW LEVEL SECURITY;');
content = content.replace(/ON reactions;/g, 'ON somatic_reactions;');
content = content.replace(/ON reactions FOR ALL/g, 'ON somatic_reactions FOR ALL');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed reactions in 001_core_schema.sql');
