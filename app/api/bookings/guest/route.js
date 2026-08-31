export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';
import { rateLimit } from '@/lib/rateLimit';
import { verifyBotRequest } from '@/lib/security/botid';
import {
  isAllowedBookingStartTime,
  resolveBookingPolicy,
} from '@/lib/bookingSlots';
import {
  BookingConflictError,
  createBookingAtomically,
} from '@/lib/booking/bookingPersistence';

export async function POST(request) {
  try {
    const botVerification = await verifyBotRequest();
    if (botVerification.isBot) {
      return NextResponse.json({ error: 'Automated guest reservations are blocked.' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { courtId, date, start_time, duration, guestName, guestEmail, guestPhone } = await request.json();
    const idempotencyKey = request.headers.get('idempotency-key')?.trim() || null;

    if (!courtId || !date || !start_time || duration === undefined || duration === null) {
      return NextResponse.json({ error: 'Court, date, start time and duration are required.' }, { status: 400 });
    }
    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: 'Name, email and phone number are required for guest reservations.' }, { status: 400 });
    }
    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID.' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Duration must be a positive whole number of hours.' }, { status: 400 });
    }
    if (typeof guestName !== 'string' || guestName.trim().length < 2 || guestName.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!/^(\+27|0)[0-9]{9}$/.test(guestPhone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Please enter a valid South African phone number.' }, { status: 400 });
    }

    await connectDB();
    const court = await Court.findById(courtId);
    if (!court) return NextResponse.json({ error: 'Court not found.' }, { status: 404 });

    const policy = resolveBookingPolicy(court.bookingPolicy);
    if (!isAllowedBookingStartTime(start_time, duration, policy)) {
      return NextResponse.json({
        error: 'That start time or duration is outside this court’s configured booking policy.',
        policy: {
          openTime: policy.openTime,
          closeTime: policy.closeTime,
          slotMinutes: policy.slotMinutes,
          minDurationHours: policy.minDurationHours,
          maxDurationHours: policy.maxDurationHours,
        },
      }, { status: 400 });
    }

    const total_price = court.price_per_hour * duration;

    try {
      const { booking, replayed } = await createBookingAtomically({
        bookingData: {
          court: courtId,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim().toLowerCase(),
          guestPhone: guestPhone.trim(),
          date,
          start_time,
          duration,
          total_price,
          status: 'pending',
          paymentStatus: 'reserved',
        },
        idempotencyKey,
      });

      const response = NextResponse.json(booking, { status: replayed ? 200 : 201 });
      response.headers.set('X-FivesArena-Idempotent-Replay', replayed ? 'true' : 'false');
      return response;
    } catch (bookingError) {
      if (bookingError instanceof BookingConflictError || bookingError?.code === 'BOOKING_CONFLICT') {
        return NextResponse.json({ error: bookingError.message }, { status: 409 });
      }
      throw bookingError;
    }
  } catch (error) {
    console.error('POST /api/bookings/guest error:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: 'Reservation could not be processed. Please try again or contact us via WhatsApp.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again or contact us via WhatsApp.' }, { status: 500 });
  }
}
