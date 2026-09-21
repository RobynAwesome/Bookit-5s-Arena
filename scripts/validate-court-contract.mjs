import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeCourtPayload } from '../lib/courts/normalizeCourtPayload.js';

const canonicalInput = {
  name: 'Validation Court',
  description: 'Contract-only validation fixture',
  address: 'Validation address',
  capacity: 10,
  amenities: 'Floodlights, synthetic turf',
  availability: 'Confirm via authoritative slots source',
  price_per_hour: 400,
  image: '/images/courts/validation.jpg',
  sortOrder: 1,
};

const canonical = normalizeCourtPayload(canonicalInput);

assert.equal(canonical.name, canonicalInput.name);
assert.equal(canonical.price_per_hour, 400);
assert.equal(canonical.capacity, 10);
assert.equal(canonical.address, canonicalInput.address);
assert.equal(canonical.image, canonicalInput.image);
assert.equal(canonical.pricePerHour, undefined);
assert.equal(canonical.images, undefined);

const legacyAlias = normalizeCourtPayload({
  name: 'Legacy Alias Court',
  pricePerHour: '450',
  images: ['/images/courts/legacy.jpg'],
  amenities: ['Floodlights', 'Parking'],
});

assert.equal(legacyAlias.price_per_hour, 450);
assert.equal(legacyAlias.image, '/images/courts/legacy.jpg');
assert.equal(legacyAlias.amenities, 'Floodlights, Parking');

assert.throws(
  () => normalizeCourtPayload({ name: 'Missing Price' }),
  /price_per_hour is required/
);
assert.throws(
  () => normalizeCourtPayload({ name: 'Bad Capacity', price_per_hour: 400, capacity: 1 }),
  /capacity must be at least 2/
);

const courtModelSource = readFileSync(new URL('../models/Court.js', import.meta.url), 'utf8');
const requiredSchemaFields = [
  'owner',
  'name',
  'description',
  'address',
  'capacity',
  'amenities',
  'availability',
  'price_per_hour',
  'image',
  'sortOrder',
];

for (const field of requiredSchemaFields) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assert.match(
    courtModelSource,
    new RegExp(`\\b${escaped}\\s*:`),
    `Court schema source is missing expected field: ${field}`
  );
}

assert.doesNotMatch(courtModelSource, /\bpricePerHour\s*:/);
assert.doesNotMatch(courtModelSource, /\bimages\s*:/);

console.log('court-contract: PASS');
console.log('canonical persisted price field: price_per_hour');
console.log('legacy aliases accepted only at normalization boundary: pricePerHour, images');
