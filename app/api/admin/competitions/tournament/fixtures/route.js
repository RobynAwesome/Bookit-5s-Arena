export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import sseEmitter from '@/lib/sseEmitter';

/**
 * GET: List tournament fixtures with optional filters
 * Query params: ?group=A&status=scheduled&round=group&matchday=1
 */
export async function GET(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = { competitionType: 'tournament', competitionId: null };

    if (searchParams.get('group')) filter.groupLetter = searchParams.get('group');
    if (searchParams.get('status')) filter.status = searchParams.get('status');
    if (searchParams.get('round')) filter.round = searchParams.get('round');
    if (searchParams.get('matchday')) filter.matchday = Number(searchParams.get('matchday'));

    await connectDB();

    const fixtures = await Fixture.find(filter)
      .populate('homeTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter')
      .populate('awayTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter')
      .sort({ matchday: 1, scheduledAt: 1 })
      .lean();

    return NextResponse.json({ fixtures });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH: Update fixture score/status
 * Body: { fixtureId, homeScore?, awayScore?, status?, events? }
 */
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { fixtureId, homeScore, awayScore, status, events } = await request.json();

    if (!fixtureId) {
      return NextResponse.json({ error: 'fixtureId is required.' }, { status: 400 });
    }

    await connectDB();

    const updateData = {};
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (status) updateData.status = status;
    if (events) updateData.events = events;

    const fixture = await Fixture.findByIdAndUpdate(
      fixtureId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('homeTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter')
      .populate('awayTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter');

    if (!fixture) {
      return NextResponse.json({ error: 'Fixture not found.' }, { status: 404 });
    }

    // If match completed, recalculate group standings
    if (status === 'completed' && fixture.groupLetter) {
      await recalculateGroupStandings(fixture.groupLetter);
    }

    // Emit SSE event
    sseEmitter.emit('tournament', {
      type: status === 'live' ? 'score-live' : 'fixture-update',
      fixture,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Fixture updated. ${status === 'completed' ? 'Standings recalculated.' : ''}`,
      fixture,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Recalculate standings for a group by replaying all completed fixtures
 */
async function recalculateGroupStandings(groupLetter) {
  const teams = await TournamentTeam.find({ groupLetter }).lean();
  const fixtures = await Fixture.find({
    competitionType: 'tournament',
    competitionId: null,
    groupLetter,
    status: 'completed',
  }).lean();

  // Reset standings for all teams in group
  const standings = {};
  teams.forEach((t) => {
    standings[t._id.toString()] = { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });

  // Replay all completed fixtures
  fixtures.forEach((f) => {
    const homeId = f.homeTeam.toString();
    const awayId = f.awayTeam.toString();
    if (!standings[homeId] || !standings[awayId]) return;

    const hs = f.homeScore ?? 0;
    const as = f.awayScore ?? 0;

    standings[homeId].mp++;
    standings[awayId].mp++;
    standings[homeId].gf += hs;
    standings[homeId].ga += as;
    standings[awayId].gf += as;
    standings[awayId].ga += hs;

    if (hs > as) {
      standings[homeId].w++;
      standings[homeId].pts += 3;
      standings[awayId].l++;
    } else if (hs < as) {
      standings[awayId].w++;
      standings[awayId].pts += 3;
      standings[homeId].l++;
    } else {
      standings[homeId].d++;
      standings[homeId].pts += 1;
      standings[awayId].d++;
      standings[awayId].pts += 1;
    }

    standings[homeId].gd = standings[homeId].gf - standings[homeId].ga;
    standings[awayId].gd = standings[awayId].gf - standings[awayId].ga;
  });

  // Bulk update all teams
  const bulkOps = Object.entries(standings).map(([teamId, stats]) => ({
    updateOne: {
      filter: { _id: teamId },
      update: { $set: stats },
    },
  }));

  if (bulkOps.length > 0) {
    await TournamentTeam.bulkWrite(bulkOps);
  }

  // Emit standings update
  const updatedTeams = await TournamentTeam.find({ groupLetter })
    .sort({ pts: -1, gd: -1, gf: -1 })
    .lean();

  sseEmitter.emit('tournament', {
    type: 'standings-update',
    groupLetter,
    standings: updatedTeams.map((t) => ({ ...t, _id: t._id.toString() })),
    timestamp: Date.now(),
  });
}
