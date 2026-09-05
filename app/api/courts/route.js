export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import Court from '@/models/Court';
import { normalizeCourtPayload } from '@/lib/courts/normalizeCourtPayload';

function publicCourtResponse(courts, status = 200, state = 'verified-source') {
  const response = NextResponse.json(courts, { status });
  response.headers.set('X-FivesArena-Data-State', state);
  if (status === 200) {
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
  } else {
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}

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

    const courts = await Court.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    if (!mine) {
      return publicCourtResponse(courts, 200, courts.length > 0 ? 'verified-source' : 'database-empty');
    }

    return NextResponse.json(courts, { status: 200 });
  } catch (error) {
    console.error('GET /api/courts error:', error);
    if (!mine) {
      return publicCourtResponse([], 503, 'unavailable');
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
    let courtPayload;

    try {
      courtPayload = normalizeCourtPayload(body);
    } catch (validationError) {
      return NextResponse.json(
        { error: validationError.message || 'Invalid court payload' },
        { status: 400 }
      );
    }

    await connectDB();

    const court = await Court.create({
      ...courtPayload,
      owner: session.user.id,
    });

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('POST /api/courts error:', error);
    return NextResponse.json({ error: 'Failed to create court' }, { status: 500 });
  }
}
