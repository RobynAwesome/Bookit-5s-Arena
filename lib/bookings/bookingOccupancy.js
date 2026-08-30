import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import BookingSlot from '../../models/BookingSlot.js';
import { buildOccupiedStartTimes } from './bookingOccupancySlots.mjs';

const ACTIVE_START_INDEX_NAME = 'active_booking_start_unique';
let occupancyIndexPromise = null;

export class BookingOccupancyStateError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'BookingOccupancyStateError';
    this.code = code;
  }
}

function isStartTimeIndex(index) {
  const key = index?.key || {};
  return (
    key.court === 1 &&
    key.date === 1 &&
    key.start_time === 1 &&
    Object.keys(key).length === 3
  );
}

function isDesiredActiveStartIndex(index) {
  return (
    isStartTimeIndex(index) &&
    index?.name === ACTIVE_START_INDEX_NAME &&
    index?.unique === true &&
    index?.partialFilterExpression?.occupancyActive === true
  );
}

/**
 * Ensure the database itself carries the occupancy invariant before any write.
 *
 * Migration order matters:
 * 1. Create the Booking collection if this is a new environment.
 * 2. Build BookingSlot's hourly unique index first.
 * 3. Remove the legacy unconditional Booking start-time unique index.
 * 4. Create an active-booking-only start-time unique index.
 */
export async function ensureBookingOccupancyIndexes() {
  if (!occupancyIndexPromise) {
    occupancyIndexPromise = (async () => {
      try {
        await Booking.createCollection();
      } catch (error) {
        if (error?.code !== 48 && error?.codeName !== 'NamespaceExists') {
          throw error;
        }
      }

      await BookingSlot.createIndexes();

      const indexes = await Booking.collection.indexes();
      const desired = indexes.find(isDesiredActiveStartIndex);

      if (!desired) {
        const obsoleteStartIndexes = indexes.filter(isStartTimeIndex);
        for (const index of obsoleteStartIndexes) {
          try {
            await Booking.collection.dropIndex(index.name);
          } catch (error) {
            // Multiple serverless workers can race this idempotent migration.
            if (error?.code !== 27 && error?.codeName !== 'IndexNotFound') {
              throw error;
            }
          }
        }

        await Booking.collection.createIndex(
          { court: 1, date: 1, start_time: 1 },
          {
            unique: true,
            name: ACTIVE_START_INDEX_NAME,
            partialFilterExpression: { occupancyActive: true },
          }
        );
      }

      return true;
    })().catch((error) => {
      occupancyIndexPromise = null;
      throw error;
    });
  }

  return occupancyIndexPromise;
}

function buildSlotDocuments(booking) {
  return buildOccupiedStartTimes(booking.start_time, booking.duration).map((slotTime) => ({
    booking: booking._id,
    court: booking.court,
    date: booking.date,
    slot_time: slotTime,
  }));
}

async function replaceBookingSlots(booking, session) {
  await BookingSlot.deleteMany({ booking: booking._id }, { session });
  const slotDocuments = buildSlotDocuments(booking);
  await BookingSlot.insertMany(slotDocuments, { session, ordered: true });
}

async function deleteBookingSlots(bookingId, session) {
  await BookingSlot.deleteMany({ booking: bookingId }, { session });
}

async function runOccupancyTransaction(work) {
  await ensureBookingOccupancyIndexes();

  const session = await mongoose.startSession();
  try {
    let result = null;
    await session.withTransaction(
      async () => {
        result = await work(session);
      },
      {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      }
    );

    if (!result) {
      throw new Error('Booking occupancy transaction completed without a result.');
    }
    return result;
  } finally {
    await session.endSession();
  }
}

export function isBookingOccupancyConflict(error) {
  return (
    error?.code === 11000 ||
    error?.codeName === 'DuplicateKey' ||
    /booking_hourly_slot_unique|active_booking_start_unique/i.test(String(error?.message || ''))
  );
}

export function isBookingTransactionUnavailable(error) {
  const message = String(error?.message || '');
  return (
    error?.code === 20 ||
    /Transaction numbers are only allowed/i.test(message) ||
    /replica set member or mongos/i.test(message) ||
    /transactions are not supported/i.test(message)
  );
}

export async function createBookingWithOccupancy(bookingData) {
  return runOccupancyTransaction(async (session) => {
    const [booking] = await Booking.create(
      [
        {
          ...bookingData,
          occupancyActive: true,
        },
      ],
      { session }
    );

    await replaceBookingSlots(booking, session);
    return booking;
  });
}

export async function rescheduleBookingWithOccupancy({
  bookingId,
  date,
  start_time,
  duration,
  total_price,
}) {
  return runOccupancyTransaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new BookingOccupancyStateError('BOOKING_NOT_FOUND', 'Booking not found.');
    }
    if (booking.status === 'cancelled') {
      throw new BookingOccupancyStateError('BOOKING_CANCELLED', 'Cancelled bookings cannot be edited.');
    }

    booking.date = date;
    booking.start_time = start_time;
    booking.duration = duration;
    booking.total_price = total_price;
    booking.occupancyActive = true;
    booking.communicationRevision = Math.max(1, Number(booking.communicationRevision || 1)) + 1;

    await booking.save({ session });
    await replaceBookingSlots(booking, session);
    return booking;
  });
}

export async function cancelBookingWithOccupancy(bookingId) {
  return runOccupancyTransaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new BookingOccupancyStateError('BOOKING_NOT_FOUND', 'Booking not found.');
    }

    if (booking.status !== 'cancelled' || booking.occupancyActive !== false) {
      booking.status = 'cancelled';
      booking.occupancyActive = false;
      await booking.save({ session });
    }

    await deleteBookingSlots(booking._id, session);
    return booking;
  });
}

export async function setBookingStatusWithOccupancy(bookingId, nextStatus) {
  return runOccupancyTransaction(async (session) => {
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new BookingOccupancyStateError('BOOKING_NOT_FOUND', 'Booking not found.');
    }

    if (nextStatus === 'cancelled') {
      booking.status = 'cancelled';
      booking.occupancyActive = false;
      await booking.save({ session });
      await deleteBookingSlots(booking._id, session);
      return booking;
    }

    booking.status = nextStatus;
    booking.occupancyActive = true;
    await booking.save({ session });

    // Refreshing on every active status transition also backfills a legacy
    // booking that predates BookingSlot without creating a separate weak path.
    await replaceBookingSlots(booking, session);
    return booking;
  });
}
