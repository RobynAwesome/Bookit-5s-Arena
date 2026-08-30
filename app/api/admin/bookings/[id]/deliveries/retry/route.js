export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { dispatchBookingCommunications } from '@/lib/bookings/dispatchBookingCommunications';

export async function POST(_request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
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
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cancelled bookings cannot resend reservation communications.' },
        { status: 409 }
      );
    }

    const customerName = booking.guestName || booking.user?.name || 'Player';
    const customerEmail = booking.contactEmail || booking.guestEmail || booking.user?.email || null;
    const customerPhone = booking.contactPhone || booking.guestPhone || booking.user?.phone || null;
    const preferredChannel = booking.preferredChannel || 'whatsapp';

    const receipts = await dispatchBookingCommunications({
      booking,
      court: booking.court,
      customerName,
      customerEmail,
      customerPhone,
      preferredChannel,
    });

    return NextResponse.json(
      {
        bookingId: booking._id.toString(),
        retried: true,
        receipts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST booking delivery retry error:', error);
    return NextResponse.json({ error: 'Failed to retry booking communications' }, { status: 500 });
  }
}
