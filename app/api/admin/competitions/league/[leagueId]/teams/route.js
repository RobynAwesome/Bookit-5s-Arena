export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeagueTeam from '@/models/LeagueTeam';
import League from '@/models/League';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import sseEmitter from '@/lib/sseEmitter';

export async function GET(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { leagueId } = params;
    await connectDB();

    const [league, teams] = await Promise.all([
      League.findById(leagueId).lean(),
      LeagueTeam.find({ leagueId }).lean(),
    ]);

    if (!league) return NextResponse.json({ error: 'League not found.' }, { status: 404 });

    return NextResponse.json({
      league: { ...league, _id: league._id.toString() },
      teams: teams.map((t) => ({ ...t, _id: t._id.toString() })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { leagueId } = params;
    const { teamId, updates } = await request.json();

    if (!teamId || !updates) {
      return NextResponse.json({ error: 'teamId and updates are required.' }, { status: 400 });
    }

    await connectDB();

    const team = await LeagueTeam.findOneAndUpdate(
      { _id: teamId, leagueId },
      { $set: updates },
      { new: true, runValidators: false }
    );

    if (!team) return NextResponse.json({ error: 'Team not found.' }, { status: 404 });

    sseEmitter.emit(`league:${leagueId}`, {
      type: 'team-update',
      teamId: team._id.toString(),
      team,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true, team });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
