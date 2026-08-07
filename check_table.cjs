const { Pool } = require('pg');


const connectionString = `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.gwezojwujynharoqjuio.supabase.co:5432/postgres`;

const pool = new Pool({
  connectionString,
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM isotretinoin_log LIMIT 1");
    console.log("Table exists! Rows:", res.rows);
  } catch (err) {
    console.error("Error querying table:", err);
  } finally {
    await pool.end();
  }
}

check();
