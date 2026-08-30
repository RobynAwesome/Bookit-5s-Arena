export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import {
  isBookingOccupancyConflict,
  isBookingTransactionUnavailable,
  setBookingStatusWithOccupancy,
} from '@/lib/bookings/bookingOccupancy';

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const { status } = await request.json();
    const allowed = ['pending', 'confirmed', 'cancelled'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Cancellation releases hourly locks in the same transaction. Restoring a
    // cancelled booking must reacquire every slot first; if any hour has since
    // been taken, the entire status transition aborts with 409.
    const booking = await setBookingStatusWithOccupancy(id, status);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Update booking error:', error);

    if (isBookingOccupancyConflict(error)) {
      return NextResponse.json(
        { error: 'This booking cannot be activated because one or more of its court hours are already reserved.' },
        { status: 409 }
      );
    }
    if (error?.name === 'BookingOccupancyStateError' && error.code === 'BOOKING_NOT_FOUND') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (isBookingTransactionUnavailable(error)) {
      return NextResponse.json(
        { error: 'The reservation safety lock is unavailable. Booking status was not changed.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
