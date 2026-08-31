import mongoose from 'mongoose';
import Booking from '@/models/Booking';
import BookingDayMutex from '@/models/BookingDayMutex';
import { bookingIntervalsOverlap } from '@/lib/bookingSlots';

export class BookingConflictError extends Error {
  constructor(message = 'This court is already booked during that time.') {
    super(message);
    this.name = 'BookingConflictError';
    this.code = 'BOOKING_CONFLICT';
  }
}

function isDuplicateKey(error) {
  return Number(error?.code) === 11000;
}

async function ensureDayMutex(courtId, date) {
  try {
    await BookingDayMutex.updateOne(
      { court: courtId, date },
      { $setOnInsert: { revision: 0 } },
      { upsert: true },
    );
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;
  }
}

async function acquireDayMutex(session, courtId, date) {
  const result = await BookingDayMutex.updateOne(
    { court: courtId, date },
    { $inc: { revision: 1 } },
    { session },
  );

  if (result.matchedCount !== 1) {
    throw new Error(`Booking day mutex missing for court=${courtId} date=${date}`);
  }
}

async function findOverlap(session, { courtId, date, start_time, duration, excludeBookingId = null }) {
  const query = {
    court: courtId,
    date,
    status: { $ne: 'cancelled' },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const sameDayBookings = await Booking.find(query)
    .session(session)
    .select('start_time duration')
    .lean();

  const requested = { start_time, duration };
  return sameDayBookings.some((booking) => bookingIntervalsOverlap(booking, requested));
}

export async function createBookingAtomically({ bookingData, idempotencyKey = null }) {
  const courtId = bookingData.court;
  const { date, start_time, duration } = bookingData;

  if (idempotencyKey) {
    const replay = await Booking.findOne({ idempotencyKey });
    if (replay) {
      return { booking: replay, replayed: true };
    }
  }

  await ensureDayMutex(courtId, date);

  const session = await mongoose.startSession();
  let booking = null;
  let replayed = false;

  try {
    await session.withTransaction(async () => {
      await acquireDayMutex(session, courtId, date);

      if (idempotencyKey) {
        const existing = await Booking.findOne({ idempotencyKey }).session(session);
        if (existing) {
          booking = existing;
          replayed = true;
          return;
        }
      }

      if (await findOverlap(session, { courtId, date, start_time, duration })) {
        throw new BookingConflictError();
      }

      const created = await Booking.create(
        [{ ...bookingData, idempotencyKey: idempotencyKey || null }],
        { session },
      );
      [booking] = created;
    });
  } catch (error) {
    if (idempotencyKey && isDuplicateKey(error)) {
      const replay = await Booking.findOne({ idempotencyKey });
      if (replay) {
        return { booking: replay, replayed: true };
      }
    }

    if (isDuplicateKey(error)) {
      throw new BookingConflictError();
    }

    throw error;
  } finally {
    await session.endSession();
  }

  return { booking, replayed };
}

export async function updateBookingAtomically({
  bookingId,
  courtId,
  previousDate,
  date,
  start_time,
  duration,
  total_price,
}) {
  const dayKeys = [...new Set([previousDate, date])].sort();

  for (const day of dayKeys) {
    await ensureDayMutex(courtId, day);
  }

  const session = await mongoose.startSession();
  let booking = null;

  try {
    await session.withTransaction(async () => {
      for (const day of dayKeys) {
        await acquireDayMutex(session, courtId, day);
      }

      if (await findOverlap(session, {
        courtId,
        date,
        start_time,
        duration,
        excludeBookingId: bookingId,
      })) {
        throw new BookingConflictError('This slot overlaps another booking. Choose a different time.');
      }

      booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          date,
          start_time,
          duration,
          total_price,
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!booking) {
        throw new Error('Booking disappeared during update');
      }
    });
  } catch (error) {
    if (isDuplicateKey(error)) {
      throw new BookingConflictError('This slot overlaps another booking. Choose a different time.');
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return booking;
}

export async function cancelBookingAtomically({ bookingId, courtId, date }) {
  await ensureDayMutex(courtId, date);

  const session = await mongoose.startSession();
  let booking = null;

  try {
    await session.withTransaction(async () => {
      await acquireDayMutex(session, courtId, date);
      booking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: 'cancelled' },
        { new: true, session },
      );

      if (!booking) {
        throw new Error('Booking disappeared during cancellation');
      }
    });
  } finally {
    await session.endSession();
  }

  return booking;
}
