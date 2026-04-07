/**
 * One-time migration: convert `role` (String) → `roles` (Array) on all User documents.
 * Run once with: node scripts/migrateRoles.js
 * Safe to run multiple times (idempotent).
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPER_ADMIN_EMAIL = 'rkholofelo@gmail.com';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in .env.local');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB');

const db = mongoose.connection.db;
const users = db.collection('users');

const total = await users.countDocuments();
console.log(`📋 Found ${total} user documents`);

let migrated = 0;
let skipped = 0;

const cursor = users.find({});
for await (const user of cursor) {
  const hasRoles = Array.isArray(user.roles) && user.roles.length > 0;
  const isSuper = user.email === SUPER_ADMIN_EMAIL;

  if (isSuper) {
    // Super admin always gets all 3 roles
    await users.updateOne(
      { _id: user._id },
      { $set: { roles: ['user', 'manager', 'admin'], role: 'admin' } }
    );
    console.log(`⭐ Super admin: ${user.email} → roles: ['user', 'manager', 'admin']`);
    migrated++;
    continue;
  }

  if (hasRoles) {
    skipped++;
    continue;
  }

  // Wrap existing role string in array
  const existingRole = user.role || 'user';
  const newRoles = existingRole === 'manager' ? ['user', 'manager'] : ['user'];

  await users.updateOne(
    { _id: user._id },
    { $set: { roles: newRoles } }
  );
  migrated++;
}

console.log(`\n✅ Migration complete: ${migrated} migrated, ${skipped} skipped (already had roles)`);
await mongoose.disconnect();
