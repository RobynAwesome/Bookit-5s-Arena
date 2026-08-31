export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/Court';
import { sendBookingConfirmation } from '@/lib/sendBookingConfirmation';
import { sendResendConfirmation, isResendBookingConfirmationConfigured } from '@/lib/messaging/bookingResendConfirmation';
import {
  isAllowedBookingStartTime,
  minutesUntilBookingStart,
  resolveBookingPolicy,
} from '@/lib/bookingSlots';
import {
  BookingConflictError,
  cancelBookingAtomically,
  updateBookingAtomically,
} from '@/lib/booking/bookingPersistence';

export async function GET(request, { params }) {
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

    const isOwner = booking.user && booking.user.toString() === session.user.id;
    if (!isOwner && !requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error('GET /api/bookings/:id error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

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
    const booking = await Booking.findById(id).populate('court');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isOwner = booking.user && booking.user.toString() === session.user.id;
    if (!isOwner) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    const policy = resolveBookingPolicy(booking.court?.bookingPolicy);
    if (policy.editCutoffMinutes > 0) {
      const minutesUntil = minutesUntilBookingStart(
        booking.date,
        booking.start_time,
        policy,
      );

      if (minutesUntil === null) {
        return NextResponse.json({ error: 'Stored booking time is invalid.' }, { status: 409 });
      }

      if (minutesUntil < policy.editCutoffMinutes) {
        return NextResponse.json(
          {
            error: `This court does not allow online edits within ${policy.editCutoffMinutes} minutes of the booked start time.`,
          },
          { status: 400 },
        );
      }
    }

    const { date, start_time, duration } = await request.json();

    if (!date || !start_time || duration === undefined || duration === null) {
      return NextResponse.json(
        { error: 'Date, start time and duration are required' },
        { status: 400 },
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      return NextResponse.json({ error: 'Bookings cannot be moved into the past.' }, { status: 400 });
    }

    if (!Number.isInteger(duration) || duration <= 0) {
      return NextResponse.json(
        { error: 'Duration must be a positive whole number of hours.' },
        { status: 400 },
      );
    }

    if (!isAllowedBookingStartTime(start_time, duration, policy)) {
      return NextResponse.json(
        {
          error: 'That start time or duration is outside this court’s configured booking policy.',
          policy: {
            openTime: policy.openTime,
            closeTime: policy.closeTime,
            slotMinutes: policy.slotMinutes,
            minDurationHours: policy.minDurationHours,
            maxDurationHours: policy.maxDurationHours,
          },
        },
        { status: 400 },
      );
    }

    const totalPrice = booking.court.price_per_hour * duration;

    let updatedBooking;
    try {
      updatedBooking = await updateBookingAtomically({
        bookingId: booking._id,
        courtId: booking.court._id,
        previousDate: booking.date,
        date,
        start_time,
        duration,
        total_price: totalPrice,
      });
    } catch (bookingError) {
      if (bookingError instanceof BookingConflictError || bookingError?.code === 'BOOKING_CONFLICT') {
        return NextResponse.json({ error: bookingError.message }, { status: 409 });
      }
      throw bookingError;
    }

    try {
      let emailSent = false;
      if (isResendBookingConfirmationConfigured()) {
        const resendResponse = await sendResendConfirmation({
          id: updatedBooking._id.toString(),
          date: updatedBooking.date,
          time: updatedBooking.start_time,
          court: booking.court.name,
          amount: updatedBooking.total_price,
          type: 'update',
        }, session.user.email);

        if (resendResponse.success) {
          emailSent = true;
        } else {
          console.warn('Resend update email failed, falling back to Nodemailer:', resendResponse.error);
        }
      }

      if (!emailSent) {
        await sendBookingConfirmation({
          to: session.user.email,
          name: session.user.name,
          courtName: booking.court.name,
          date: updatedBooking.date,
          start_time: updatedBooking.start_time,
          duration: updatedBooking.duration,
          total_price: updatedBooking.total_price,
          type: 'update',
        });
      }
    } catch (emailError) {
      console.error('Failed to send update email:', emailError);
    }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error('PUT /api/bookings/:id error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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

    const isOwner = booking.user && booking.user.toString() === session.user.id;
    const isAdmin = requireRole(session, 'admin');
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'You are not authorised to cancel this booking' }, { status: 403 });
    }

    await cancelBookingAtomically({
      bookingId: booking._id,
      courtId: booking.court,
      date: booking.date,
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/bookings/:id error:', error);
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 });
  }
}
