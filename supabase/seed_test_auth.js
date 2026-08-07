import { createClient } from '@supabase/supabase-js';

// Run with environment variables set:
// VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Aborting.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};

async function seedTestAuth() {
  console.log("Seeding test auth and data...");

  // 1. Create or get test user.
  // Note: this app is single-user with no per-row user scoping anywhere in
  // the schema (RLS policies are all "Allow all access", not auth.uid()
  // scoped) — so this auth user exists only to give Playwright a real JWT
  // to authenticate with. It is NOT referenced by a user_id column on any
  // table, because no such column exists.
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }

  const existingUser = usersData.users.find(u => u.email === TEST_USER.email);
  if (existingUser) {
    console.log(`User ${TEST_USER.email} already exists (ID: ${existingUser.id}). Deleting and recreating for clean state...`);
    await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
  }

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: TEST_USER.email,
    password: TEST_USER.password,
    email_confirm: true,
  });

  if (createError) {
    console.error("Error creating test user:", createError);
    return;
  }

  console.log(`Created test user ${TEST_USER.email} (ID: ${newUser.user.id})`);

  // 2. Insert mock inventory (items) — matches the real items schema
  // (001_core_schema.sql): category, not primary_category; no user_id.
  const items = [
    {
      name: 'Test Cleanser',
      brand: 'TestBrand',
      domain: 'Visage',
      category: 'Cleanser',
      item_type: 'consumable',
      lifecycle_state: 'stocked',
      application_zones: ['face-mid'],
      is_prescription: false,
      is_essential: true,
    },
    {
      name: 'Test Moisturizer',
      brand: 'TestBrand',
      domain: 'Visage',
      category: 'Moisturizer',
      item_type: 'consumable',
      lifecycle_state: 'stocked',
      application_zones: ['face-mid'],
      is_prescription: false,
      is_essential: true,
    }
  ];

  const { error: itemsError } = await supabaseAdmin.from('items').insert(items);
  if (itemsError) {
    console.error("Error inserting items:", itemsError);
  } else {
    console.log("Inserted test items.");
  }

  // 3. Insert mock journal entry — matches the real journal_entries schema:
  // entry_date (not date), body_text (not morning/evening_notes), no
  // weather column, no user_id. moon_phase/photos from 008 migration.
  const journalEntry = {
    entry_date: new Date().toISOString().split('T')[0],
    body_text: 'Test journal entry for Playwright.',
    moods: ['Calm'],
    moon_phase: 'Full Moon',
    photos: []
  };

  const { error: journalError } = await supabaseAdmin.from('journal_entries').insert([journalEntry]);
  if (journalError) {
    console.error("Error inserting journal entry:", journalError);
  } else {
    console.log("Inserted test journal entry.");
  }

  console.log("Test seed completed successfully.");
}

seedTestAuth();
