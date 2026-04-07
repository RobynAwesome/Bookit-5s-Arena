// Run this once with: node fix-sort-order.js
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Current Folder:', process.cwd());
console.log('Is the Database URI found?:', MONGODB_URI ? '✅ Yes' : '❌ No');

if (!MONGODB_URI) {
  console.error("Error: Could not find MONGODB_URI in your .env.local file!");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

const Court = mongoose.models.Court || mongoose.model('Court', new mongoose.Schema({
  name: String,
  sortOrder: Number,
}, { strict: false }));

// --- THIS WAS MISSING ---
const sortMap = {
  'Premier Court': 1,
  'Secondary Court': 2,
  'Third Court': 3,
  'Fourth Court': 4,
};
// ------------------------

for (const [name, order] of Object.entries(sortMap)) {
  const result = await Court.updateOne({ name }, { $set: { sortOrder: order } });
  console.log(`${name}: ${result.modifiedCount ? '✅ updated' : '⚠️ not found'}`);
}

await mongoose.disconnect();
console.log('Done!');
