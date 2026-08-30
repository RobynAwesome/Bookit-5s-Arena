export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/Court';
import { dispatchBookingCommunications } from '@/lib/bookings/dispatchBookingCommunications';
import { isAllowedBookingStartTime } from '@/lib/bookingSlots';

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// GET /api/bookings/:id — fetch a single booking (owner or admin)
export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(id).populate('court');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isOwner = Boolean(booking.user) && booking.user.toString() === session.user.id;
    if (!isOwner && !requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error('GET /api/bookings/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

// PUT /api/bookings/:id — edit a registered user's reservation (not within 8hrs)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(id)
      .populate('court')
      .populate('user', 'name email phone');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (!booking.court) {
      return NextResponse.json({ error: 'Booking court no longer exists' }, { status: 409 });
    }

    const ownerId = booking.user?._id?.toString?.() || booking.user?.toString?.();
    if (!ownerId || ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cancelled bookings cannot be edited' }, { status: 409 });
    }

    const [hours, minutes] = booking.start_time.split(':').map(Number);
    const bookingDateTime = new Date(
      `${booking.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    );
    const hoursUntil = (bookingDateTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntil < 8) {
      return NextResponse.json(
        { error: 'Cannot edit a booking within 8 hours of start time' },
        { status: 400 }
      );
    }

    const { date, start_time, duration } = await request.json();

    if (!date || !start_time || !duration) {
      return NextResponse.json(
        { error: 'Date, start time and duration are required' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      return NextResponse.json({ error: 'Bookings cannot be moved into the past' }, { status: 400 });
    }

    if (typeof duration !== 'number' || duration < 1 || duration > 3 || !Number.isInteger(duration)) {
      return NextResponse.json({ error: 'Duration must be 1, 2 or 3 hours' }, { status: 400 });
    }

    if (!isAllowedBookingStartTime(start_time, duration)) {
      return NextResponse.json(
        { error: 'Start time must be on the hour and the booking must finish by 22:00' },
        { status: 400 }
      );
    }

    const newStart = toMinutes(start_time);
    const newEnd = newStart + duration * 60;
    if (newStart < 10 * 60 || newEnd > 22 * 60) {
      return NextResponse.json(
        { error: 'Bookings must start at 10:00 and end by 22:00' },
        { status: 400 }
      );
    }

    // User-friendly overlap check. The stronger concurrent multi-hour invariant
    // is handled in the separate slot-lock remediation lane.
    const sameDayBookings = await Booking.find({
      court: booking.court._id,
      date,
      status: { $ne: 'cancelled' },
      _id: { $ne: id },
    }).select('start_time duration');

    const hasOverlap = sameDayBookings.some((existingBooking) => {
      const existingStart = toMinutes(existingBooking.start_time);
      const existingEnd = existingStart + existingBooking.duration * 60;
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'This slot is already booked. Choose a different time.' },
        { status: 409 }
      );
    }

    booking.date = date;
    booking.start_time = start_time;
    booking.duration = duration;
    booking.total_price = booking.court.price_per_hour * duration;
    booking.communicationRevision = Math.max(1, Number(booking.communicationRevision || 1)) + 1;
    await booking.save();

    const customerName = booking.user?.name || session.user.name || 'Player';
    const customerEmail = booking.contactEmail || booking.user?.email || session.user.email || null;
    const customerPhone = booking.contactPhone || booking.user?.phone || null;

    let communicationReceipts = [];
    try {
      communicationReceipts = await dispatchBookingCommunications({
        booking,
        court: booking.court,
        customerName,
        customerEmail,
        customerPhone,
        preferredChannel: booking.preferredChannel || 'whatsapp',
      });
    } catch (communicationError) {
      console.error('Booking updated but communication dispatch failed:', communicationError);
      communicationReceipts = [
        { status: 'failed', error: communicationError?.message || 'Communication dispatch failed' },
      ];
    }

    return NextResponse.json(
      { ...booking.toObject(), communicationReceipts },
      { status: 200 }
    );
  } catch (error) {
    console.error('PUT /api/bookings/:id error:', error);
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'That court slot has just been reserved. Please choose another time.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

// DELETE /api/bookings/:id — cancel a booking (owner or admin)
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;

    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isOwner = Boolean(booking.user) && booking.user.toString() === session.user.id;
    const isAdmin = requireRole(session, 'admin');
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorised to cancel this booking' },
        { status: 403 }
      );
    }

    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/bookings/:id error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
