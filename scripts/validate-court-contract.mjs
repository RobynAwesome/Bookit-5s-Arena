import assert from 'node:assert/strict';
import Court from '../models/Court.js';
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

const requiredSchemaPaths = [
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

for (const path of requiredSchemaPaths) {
  assert.ok(Court.schema.path(path), `Court schema is missing expected path: ${path}`);
}

assert.equal(Court.schema.path('pricePerHour'), undefined);
assert.equal(Court.schema.path('images'), undefined);

console.log('court-contract: PASS');
console.log('canonical persisted price field: price_per_hour');
console.log('legacy aliases accepted only at normalization boundary: pricePerHour, images');
