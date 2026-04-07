export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeagueTeam from '@/models/LeagueTeam';
import League from '@/models/League';
import Fixture from '@/models/Fixture';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import sseEmitter from '@/lib/sseEmitter';

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { leagueId } = params;
    await connectDB();

    const [league, teams] = await Promise.all([
      League.findById(leagueId).lean(),
      LeagueTeam.find({ leagueId, status: 'confirmed' }).lean(),
    ]);

    if (!league) return NextResponse.json({ error: 'League not found.' }, { status: 404 });
    if (teams.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 confirmed teams to generate fixtures.' }, { status: 400 });
    }

    // Remove any existing scheduled fixtures for this league
    await Fixture.deleteMany({ competitionType: 'league', competitionId: leagueId, status: 'scheduled' });

    const fixtures = generateRoundRobin(teams, leagueId);

    await Fixture.insertMany(fixtures);

    sseEmitter.emit(`league:${leagueId}`, {
      type: 'fixtures-generated',
      count: fixtures.length,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Generated ${fixtures.length} fixtures for ${league.name}.`,
      count: fixtures.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Round-robin fixture generator
 * Each team plays every other team twice (home + away)
 */
function generateRoundRobin(teams, leagueId) {
  const fixtures = [];
  const shuffled = [...teams].sort(() => Math.random() - 0.5);
  let matchday = 1;

  // First leg
  for (let i = 0; i < shuffled.length; i++) {
    for (let j = i + 1; j < shuffled.length; j++) {
      fixtures.push({
        competitionType: 'league',
        competitionId: leagueId,
        homeTeamModel: 'LeagueTeam',
        awayTeamModel: 'LeagueTeam',
        homeTeam: shuffled[i]._id,
        awayTeam: shuffled[j]._id,
        matchday,
        round: 'league',
        status: 'scheduled',
      });
      matchday++;
    }
  }

  // Second leg (reversed)
  const firstLegCount = fixtures.length;
  for (let k = 0; k < firstLegCount; k++) {
    fixtures.push({
      ...fixtures[k],
      homeTeam: fixtures[k].awayTeam,
      awayTeam: fixtures[k].homeTeam,
      matchday: matchday++,
    });
  }

  return fixtures;
}
