export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import { sendBookingConfirmation } from '@/lib/sendBookingConfirmation';
import { sendBookingWATip } from '@/lib/integrations/whatsapp';
import { rateLimit } from '@/lib/rateLimit';
import { verifyBotRequest } from '@/lib/security/botid';
import { isAllowedBookingStartTime } from '@/lib/bookingSlots';

// GET /api/bookings — get all bookings for the logged-in user
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();

    // .lean() returns plain JS objects (no Mongoose overhead) — faster for read-only list views
    const bookings = await Booking.find({ user: session.user.id })
      .populate('court', 'name image address price_per_hour')
      .sort({ date: 1 })
      .lean();

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

// POST /api/bookings — create a new booking
export async function POST(request) {
  try {
    const botVerification = await verifyBotRequest();
    if (botVerification.isBot) {
      return NextResponse.json({ error: 'Automated booking attempts are blocked.' }, { status: 403 });
    }

    // Rate limit: max 10 booking attempts per minute per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimit(ip, 10, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to book a court' }, { status: 401 });
    }

    const { courtId, date, start_time, duration, payAtVenue } = await request.json();

    if (!courtId || !date || !start_time || !duration) {
      return NextResponse.json(
        { error: 'Court, date, start time and duration are required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }

    // Validate duration is a number in allowed range
    if (typeof duration !== 'number' || duration < 1 || duration > 3 || !Number.isInteger(duration)) {
      return NextResponse.json({ error: 'Duration must be 1, 2 or 3 hours' }, { status: 400 });
    }

    await connectDB();

    // Check the court exists
    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    // Validate time window
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const OPEN_MINUTES = 10 * 60;   // 10:00
    const CLOSE_MINUTES = 22 * 60;  // 22:00

    if (!isAllowedBookingStartTime(start_time, duration)) {
      return NextResponse.json(
        { error: 'Start time must be on the hour and the booking must finish by 22:00.' },
        { status: 400 }
      );
    }

    const newStart = toMinutes(start_time);
    const newEnd = newStart + duration * 60;

    if (newStart < OPEN_MINUTES || newEnd > CLOSE_MINUTES) {
      return NextResponse.json(
        { error: 'Bookings must start at 10:00 and end by 22:00.' },
        { status: 400 }
      );
    }

    // Check for overlapping bookings on the same court and date
    const sameDayBookings = await Booking.find({
      court: courtId,
      date,
      status: { $ne: 'cancelled' },
    }).select('start_time duration');

    const hasOverlap = sameDayBookings.some((b) => {
      const existStart = toMinutes(b.start_time);
      const existEnd = existStart + b.duration * 60;
      return newStart < existEnd && newEnd > existStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'This court is already booked during that time. Please choose a different slot.' },
        { status: 409 }
      );
    }

    const total_price = court.price_per_hour * duration;

    const booking = await Booking.create({
      court: courtId,
      user: session.user.id,
      date,
      start_time,
      duration,
      total_price,
      status: 'pending',
      paymentStatus: payAtVenue ? 'reserved' : 'unpaid',
    });

    // Send confirmation email (non-blocking)
    try {
        await sendBookingConfirmation({
          to: session.user.email,
          name: session.user.name,
          courtName: court.name,
          date,
          start_time,
          duration,
          total_price,
        });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Phase 4: Send WhatsApp Notification (Non-blocking)
    if (session.user.phone) {
        try {
            await sendBookingWATip({
              to: session.user.phone,
              name: session.user.name,
              courtName: court.name,
              date,
              time: start_time
            });
        } catch (waError) {
            console.error('Failed to send WhatsApp notification:', waError);
        }
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
