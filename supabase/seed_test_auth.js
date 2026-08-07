import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// This script should be run with environment variables set, e.g., 
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

  // 1. Create or get test user
  let userId;
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
  
  userId = newUser.user.id;
  console.log(`Created test user ${TEST_USER.email} (ID: ${userId})`);

  // 2. Insert mock inventory (items)
  const items = [
    {
      user_id: userId,
      name: 'Test Cleanser',
      brand: 'TestBrand',
      primary_category: 'Cleanser',
      item_type: 'consumable',
      lifecycle_state: 'stocked',
      application_zones: ['visage'],
      is_prescription: false,
      is_essential: true,
    },
    {
      user_id: userId,
      name: 'Test Moisturizer',
      brand: 'TestBrand',
      primary_category: 'Moisturizer',
      item_type: 'consumable',
      lifecycle_state: 'stocked',
      application_zones: ['visage'],
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

  // 3. Insert mock journal entry
  const journalEntry = {
    user_id: userId,
    date: new Date().toISOString(),
    weather: 'Clear',
    moon_phase: 'Full Moon',
    morning_notes: 'Test morning note',
    evening_notes: 'Test evening note',
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
