export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import TournamentTeam from '@/models/TournamentTeam';
import LeagueTeam from '@/models/LeagueTeam';
import League from '@/models/League';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import { sendFixtureNotification, sendMatchResultNotification } from '@/lib/notificationSender';

/**
 * POST: Send fixture notifications
 * Body:
 *   type: 'schedule' | 'result'
 *   fixtureId: string (optional — if omitted, sends to ALL fixtures matching filters)
 *   competitionType: 'tournament' | 'league'
 *   competitionId?: string (for league)
 *   groupLetter?: string
 */
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type, fixtureId, competitionType, competitionId, groupLetter } = await request.json();

    if (!type || !competitionType) {
      return NextResponse.json({ error: 'type and competitionType are required.' }, { status: 400 });
    }

    await connectDB();

    // Build fixture query
    const fixtureFilter = { competitionType };
    if (competitionType === 'league' && competitionId) fixtureFilter.competitionId = competitionId;
    if (fixtureId) fixtureFilter._id = fixtureId;
    if (groupLetter) fixtureFilter.groupLetter = groupLetter;
    if (type === 'schedule') fixtureFilter.status = 'scheduled';
    if (type === 'result') fixtureFilter.status = 'completed';

    const TeamModel = competitionType === 'league' ? LeagueTeam : TournamentTeam;

    // Get competition name
    let competitionName = '5s Arena World Cup';
    if (competitionType === 'league' && competitionId) {
      const league = await League.findById(competitionId).lean();
      if (league) competitionName = league.name;
    }

    const fixtures = await Fixture.find(fixtureFilter)
      .populate('homeTeam', 'teamName managerEmail managerName worldCupTeam groupLetter logo')
      .populate('awayTeam', 'teamName managerEmail managerName worldCupTeam groupLetter logo')
      .lean();

    if (fixtures.length === 0) {
      return NextResponse.json({ error: 'No matching fixtures found.' }, { status: 404 });
    }

    const sent = [];
    const failed = [];

    for (const fixture of fixtures) {
      const home = fixture.homeTeam;
      const away = fixture.awayTeam;

      if (!home || !away) continue;

      const pairs = [
        { team: home, opponent: away, myScore: fixture.homeScore, opponentScore: fixture.awayScore },
        { team: away, opponent: home, myScore: fixture.awayScore, opponentScore: fixture.homeScore },
      ];

      for (const { team, opponent, myScore, opponentScore } of pairs) {
        if (!team?.managerEmail) continue;

        try {
          if (type === 'schedule') {
            await sendFixtureNotification({
              to: team.managerEmail,
              managerName: team.managerName || 'Manager',
              teamName: team.teamName,
              opponentName: opponent.teamName,
              matchday: fixture.matchday,
              groupLetter: fixture.groupLetter,
              competitionName,
              scheduledAt: fixture.scheduledAt,
            });
          } else if (type === 'result') {
            await sendMatchResultNotification({
              to: team.managerEmail,
              managerName: team.managerName || 'Manager',
              teamName: team.teamName,
              opponentName: opponent.teamName,
              myScore: myScore ?? 0,
              opponentScore: opponentScore ?? 0,
              competitionName,
              groupLetter: fixture.groupLetter,
            });
          }
          sent.push(team.managerEmail);
        } catch (emailErr) {
          console.error(`Failed to email ${team.managerEmail}:`, emailErr.message);
          failed.push(team.managerEmail);
        }
      }

      // Mark notifications sent on fixture
      if (type === 'schedule') {
        await Fixture.findByIdAndUpdate(fixture._id, {
          $set: { 'notificationsSent.schedule': true },
        });
      } else if (type === 'result') {
        await Fixture.findByIdAndUpdate(fixture._id, {
          $set: { 'notificationsSent.result': true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sent.length} notification(s).${failed.length > 0 ? ` ${failed.length} failed.` : ''}`,
      sent: sent.length,
      failed: failed.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
