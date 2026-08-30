import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Court from '../models/Court.js';
import Booking from '../models/Booking.js';
import BookingDelivery from '../models/BookingDelivery.js';
import BookingSlot from '../models/BookingSlot.js';
import { normalizeCourtPayload } from '../lib/courts/normalizeCourtPayload.js';
import { createBookingWithOccupancy } from '../lib/bookings/bookingOccupancy.js';
import { dispatchBookingCommunications } from '../lib/bookings/dispatchBookingCommunications.js';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required for the transaction integration witness.');
}

await mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10_000,
  maxPoolSize: 20,
});

try {
  await Promise.all([
    Court.deleteMany({}),
    Booking.deleteMany({}),
    BookingDelivery.deleteMany({}),
    BookingSlot.deleteMany({}),
  ]);
  await BookingDelivery.createIndexes();

  // 1. Authoritative Court source: use the same normalizer as POST /api/courts.
  const owner = new mongoose.Types.ObjectId();
  const courtPayload = normalizeCourtPayload({
    name: 'BMP Integration Court',
    description: 'Authoritative integration witness',
    address: 'Pringle Rd, Milnerton, Cape Town',
    capacity: 10,
    amenities: ['Floodlights', 'Synthetic turf'],
    availability: '10:00-22:00',
    price_per_hour: 420,
    image: 'court-integration.jpg',
    sortOrder: 1,
  });

  const court = await Court.create({ ...courtPayload, owner });
  const persistedCourt = await Court.findById(court._id).lean();
  assert.ok(persistedCourt, 'Canonical court must persist.');
  assert.equal(persistedCourt.price_per_hour, 420);
  assert.equal(persistedCourt.image, 'court-integration.jpg');
  assert.equal(persistedCourt.amenities, 'Floodlights, Synthetic turf');
  assert.equal(persistedCourt.pricePerHour, undefined);
  assert.equal(persistedCourt.images, undefined);

  // 2. Authoritative reservation: same atomic engine used by registered/guest APIs.
  const booking = await createBookingWithOccupancy({
    court: court._id,
    guestName: 'BMP Witness Player',
    guestEmail: 'player@example.test',
    guestPhone: '0821234567',
    preferredChannel: 'whatsapp',
    contactEmail: 'player@example.test',
    contactPhone: '0821234567',
    date: '2099-02-01',
    start_time: '18:00',
    duration: 2,
    total_price: court.price_per_hour * 2,
    status: 'pending',
    paymentStatus: 'reserved',
  });

  const slots = await BookingSlot.find({ booking: booking._id }).sort({ slot_time: 1 }).lean();
  assert.deepEqual(
    slots.map((slot) => slot.slot_time),
    ['18:00', '19:00'],
    'Reservation must own every occupied hour.'
  );

  // 3. Business visibility: mirror the authoritative admin query against Booking.
  const businessBookings = await Booking.find({})
    .populate('court', 'name price_per_hour')
    .sort({ date: -1, start_time: -1 })
    .lean();
  assert.equal(businessBookings.length, 1, 'Business booking view must see the persisted reservation.');
  assert.equal(String(businessBookings[0]._id), String(booking._id));
  assert.equal(businessBookings[0].court.name, court.name);
  assert.equal(businessBookings[0].paymentStatus, 'reserved');
  assert.equal(businessBookings[0].status, 'pending');

  // 4. Communication evidence: run the real dispatcher in explicit no-send mode.
  // CI sets WHATSAPP_SIMULATION=true and does not configure email providers.
  const communicationResults = await dispatchBookingCommunications({
    booking,
    court,
    customerName: 'BMP Witness Player',
    customerEmail: 'player@example.test',
    customerPhone: '0821234567',
    preferredChannel: 'whatsapp',
  });

  assert.equal(communicationResults.length, 4, 'WhatsApp-default reservation must create four logical communication results.');

  const receipts = await BookingDelivery.find({ booking: booking._id, revision: 1 })
    .sort({ recipientType: 1, channel: 1 })
    .lean();
  assert.equal(receipts.length, 4, 'Exactly four logical receipts must persist for revision 1.');

  const receiptKeys = new Set(
    receipts.map((receipt) => `${receipt.recipientType}:${receipt.channel}:${receipt.purpose}`)
  );
  for (const expected of [
    'user:email:reservation_receipt',
    'business:email:reservation_receipt',
    'business:whatsapp:reservation_notice',
    'user:whatsapp:reservation_notice',
  ]) {
    assert.equal(receiptKeys.has(expected), true, `Missing delivery receipt: ${expected}`);
  }

  assert.equal(
    receipts.some((receipt) => receipt.status === 'sent'),
    false,
    'No unconfigured/simulated provider may create sent evidence.'
  );
  assert.equal(
    receipts.every((receipt) => ['skipped', 'failed'].includes(receipt.status)),
    true,
    'Provider-offline evidence must remain skipped/failed.'
  );

  // Idempotency: retrying the same revision must update existing logical rows.
  await dispatchBookingCommunications({
    booking,
    court,
    customerName: 'BMP Witness Player',
    customerEmail: 'player@example.test',
    customerPhone: '0821234567',
    preferredChannel: 'whatsapp',
  });
  assert.equal(
    await BookingDelivery.countDocuments({ booking: booking._id, revision: 1 }),
    4,
    'Retry must not create duplicate logical delivery receipts.'
  );

  // 5. Later staff payment state: same field transition as admin payment route.
  const paidBooking = await Booking.findByIdAndUpdate(
    booking._id,
    { paymentStatus: 'paid' },
    { new: true }
  ).lean();
  assert.equal(paidBooking.paymentStatus, 'paid');
  assert.equal(paidBooking.status, 'pending', 'Recording payment must not silently rewrite reservation status.');
  assert.equal(
    await BookingSlot.countDocuments({ booking: booking._id }),
    2,
    'Payment-state change must not alter court occupancy.'
  );

  console.log(
    JSON.stringify(
      {
        witness: 'fivesarena-transaction-integration',
        status: 'PASS',
        bookingId: String(booking._id),
        assertions: {
          canonical_court_persisted: true,
          atomic_reservation_persisted: true,
          occupied_hours: ['18:00', '19:00'],
          business_visibility_same_booking_id: true,
          communication_receipts: 4,
          simulated_or_unconfigured_sent_receipts: 0,
          delivery_retry_duplicate_rows: 0,
          later_staff_payment_state: 'paid',
          payment_does_not_change_occupancy: true,
        },
      },
      null,
      2
    )
  );
} finally {
  await mongoose.disconnect();
}
