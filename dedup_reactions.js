import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envConfig = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
envConfig.split('\n').forEach(line => {
  if (line.includes('=')) {
    const parts = line.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    process.env[key] = value;
  }
});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("Loaded URL from .env:", supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'undefined');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
  console.log('--- STARTING REACTIONS MIGRATION DRY RUN ---');
  
  // 1. Fetch legacy reactions
  const { data: legacyReactions, error: legErr } = await supabase.from('reactions').select('*');
  if (legErr) {
    console.error("Error fetching legacy reactions (table might not exist):", legErr.message);
  }
  
  // 2. Fetch new somatic_reactions
  const { data: newReactions, error: newErr } = await supabase.from('somatic_reactions').select('*');
  if (newErr) {
    console.error("Error fetching somatic_reactions:", newErr.message);
  }

  const legacyCount = legacyReactions ? legacyReactions.length : 0;
  const newCount = newReactions ? newReactions.length : 0;
  
  console.log(`Current legacy 'reactions' row count: ${legacyCount}`);
  console.log(`Current 'somatic_reactions' row count: ${newCount}`);
  
  if (legacyCount > 0) {
    // 3. Deduplication Logic Preview
    const groupedByItem = {};
    legacyReactions.forEach(r => {
      if (!groupedByItem[r.item_id]) {
        groupedByItem[r.item_id] = [];
      }
      groupedByItem[r.item_id].push(r);
    });
    
    const recordsToInsert = [];
    
    for (const itemId in groupedByItem) {
      const records = groupedByItem[itemId];
      
      const consolidatedReactionsArray = records.map(r => ({
        type: r.reaction_type,
        date: r.created_at,
        legacy_id: r.id
      }));
      
      const allNotes = records.map(r => r.notes).filter(Boolean).join(' | ');
      
      recordsToInsert.push({
        item_id: itemId,
        reaction_type: 'legacy_import',
        zone: 'unknown',
        severity: 3,
        reactions: consolidatedReactionsArray,
        notes: allNotes || 'Imported from legacy reactions table',
        logged_at: new Date().toISOString()
      });
    }
    
    console.log(`\nDeduplication Logic:`);
    console.log(`- We found ${legacyCount} legacy rows.`);
    console.log(`- They belong to ${Object.keys(groupedByItem).length} unique items.`);
    console.log(`- We will INSERT ${recordsToInsert.length} new consolidated rows into somatic_reactions.`);
    console.log(`- The legacy 'reactions' table will be renamed to 'reactions_archive' (NOT DELETED).`);
    
    if (recordsToInsert.length > 0) {
      console.log('\nPreview of a consolidated record to be inserted:');
      console.log(JSON.stringify(recordsToInsert[0], null, 2));
    }
  } else {
     console.log(`\nNo legacy reactions found. Migration may not be necessary, or the table is empty.`);
  }
}

checkCounts();
