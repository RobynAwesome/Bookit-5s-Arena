export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import LeagueTeam from '@/models/LeagueTeam';
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
    const { searchParams } = new URL(request.url);

    const filter = { competitionType: 'league', competitionId: leagueId };
    if (searchParams.get('group')) filter.groupLetter = searchParams.get('group');
    if (searchParams.get('status')) filter.status = searchParams.get('status');
    if (searchParams.get('matchday')) filter.matchday = Number(searchParams.get('matchday'));

    await connectDB();

    const fixtures = await Fixture.find(filter)
      .populate('homeTeam', 'teamName logo groupLetter')
      .populate('awayTeam', 'teamName logo groupLetter')
      .sort({ matchday: 1, scheduledAt: 1 })
      .lean();

    return NextResponse.json({ fixtures });
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

    const fixture = await Fixture.findOneAndUpdate(
      { _id: fixtureId, competitionType: 'league', competitionId: leagueId },
      { $set: updateData },
      { new: true }
    )
      .populate('homeTeam', 'teamName logo groupLetter')
      .populate('awayTeam', 'teamName logo groupLetter');

    if (!fixture) return NextResponse.json({ error: 'Fixture not found.' }, { status: 404 });

    if (status === 'completed') {
      await recalculateLeagueStandings(leagueId, fixture.groupLetter || null);
    }

    sseEmitter.emit(`league:${leagueId}`, {
      type: status === 'live' ? 'score-live' : 'fixture-update',
      fixture,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Fixture updated.${status === 'completed' ? ' Standings recalculated.' : ''}`,
      fixture,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function recalculateLeagueStandings(leagueId, groupLetter) {
  const teamFilter = { leagueId };
  if (groupLetter) teamFilter.groupLetter = groupLetter;

  const fixtureFilter = { competitionType: 'league', competitionId: leagueId, status: 'completed' };
  if (groupLetter) fixtureFilter.groupLetter = groupLetter;

  const [teams, fixtures] = await Promise.all([
    LeagueTeam.find(teamFilter).lean(),
    Fixture.find(fixtureFilter).lean(),
  ]);

  const standings = {};
  teams.forEach((t) => {
    standings[t._id.toString()] = { mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });

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

  const bulkOps = Object.entries(standings).map(([teamId, stats]) => ({
    updateOne: { filter: { _id: teamId }, update: { $set: stats } },
  }));

  if (bulkOps.length > 0) await LeagueTeam.bulkWrite(bulkOps);

  const updatedTeams = await LeagueTeam.find(teamFilter)
    .sort({ pts: -1, gd: -1, gf: -1 })
    .lean();

  sseEmitter.emit(`league:${leagueId}`, {
    type: 'standings-update',
    groupLetter: groupLetter || null,
    standings: updatedTeams.map((t) => ({ ...t, _id: t._id.toString() })),
    timestamp: Date.now(),
  });
}
