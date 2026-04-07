export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import connectDB from '@/lib/mongodb';
import League from '@/models/League';

// GET /api/leagues — list all leagues (public)
export async function GET() {
  try {
    await connectDB();
    const leagues = await League.find().sort({ startDate: -1 });
    return NextResponse.json(leagues, { status: 200 });
  } catch (error) {
    console.error('GET /api/leagues error:', error);
    return NextResponse.json({ error: 'Failed to fetch leagues' }, { status: 500 });
  }
}

// POST /api/leagues — create a league (admin only)
export async function POST(request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, format, maxTeams, entryFee, prizePool, startDate, endDate, registrationDeadline, rules, image } = body;

    if (!name || !description || !format || !maxTeams || entryFee == null || !startDate || !registrationDeadline) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    const validFormats = ['round-robin', 'knockout', 'group-stage', 'league'];
    if (!validFormats.includes(format)) {
      return NextResponse.json({ error: 'Invalid league format' }, { status: 400 });
    }

    if (maxTeams < 2) {
      return NextResponse.json({ error: 'League must have at least 2 teams' }, { status: 400 });
    }

    const startDateObj = new Date(startDate);
    const deadlineObj = new Date(registrationDeadline);
    if (deadlineObj >= startDateObj) {
      return NextResponse.json({ error: 'Registration deadline must be before the start date' }, { status: 400 });
    }

    await connectDB();

    const league = await League.create({
      name: name.trim(),
      description: description.trim(),
      format,
      maxTeams: Number(maxTeams),
      entryFee: Number(entryFee),
      prizePool: prizePool ? Number(prizePool) : 0,
      startDate: startDateObj,
      endDate: endDate ? new Date(endDate) : null,
      registrationDeadline: deadlineObj,
      rules: rules?.trim() || '',
      image: image?.trim() || '',
      createdBy: session.user.id,
    });

    return NextResponse.json(league, { status: 201 });
  } catch (error) {
    console.error('POST /api/leagues error:', error);
    return NextResponse.json({ error: 'Failed to create league' }, { status: 500 });
  }
}
