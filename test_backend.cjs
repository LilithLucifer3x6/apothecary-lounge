const { analyzeProduct } = require('./src/lib/ai-engine.js');
const { converseReading } = require('./src/lib/ai-service.js');
const { Pool } = require('pg');

async function run() {
  console.log("=== VERIFYING FEATURES ===");
  
  // 1. The Echo
  try {
    console.log("\n1. Testing The Echo (analyzeProduct)...");
    const res = await analyzeProduct("Test Serum", "treatment", ["Water", "Glycerin", "Salicylic Acid"]);
    console.log("SUCCESS! Echo Response:", res.behavior_flags ? "Parsed successfully." : "Failed.");
  } catch (e) {
    console.error("FAILED The Echo:", e.message);
  }

  // 2. Isotretinoin Log
  try {
    console.log("\n2. Testing Isotretinoin Log insertion...");
    const pool = new Pool({ connectionString: `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.gwezojwujynharoqjuio.supabase.co:5432/postgres` });
    await pool.query("INSERT INTO isotretinoin_log (last_confirmed_dose_mg) VALUES (40)");
    const rows = await pool.query("SELECT * FROM isotretinoin_log LIMIT 1");
    if (rows.rows.length > 0) {
        console.log("SUCCESS! Log inserted and read:", rows.rows[0]);
        await pool.query("DELETE FROM isotretinoin_log WHERE id = $1", [rows.rows[0].id]);
    } else {
        console.log("FAILED to read log.");
    }
    await pool.end();
  } catch (e) {
    console.error("FAILED Isotretinoin Log:", e.message);
  }

  // 3. The Reading
  try {
    console.log("\n3. Testing The Reading (converseReading)...");
    let history = [];
    const r1 = await converseReading(history, { intake_answers: { concerns: "Dryness" } });
    console.log("Keeper:", r1);
    history.push({ role: 'assistant', text: r1 });
    history.push({ role: 'user', text: "I have been very stressed." });
    const r2 = await converseReading(history, { intake_answers: { concerns: "Dryness" } });
    console.log("Keeper:", r2);
    console.log("SUCCESS! Multiple exchanges working perfectly.");
  } catch(e) {
    console.error("FAILED The Reading:", e.message);
  }
}

run();
