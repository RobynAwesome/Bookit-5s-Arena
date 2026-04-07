export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import EventBooking from '@/models/EventBooking';
import '@/models/User';

export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const match = {};
    if (from || to) {
      match.preferredDate = {};
      if (from) match.preferredDate.$gte = new Date(from);
      if (to) match.preferredDate.$lte = new Date(to);
    }
    const allowedStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && allowedStatuses.includes(status)) match.status = status;
    const allowedTypes = ['birthday', 'corporate', 'tournament', 'social'];
    if (type && allowedTypes.includes(type)) match.type = type;

    const events = await EventBooking.find(match)
      .populate('user', 'name email')
      .sort({ preferredDate: -1 })
      .lean();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Admin events error:', error);
    return NextResponse.json({ error: 'Failed to fetch event bookings' }, { status: 500 });
  }
}
