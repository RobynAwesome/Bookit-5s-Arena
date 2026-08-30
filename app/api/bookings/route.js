export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import User from '@/models/User';
import { dispatchBookingCommunications } from '@/lib/bookings/dispatchBookingCommunications';
import { rateLimit } from '@/lib/rateLimit';
import { verifyBotRequest } from '@/lib/security/botid';
import { isAllowedBookingStartTime } from '@/lib/bookingSlots';

const ALLOWED_CHANNELS = ['whatsapp', 'email', 'sms'];

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const normalizePhone = (value) => String(value || '').replace(/\s/g, '').trim();
const isValidSouthAfricanPhone = (value) => /^(\+27|0)[0-9]{9}$/.test(value);

// GET /api/bookings — get all bookings for the logged-in user
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();

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

// POST /api/bookings — create a pay-at-venue reservation for a registered user
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

    const body = await request.json();
    const {
      courtId,
      date,
      start_time,
      duration,
      payAtVenue,
      preferredChannel = 'whatsapp',
      contactPhone,
    } = body;

    if (!courtId || !date || !start_time || !duration) {
      return NextResponse.json(
        { error: 'Court, date, start time and duration are required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_CHANNELS.includes(preferredChannel)) {
      return NextResponse.json({ error: 'Preferred channel must be WhatsApp, Email or SMS.' }, { status: 400 });
    }

    if (payAtVenue !== undefined && payAtVenue !== true) {
      return NextResponse.json(
        { error: 'Online payment is not active. Court reservations are currently pay at venue.' },
        { status: 400 }
      );
    }

    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }

    if (typeof duration !== 'number' || duration < 1 || duration > 3 || !Number.isInteger(duration)) {
      return NextResponse.json({ error: 'Duration must be 1, 2 or 3 hours' }, { status: 400 });
    }

    if (!isAllowedBookingStartTime(start_time, duration)) {
      return NextResponse.json(
        { error: 'Start time must be on the hour and the booking must finish by 22:00.' },
        { status: 400 }
      );
    }

    await connectDB();

    const [court, user] = await Promise.all([
      Court.findById(courtId),
      User.findById(session.user.id).select('name email phone').lean(),
    ]);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    const resolvedPhone = normalizePhone(contactPhone || user.phone);
    if (resolvedPhone && !isValidSouthAfricanPhone(resolvedPhone)) {
      return NextResponse.json({ error: 'Please provide a valid South African phone number.' }, { status: 400 });
    }
    if ((preferredChannel === 'whatsapp' || preferredChannel === 'sms') && !resolvedPhone) {
      return NextResponse.json(
        { error: `${preferredChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} requires a phone number.` },
        { status: 400 }
      );
    }

    const newStart = toMinutes(start_time);
    const newEnd = newStart + duration * 60;
    if (newStart < 10 * 60 || newEnd > 22 * 60) {
      return NextResponse.json(
        { error: 'Bookings must start at 10:00 and end by 22:00.' },
        { status: 400 }
      );
    }

    const sameDayBookings = await Booking.find({
      court: courtId,
      date,
      status: { $ne: 'cancelled' },
    }).select('start_time duration');

    const hasOverlap = sameDayBookings.some((booking) => {
      const existingStart = toMinutes(booking.start_time);
      const existingEnd = existingStart + booking.duration * 60;
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'This court is already booked during that time. Please choose a different slot.' },
        { status: 409 }
      );
    }

    const total_price = court.price_per_hour * duration;

    // Authoritative reservation first. Communication happens only after this
    // document exists and is therefore visible to the admin booking query.
    const booking = await Booking.create({
      court: courtId,
      user: session.user.id,
      preferredChannel,
      contactEmail: user.email,
      contactPhone: resolvedPhone || null,
      date,
      start_time,
      duration,
      total_price,
      status: 'pending',
      paymentStatus: 'reserved',
    });

    let communicationReceipts = [];
    try {
      communicationReceipts = await dispatchBookingCommunications({
        booking,
        court,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: resolvedPhone,
        preferredChannel,
      });
    } catch (communicationError) {
      console.error('Booking persisted but communication dispatch failed:', communicationError);
      communicationReceipts = [
        { status: 'failed', error: communicationError?.message || 'Communication dispatch failed' },
      ];
    }

    return NextResponse.json(
      { ...booking.toObject(), communicationReceipts },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'That court slot has just been reserved. Please choose another time.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
