export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import EventBooking from '@/models/EventBooking';

// GET /api/events — list all event bookings (admin only)
export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    const events = await EventBooking.find()
      .sort({ createdAt: -1 });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ error: 'Failed to fetch event bookings' }, { status: 500 });
  }
}

// POST /api/events — create an event booking request (auth optional)
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, packageName, contactName, contactEmail, contactPhone, preferredDate, preferredTime, guestCount, message } = body;

    // Validate type
    const validTypes = ['birthday', 'corporate', 'tournament', 'social'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid event type. Must be one of: birthday, corporate, tournament, social' }, { status: 400 });
    }

    // Validate contactName
    if (!contactName || typeof contactName !== 'string' || contactName.trim().length < 2 || contactName.trim().length > 100) {
      return NextResponse.json({ error: 'Contact name must be between 2 and 100 characters' }, { status: 400 });
    }

    // Validate contactEmail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail || !emailRegex.test(contactEmail)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    // Validate contactPhone (SA format: +27, 0xx, or 27xx — 10-12 digits)
    const phoneClean = contactPhone?.replace(/[\s\-()]/g, '') || '';
    const saPhoneRegex = /^(\+?27|0)\d{9}$/;
    if (!saPhoneRegex.test(phoneClean)) {
      return NextResponse.json({ error: 'Please provide a valid South African phone number (e.g. 0821234567 or +27821234567)' }, { status: 400 });
    }

    // Validate preferredDate (must be a future date)
    if (!preferredDate) {
      return NextResponse.json({ error: 'Preferred date is required' }, { status: 400 });
    }
    const dateObj = new Date(preferredDate);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return NextResponse.json({ error: 'Preferred date must be in the future' }, { status: 400 });
    }

    // Validate guestCount
    if (!guestCount || typeof guestCount !== 'number' || guestCount < 1 || guestCount > 100 || !Number.isInteger(guestCount)) {
      return NextResponse.json({ error: 'Guest count must be a whole number between 1 and 100' }, { status: 400 });
    }

    // Validate packageName
    if (!packageName || typeof packageName !== 'string' || packageName.trim().length === 0) {
      return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    await connectDB();

    // If authenticated, attach user ID
    let userId = null;
    const session = await getAuthSession();
    if (session?.user?.id) {
      userId = session.user.id;
    }

    const eventBooking = await EventBooking.create({
      type,
      packageName: packageName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: phoneClean,
      preferredDate: dateObj,
      preferredTime: preferredTime || null,
      guestCount,
      message: message?.trim() || '',
      status: 'pending',
      user: userId,
    });

    return NextResponse.json(eventBooking, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ error: 'Failed to create event booking' }, { status: 500 });
  }
}
