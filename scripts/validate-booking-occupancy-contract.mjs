import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildOccupiedStartTimes,
  occupiedSlotsOverlap,
} from '../lib/bookings/bookingOccupancySlots.mjs';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

function requireSource(text, pattern, message) {
  assert.match(text, pattern, message);
}

function forbidSource(text, pattern, message) {
  assert.doesNotMatch(text, pattern, message);
}

// Pure slot law: these are the values the database unique index will own.
assert.deepEqual(buildOccupiedStartTimes('10:00', 1), ['10:00']);
assert.deepEqual(buildOccupiedStartTimes('10:00', 3), ['10:00', '11:00', '12:00']);
assert.deepEqual(buildOccupiedStartTimes('19:00', 3), ['19:00', '20:00', '21:00']);
assert.equal(occupiedSlotsOverlap('10:00', 2, '11:00', 1), true);
assert.equal(occupiedSlotsOverlap('10:00', 3, '12:00', 1), true);
assert.equal(occupiedSlotsOverlap('10:00', 1, '11:00', 1), false);
assert.throws(() => buildOccupiedStartTimes('10:30', 1));
assert.throws(() => buildOccupiedStartTimes('23:00', 2));

const [
  bookingModel,
  bookingSlotModel,
  occupancyHelper,
  registeredRoute,
  guestRoute,
  bookingDetailRoute,
  adminStatusRoute,
] = await Promise.all([
  source('models/Booking.js'),
  source('models/BookingSlot.js'),
  source('lib/bookings/bookingOccupancy.js'),
  source('app/api/bookings/route.js'),
  source('app/api/bookings/guest/route.js'),
  source('app/api/bookings/[id]/route.js'),
  source('app/api/admin/bookings/[id]/route.js'),
]);

requireSource(
  bookingSlotModel,
  /\{ court: 1, date: 1, slot_time: 1 \}[\s\S]*unique: true[\s\S]*booking_hourly_slot_unique/,
  'BookingSlot must uniquely own each court/date/hour.'
);
requireSource(
  occupancyHelper,
  /session\.withTransaction\(/,
  'Booking occupancy writes must execute inside a MongoDB transaction.'
);
requireSource(
  occupancyHelper,
  /BookingSlot\.insertMany\([\s\S]*session/,
  'Hourly locks must be inserted inside the transaction session.'
);
requireSource(
  occupancyHelper,
  /partialFilterExpression: \{ occupancyActive: true \}/,
  'Exact-start uniqueness must apply only to active occupancy.'
);
requireSource(
  occupancyHelper,
  /Booking\.collection\.dropIndex\(/,
  'The legacy unconditional start-time index must be migrated explicitly.'
);
forbidSource(
  bookingModel,
  /BookingSchema\.index\(\{ court: 1, date: 1, start_time: 1 \}, \{ unique: true \}\)/,
  'The cancelled-slot-blocking unconditional unique index must not remain in the schema.'
);

requireSource(registeredRoute, /createBookingWithOccupancy/, 'Registered booking creation must use atomic occupancy.');
forbidSource(registeredRoute, /Booking\.create\(/, 'Registered route must not bypass the occupancy engine.');
requireSource(guestRoute, /createBookingWithOccupancy/, 'Guest booking creation must use atomic occupancy.');
forbidSource(guestRoute, /Booking\.create\(/, 'Guest route must not bypass the occupancy engine.');
requireSource(bookingDetailRoute, /rescheduleBookingWithOccupancy/, 'Reschedule must replace locks atomically.');
requireSource(bookingDetailRoute, /cancelBookingWithOccupancy/, 'Cancellation must release locks atomically.');
requireSource(adminStatusRoute, /setBookingStatusWithOccupancy/, 'Admin status transitions must use occupancy governance.');
forbidSource(adminStatusRoute, /findByIdAndUpdate\(/, 'Admin status must not bypass slot-lock transitions.');

console.log(
  JSON.stringify(
    {
      contract: 'booking-occupancy',
      status: 'PASS',
      pureSlotExamples: {
        '10:00x3': buildOccupiedStartTimes('10:00', 3),
        overlap_10_12_vs_11_12: occupiedSlotsOverlap('10:00', 2, '11:00', 1),
        adjacent_10_11_vs_11_12: occupiedSlotsOverlap('10:00', 1, '11:00', 1),
      },
      governedMutations: [
        'registered-create',
        'guest-create',
        'reschedule',
        'cancel',
        'admin-status-transition',
      ],
    },
    null,
    2
  )
);
