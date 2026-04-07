export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { WORLD_CUP_TEAMS } from '@/lib/worldCupTeams';

const TOURNAMENT_DEADLINE = new Date('2026-05-19T23:59:59+02:00'); // 1 week before May 26

/* ─── GET: list teams + available World Cup teams ─────────── */
export async function GET() {
  try {
    await connectDB();
    const teams = await TournamentTeam.find().sort({ createdAt: -1 }).lean();
    const takenTeams = teams.map((t) => t.worldCupTeam);
    const availableTeams = WORLD_CUP_TEAMS.filter(
      (wc) => !takenTeams.includes(`${wc.name} (${wc.player})`)
    );

    return NextResponse.json({
      teams: teams.map((t) => ({ ...t, _id: t._id.toString() })),
      availableTeams,
      deadline: TOURNAMENT_DEADLINE.toISOString(),
      isOpen: new Date() < TOURNAMENT_DEADLINE,
      totalSlots: 48, // 8 groups × 6 teams
      registeredCount: teams.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ─── POST: register a new team ──────────────────────────── */
export async function POST(request) {
  try {
    // Check deadline
    if (new Date() >= TOURNAMENT_DEADLINE) {
      return NextResponse.json(
        { error: 'Registration has closed. The deadline was 1 week before the tournament.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if full (48 teams max)
    const currentCount = await TournamentTeam.countDocuments();
    if (currentCount >= 48) {
      return NextResponse.json(
        { error: 'Tournament is full! All 48 spots have been taken.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const { managerName, managerEmail, managerPhone, teamName, worldCupTeam, players, communicationPref, agreedToTerms } = body;

    if (!managerName || !managerEmail || !managerPhone || !teamName || !worldCupTeam || !agreedToTerms) {
      return NextResponse.json(
        { error: 'All required fields must be filled in, and you must agree to the Terms & Conditions.' },
        { status: 400 }
      );
    }

    if (!players || players.filter((p) => !p.isReserve).length < 5) {
      return NextResponse.json(
        { error: 'You must register at least 5 starting players.' },
        { status: 400 }
      );
    }

    // Check if World Cup team is still available
    const existing = await TournamentTeam.findOne({ worldCupTeam });
    if (existing) {
      return NextResponse.json(
        { error: `${worldCupTeam} has already been taken by another team.` },
        { status: 400 }
      );
    }

    // Check session for logged-in user
    const session = await getAuthSession();

    const team = await TournamentTeam.create({
      ...body,
      userId: session?.user?.id || null,
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Team "${teamName}" registered successfully! Confirmation will be sent via ${communicationPref}.`,
        team: { ...team.toObject(), _id: team._id.toString() },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err.name === 'ValidationError') {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
