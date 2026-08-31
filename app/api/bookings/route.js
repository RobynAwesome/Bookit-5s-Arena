export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import { sendBookingConfirmation } from '@/lib/sendBookingConfirmation';
import { sendResendConfirmation, isResendBookingConfirmationConfigured } from '@/lib/messaging/bookingResendConfirmation';
import { sendBookingWATip } from '@/lib/integrations/whatsapp';
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

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });

    await connectDB();
    const bookings = await Booking.find({ user: session.user.id })
      .populate('court', 'name image address price_per_hour bookingPolicy')
      .sort({ date: 1 })
      .lean();

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const botVerification = await verifyBotRequest();
    if (botVerification.isBot) {
      return NextResponse.json({ error: 'Automated booking attempts are blocked.' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to book a court' }, { status: 401 });
    }

    const { courtId, date, start_time, duration, payAtVenue } = await request.json();
    const idempotencyKey = request.headers.get('idempotency-key')?.trim() || null;

    if (!courtId || !date || !start_time || duration === undefined || duration === null) {
      return NextResponse.json({ error: 'Court, date, start time and duration are required' }, { status: 400 });
    }
    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Duration must be a positive whole number of hours.' }, { status: 400 });
    }

    await connectDB();
    const court = await Court.findById(courtId);
    if (!court) return NextResponse.json({ error: 'Court not found' }, { status: 404 });

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
    let booking;
    let replayed = false;

    try {
      const result = await createBookingAtomically({
        bookingData: {
          court: courtId,
          user: session.user.id,
          date,
          start_time,
          duration,
          total_price,
          status: 'pending',
          paymentStatus: payAtVenue ? 'reserved' : 'unpaid',
        },
        idempotencyKey,
      });
      booking = result.booking;
      replayed = result.replayed;
    } catch (bookingError) {
      if (bookingError instanceof BookingConflictError || bookingError?.code === 'BOOKING_CONFLICT') {
        return NextResponse.json({ error: bookingError.message }, { status: 409 });
      }
      throw bookingError;
    }

    if (!replayed) {
      try {
        let emailSent = false;
        if (isResendBookingConfirmationConfigured()) {
          const resendResponse = await sendResendConfirmation({
            id: booking._id.toString(),
            date,
            time: start_time,
            court: court.name,
            amount: total_price,
            type: 'confirmation',
          }, session.user.email);
          if (resendResponse.success) emailSent = true;
          else console.warn('Resend confirmation failed, falling back to Nodemailer:', resendResponse.error);
        }
        if (!emailSent) {
          await sendBookingConfirmation({
            to: session.user.email,
            name: session.user.name,
            courtName: court.name,
            date,
            start_time,
            duration,
            total_price,
          });
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    if (!replayed && session.user.phone) {
      try {
        await sendBookingWATip({
          to: session.user.phone,
          name: session.user.name,
          courtName: court.name,
          date,
          time: start_time,
        });
      } catch (waError) {
        console.error('Failed to send WhatsApp notification:', waError);
      }
    }

    const response = NextResponse.json(booking, { status: replayed ? 200 : 201 });
    response.headers.set('X-FivesArena-Idempotent-Replay', replayed ? 'true' : 'false');
    return response;
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
