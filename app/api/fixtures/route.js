export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import League from '@/models/League';
// Must be imported so Mongoose registers these models before refPath populate runs
import '@/models/TournamentTeam';
import '@/models/LeagueTeam';

/**
 * GET: Public arena fixtures (no auth required)
 * Query params: type, leagueId, status, group, round, matchday
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');        // tournament | league
    const leagueId = searchParams.get('leagueId');
    const status = searchParams.get('status');     // scheduled | live | completed | postponed
    const group = searchParams.get('group');        // A-H
    const round = searchParams.get('round');        // group | r16 | qf | sf | final | third-place
    const matchday = searchParams.get('matchday');  // number

    // Build filter
    const filter = {};
    if (type) filter.competitionType = type;
    if (leagueId) {
      filter.competitionType = 'league';
      filter.competitionId = leagueId;
    }
    if (status) filter.status = status;
    if (group) filter.groupLetter = group;
    if (round) filter.round = round;
    if (matchday) filter.matchday = Number(matchday);

    // Fetch fixtures with populated teams
    const fixtures = await Fixture.find(filter)
      .populate('homeTeam', 'teamName worldCupTeam worldCupTeamLogo logo groupLetter')
      .populate('awayTeam', 'teamName worldCupTeam worldCupTeamLogo logo groupLetter')
      .sort({ status: 1, scheduledAt: 1, matchday: 1 })
      .lean();

    // Custom sort: live first, then scheduled, then completed
    const statusOrder = { live: 0, scheduled: 1, postponed: 2, completed: 3 };
    fixtures.sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9) || new Date(a.scheduledAt) - new Date(b.scheduledAt));

    // Fetch active leagues for filter dropdown
    const leagues = await League.find({ status: { $in: ['active', 'completed'] } })
      .select('name status format startDate')
      .sort({ startDate: -1 })
      .lean();

    // Compute meta counts
    const meta = {
      total: fixtures.length,
      live: fixtures.filter(f => f.status === 'live').length,
      upcoming: fixtures.filter(f => f.status === 'scheduled').length,
      completed: fixtures.filter(f => f.status === 'completed').length,
    };

    return NextResponse.json({ fixtures, leagues, meta });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
