export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import { rateLimit } from '@/lib/rateLimit';

const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// POST /api/bookings/guest — reserve without login (pay at venue)
export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const { courtId, date, start_time, duration, guestName, guestEmail, guestPhone } = await request.json();

    if (!courtId || !date || !start_time || !duration) {
      return NextResponse.json({ error: 'Court, date, start time and duration are required.' }, { status: 400 });
    }
    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: 'Name, email and phone number are required for guest reservations.' }, { status: 400 });
    }

    // Validate ObjectId format to prevent NoSQL injection
    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID.' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }

    // Validate start_time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(start_time)) {
      return NextResponse.json({ error: 'Invalid start time format.' }, { status: 400 });
    }

    // Validate duration is an integer in allowed range
    if (typeof duration !== 'number' || duration < 1 || duration > 3 || !Number.isInteger(duration)) {
      return NextResponse.json({ error: 'Duration must be 1, 2 or 3 hours.' }, { status: 400 });
    }

    // Validate guest name length
    if (typeof guestName !== 'string' || guestName.trim().length < 2 || guestName.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    // Basic phone validation (South African: 10 digits or +27...)
    if (!/^(\+27|0)[0-9]{9}$/.test(guestPhone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Please enter a valid South African phone number.' }, { status: 400 });
    }

    await connectDB();

    const court = await Court.findById(courtId);
    if (!court) return NextResponse.json({ error: 'Court not found.' }, { status: 404 });

    // Time validation
    const OPEN = 10 * 60;
    const CLOSE = 22 * 60;
    const newStart = toMinutes(start_time);
    const newEnd = newStart + duration * 60;
    if (newStart < OPEN || newEnd > CLOSE) {
      return NextResponse.json({ error: 'Bookings must start at 10:00 and end by 22:00.' }, { status: 400 });
    }

    // Overlap check
    const sameDayBookings = await Booking.find({ court: courtId, date, status: { $ne: 'cancelled' } }).select('start_time duration');
    const hasOverlap = sameDayBookings.some((b) => {
      const existStart = toMinutes(b.start_time);
      const existEnd = existStart + b.duration * 60;
      return newStart < existEnd && newEnd > existStart;
    });
    if (hasOverlap) {
      return NextResponse.json({ error: 'This court is already booked during that time. Please choose a different slot.' }, { status: 409 });
    }

    const total_price = court.price_per_hour * duration;

    // Build booking — omit `user` so Mongoose uses schema default (null)
    const booking = await Booking.create({
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
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings/guest error:', error);

    // Provide a cleaner user-facing message
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return NextResponse.json(
        { error: `Reservation could not be processed. Please try again or contact us via WhatsApp.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Something went wrong. Please try again or contact us via WhatsApp.' }, { status: 500 });
  }
}
