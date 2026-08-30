export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import { dispatchBookingCommunications } from '@/lib/bookings/dispatchBookingCommunications';
import {
  createBookingWithOccupancy,
  isBookingOccupancyConflict,
  isBookingTransactionUnavailable,
} from '@/lib/bookings/bookingOccupancy';
import { rateLimit } from '@/lib/rateLimit';
import { verifyBotRequest } from '@/lib/security/botid';
import { isAllowedBookingStartTime } from '@/lib/bookingSlots';

const ALLOWED_CHANNELS = ['whatsapp', 'email', 'sms'];

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// POST /api/bookings/guest — reserve without login (pay at venue)
export async function POST(request) {
  try {
    const botVerification = await verifyBotRequest();
    if (botVerification.isBot) {
      return NextResponse.json({ error: 'Automated guest reservations are blocked.' }, { status: 403 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (rateLimit(ip, 5, 60000)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const {
      courtId,
      date,
      start_time,
      duration,
      guestName,
      guestEmail,
      guestPhone,
      preferredChannel = 'whatsapp',
    } = await request.json();

    if (!courtId || !date || !start_time || !duration) {
      return NextResponse.json({ error: 'Court, date, start time and duration are required.' }, { status: 400 });
    }
    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json({ error: 'Name, email and phone number are required for guest reservations.' }, { status: 400 });
    }
    if (!ALLOWED_CHANNELS.includes(preferredChannel)) {
      return NextResponse.json({ error: 'Preferred channel must be WhatsApp, Email or SMS.' }, { status: 400 });
    }

    if (!/^[a-fA-F0-9]{24}$/.test(courtId)) {
      return NextResponse.json({ error: 'Invalid court ID.' }, { status: 400 });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format.' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) {
      return NextResponse.json({ error: 'Bookings cannot be in the past.' }, { status: 400 });
    }

    if (typeof duration !== 'number' || duration < 1 || duration > 3 || !Number.isInteger(duration)) {
      return NextResponse.json({ error: 'Duration must be 1, 2 or 3 hours.' }, { status: 400 });
    }

    if (!isAllowedBookingStartTime(start_time, duration)) {
      return NextResponse.json(
        { error: 'Start time must be on the hour and the booking must finish by 22:00.' },
        { status: 400 }
      );
    }

    const cleanName = guestName.trim();
    const cleanEmail = guestEmail.trim().toLowerCase();
    const cleanPhone = guestPhone.replace(/\s/g, '').trim();

    if (typeof guestName !== 'string' || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!/^(\+27|0)[0-9]{9}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Please enter a valid South African phone number.' }, { status: 400 });
    }

    await connectDB();

    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found.' }, { status: 404 });
    }

    const newStart = toMinutes(start_time);
    const newEnd = newStart + duration * 60;
    if (newStart < 10 * 60 || newEnd > 22 * 60) {
      return NextResponse.json({ error: 'Bookings must start at 10:00 and end by 22:00.' }, { status: 400 });
    }

    // Fast rejection + untouched legacy-booking guard. BookingSlot remains the
    // final concurrency authority for all new/touched reservations.
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

    const booking = await createBookingWithOccupancy({
      court: courtId,
      guestName: cleanName,
      guestEmail: cleanEmail,
      guestPhone: cleanPhone,
      preferredChannel,
      contactEmail: cleanEmail,
      contactPhone: cleanPhone,
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
        customerName: cleanName,
        customerEmail: cleanEmail,
        customerPhone: cleanPhone,
        preferredChannel,
      });
    } catch (communicationError) {
      console.error('Guest booking persisted but communication dispatch failed:', communicationError);
      communicationReceipts = [
        { status: 'failed', error: communicationError?.message || 'Communication dispatch failed' },
      ];
    }

    return NextResponse.json(
      { ...booking.toObject(), communicationReceipts },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/bookings/guest error:', error);

    if (isBookingOccupancyConflict(error)) {
      return NextResponse.json(
        { error: 'That court time overlaps a reservation that was just secured. Please choose another slot.' },
        { status: 409 }
      );
    }

    if (isBookingTransactionUnavailable(error)) {
      return NextResponse.json(
        { error: 'The reservation safety lock is unavailable. No booking was created.' },
        { status: 503 }
      );
    }

    if (error?.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Reservation could not be processed. Please try again or contact us via WhatsApp.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again or contact us via WhatsApp.' },
      { status: 500 }
    );
  }
}
