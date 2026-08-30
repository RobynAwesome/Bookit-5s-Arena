export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import BookingDelivery from '@/models/BookingDelivery';

export async function GET(_request, { params }) {
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

    const bookingExists = await Booking.exists({ _id: id });
    if (!bookingExists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const deliveries = await BookingDelivery.find({ booking: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json(
      {
        bookingId: id,
        deliveries,
        summary: deliveries.reduce((acc, delivery) => {
          acc[delivery.status] = (acc[delivery.status] || 0) + 1;
          return acc;
        }, {}),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET booking delivery receipts error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking delivery receipts' }, { status: 500 });
  }
}
