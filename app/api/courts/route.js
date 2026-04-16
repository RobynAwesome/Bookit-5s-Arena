export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import { getFallbackCourts } from '@/lib/localData/courts';
import Court from '@/models/Court';

// GET /api/courts — fetch all courts (public) or own courts (?mine=true)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mine = searchParams.get('mine') === 'true';

  try {
    let filter = {};

    if (mine) {
      const session = await getAuthSession();
      if (!session) {
        return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
      }
      filter = { owner: session.user.id };
    }

    await connectDB();

    // .lean() returns plain JS objects — ~3× faster for read-only routes
    const courts = await Court.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (!mine && courts.length === 0) {
      return NextResponse.json(getFallbackCourts(), { status: 200 });
    }

    const res = NextResponse.json(courts, { status: 200 });

    // Public court list changes rarely — cache 60s at edge, serve stale while revalidating
    if (!mine) {
      res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    }

    return res;
  } catch (error) {
    console.error('GET /api/courts error:', error);
    if (!mine) {
      return NextResponse.json(getFallbackCourts(), { status: 200 });
    }
    return NextResponse.json({ error: 'Failed to fetch courts' }, { status: 500 });
  }
}

// POST /api/courts — create a new court (admin only)
export async function POST(request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, pricePerHour, images, amenities, openTime, closeTime } = body;

    if (!name || !pricePerHour) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    await connectDB();

    const court = await Court.create({
      name,
      description: description || '',
      pricePerHour: Number(pricePerHour),
      images: images || [],
      amenities: amenities || [],
      openTime: openTime || '10:00',
      closeTime: closeTime || '22:00',
      owner: session.user.id,
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('POST /api/courts error:', error);
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 });
  }
}
