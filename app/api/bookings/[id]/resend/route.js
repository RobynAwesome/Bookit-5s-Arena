export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { ensureUserBookingEmailReceipt } from '@/lib/bookings/dispatchBookingCommunications';

// POST /api/bookings/:id/resend — ensure the current reservation email receipt
// exists. Already-sent receipts are deliberately not duplicated.
export async function POST(_request, { params }) {
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

    const customerName = booking.user?.name || session.user.name || 'Player';
    const customerEmail = booking.contactEmail || booking.user?.email || session.user.email || null;

    const receipt = await ensureUserBookingEmailReceipt({
      booking,
      court: booking.court,
      customerName,
      customerEmail,
    });

    if (receipt.status === 'sent') {
      return NextResponse.json(
        {
          message: receipt.duplicateSuppressed
            ? 'Receipt was already recorded as sent for this reservation revision.'
            : 'Reservation receipt sent.',
          receipt,
        },
        { status: 200 }
      );
    }

    if (receipt.status === 'sending') {
      return NextResponse.json(
        { message: 'Receipt delivery is already in progress.', receipt },
        { status: 202 }
      );
    }

    return NextResponse.json(
      {
        error: receipt.error || 'Reservation receipt could not be sent.',
        receipt,
      },
      { status: 502 }
    );
  } catch (error) {
    console.error('POST /api/bookings/:id/resend error:', error);
    return NextResponse.json({ error: 'Failed to process reservation receipt' }, { status: 500 });
  }
}
