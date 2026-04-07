export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import '@/models/Court';
import { sendBookingConfirmation } from '@/lib/sendBookingConfirmation';

// POST /api/bookings/:id/resend — re-send booking receipt to user's email
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    await connectDB();
    const booking = await Booking.findById(id).populate('court');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
    }

    await sendBookingConfirmation({
      to: session.user.email,
      name: session.user.name,
      courtName: booking.court.name,
      date: booking.date,
      start_time: booking.start_time,
      duration: booking.duration,
      total_price: booking.total_price,
    });

    return NextResponse.json({ message: 'Receipt sent' }, { status: 200 });
  } catch (error) {
    console.error('POST /api/bookings/:id/resend error:', error);
    return NextResponse.json({ error: 'Failed to send receipt' }, { status: 500 });
  }
}
