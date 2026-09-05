import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import BookingSlot from '../models/BookingSlot.js';
import {
  cancelBookingWithOccupancy,
  createBookingWithOccupancy,
  isBookingOccupancyConflict,
  rescheduleBookingWithOccupancy,
  setBookingStatusWithOccupancy,
} from '../lib/bookings/bookingOccupancy.js';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI is required for the Mongo occupancy witness.');
}

const makeBooking = ({ court, date, start_time, duration }) => ({
  court,
  date,
  start_time,
  duration,
  total_price: 100 * duration,
  status: 'pending',
  paymentStatus: 'reserved',
});

async function clearData() {
  await Promise.all([
    Booking.deleteMany({}),
    BookingSlot.deleteMany({}),
  ]);
}

async function slotsFor(bookingId) {
  return BookingSlot.find({ booking: bookingId }).sort({ slot_time: 1 }).lean();
}

await mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10_000,
  maxPoolSize: 20,
});

try {
  await clearData();

  // 1. Real concurrent overlap: exactly one transaction may win.
  const raceCourt = new mongoose.Types.ObjectId();
  const raceDate = '2099-01-10';
  const race = await Promise.allSettled([
    createBookingWithOccupancy(
      makeBooking({ court: raceCourt, date: raceDate, start_time: '10:00', duration: 2 })
    ),
    createBookingWithOccupancy(
      makeBooking({ court: raceCourt, date: raceDate, start_time: '11:00', duration: 1 })
    ),
  ]);

  const winners = race.filter((result) => result.status === 'fulfilled');
  const losers = race.filter((result) => result.status === 'rejected');
  assert.equal(winners.length, 1, 'Exactly one overlapping concurrent booking must commit.');
  assert.equal(losers.length, 1, 'Exactly one overlapping concurrent booking must conflict.');
  assert.equal(
    isBookingOccupancyConflict(losers[0].reason),
    true,
    'The losing transaction must be classified as an occupancy conflict.'
  );
  assert.equal(await Booking.countDocuments({ court: raceCourt, date: raceDate }), 1, 'No orphan losing Booking may survive.');

  const raceWinner = winners[0].value;
  const winnerSlots = await slotsFor(raceWinner._id);
  assert.equal(winnerSlots.length, raceWinner.duration, 'Winner must own every occupied hour.');

  // 2. Cancellation releases occupancy and exact start time can be reused.
  await cancelBookingWithOccupancy(raceWinner._id);
  const cancelledWinner = await Booking.findById(raceWinner._id).lean();
  assert.equal(cancelledWinner.status, 'cancelled');
  assert.equal(cancelledWinner.occupancyActive, false);
  assert.equal(await BookingSlot.countDocuments({ booking: raceWinner._id }), 0, 'Cancellation must release every hourly row.');

  const replacement = await createBookingWithOccupancy(
    makeBooking({
      court: raceCourt,
      date: raceDate,
      start_time: raceWinner.start_time,
      duration: 1,
    })
  );
  assert.equal(replacement.start_time, raceWinner.start_time, 'Exact cancelled start time must be reusable.');

  // 3. Failed reschedule must preserve original Booking + original slot ownership.
  const moveCourt = new mongoose.Types.ObjectId();
  const moveDate = '2099-01-11';
  const blocker = await createBookingWithOccupancy(
    makeBooking({ court: moveCourt, date: moveDate, start_time: '10:00', duration: 2 })
  );
  const movable = await createBookingWithOccupancy(
    makeBooking({ court: moveCourt, date: moveDate, start_time: '13:00', duration: 1 })
  );

  await assert.rejects(
    () =>
      rescheduleBookingWithOccupancy({
        bookingId: movable._id,
        date: moveDate,
        start_time: '11:00',
        duration: 1,
        total_price: 100,
      }),
    (error) => isBookingOccupancyConflict(error),
    'Overlapping reschedule must reject with an occupancy conflict.'
  );

  const movableAfterConflict = await Booking.findById(movable._id).lean();
  assert.equal(movableAfterConflict.start_time, '13:00', 'Failed reschedule must preserve original start time.');
  const movableSlotsAfterConflict = await slotsFor(movable._id);
  assert.deepEqual(
    movableSlotsAfterConflict.map((slot) => slot.slot_time),
    ['13:00'],
    'Failed reschedule must preserve original hourly lock.'
  );
  assert.equal(await BookingSlot.countDocuments({ booking: blocker._id }), 2);

  // 4. Cancelled restore must fail if a released hour was taken later.
  const restoreCourt = new mongoose.Types.ObjectId();
  const restoreDate = '2099-01-12';
  const original = await createBookingWithOccupancy(
    makeBooking({ court: restoreCourt, date: restoreDate, start_time: '15:00', duration: 2 })
  );
  await cancelBookingWithOccupancy(original._id);
  const newOwner = await createBookingWithOccupancy(
    makeBooking({ court: restoreCourt, date: restoreDate, start_time: '15:00', duration: 1 })
  );
  assert.ok(newOwner._id);

  await assert.rejects(
    () => setBookingStatusWithOccupancy(original._id, 'pending'),
    (error) => isBookingOccupancyConflict(error),
    'Restore must conflict if any released hour has been rebooked.'
  );

  const originalAfterRestoreConflict = await Booking.findById(original._id).lean();
  assert.equal(originalAfterRestoreConflict.status, 'cancelled', 'Failed restore must roll status back to cancelled.');
  assert.equal(originalAfterRestoreConflict.occupancyActive, false, 'Failed restore must remain non-occupying.');
  assert.equal(await BookingSlot.countDocuments({ booking: original._id }), 0, 'Failed restore must not leave partial locks.');

  // 5. Adjacency remains legal.
  const adjacentCourt = new mongoose.Types.ObjectId();
  const adjacentDate = '2099-01-13';
  const adjacentA = await createBookingWithOccupancy(
    makeBooking({ court: adjacentCourt, date: adjacentDate, start_time: '18:00', duration: 1 })
  );
  const adjacentB = await createBookingWithOccupancy(
    makeBooking({ court: adjacentCourt, date: adjacentDate, start_time: '19:00', duration: 1 })
  );
  assert.ok(adjacentA._id && adjacentB._id, 'Adjacent non-overlapping bookings must both commit.');

  console.log(
    JSON.stringify(
      {
        witness: 'booking-occupancy-mongodb-replica-set',
        status: 'PASS',
        assertions: {
          concurrent_overlap: 'one-commit-one-conflict',
          orphan_loser_booking: false,
          cancellation_releases_slots: true,
          cancelled_exact_start_reusable: true,
          failed_reschedule_rolls_back: true,
          failed_restore_rolls_back: true,
          adjacent_slots_allowed: true,
        },
      },
      null,
      2
    )
  );
} finally {
  await mongoose.disconnect();
}
