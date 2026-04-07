export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import { assignGroups, generateGroupFixtures } from '@/lib/fixtureGenerator';
import sseEmitter from '@/lib/sseEmitter';

/**
 * POST: Generate random tournament draw
 * Assigns teams to groups and creates all group-stage fixtures
 * WARNING: This will overwrite existing group assignments and fixtures
 */
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    // Get all confirmed teams
    const teams = await TournamentTeam.find({ status: 'confirmed' }).lean();

    if (teams.length < 2) {
      return NextResponse.json(
        { error: `Need at least 2 confirmed teams. Currently ${teams.length}.` },
        { status: 400 }
      );
    }

    // Generate group assignments
    const teamData = teams.map((t) => ({
      _id: t._id.toString(),
      teamName: t.teamName,
      worldCupTeam: t.worldCupTeam,
    }));

    const groups = assignGroups(teamData);

    // Update team group assignments in DB
    const groupUpdates = [];
    Object.entries(groups).forEach(([letter, groupTeams]) => {
      groupTeams.forEach((team) => {
        groupUpdates.push({
          updateOne: {
            filter: { _id: team._id },
            update: {
              $set: {
                groupLetter: letter,
                groupNumber: team.groupNumber,
                // Reset standings for fresh draw
                mp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
              },
            },
          },
        });
      });
    });

    await TournamentTeam.bulkWrite(groupUpdates);

    // Delete existing tournament fixtures
    await Fixture.deleteMany({ competitionType: 'tournament', competitionId: null });

    // Generate and persist fixtures for each group
    const allFixtures = [];
    const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const letter of GROUP_LETTERS) {
      if (!groups[letter] || groups[letter].length < 2) continue;

      const groupFixtures = generateGroupFixtures(groups[letter]);

      for (const f of groupFixtures) {
        allFixtures.push({
          competitionType: 'tournament',
          competitionId: null,
          groupLetter: letter,
          matchday: f.matchday,
          round: 'group',
          homeTeam: f.home.teamId,
          awayTeam: f.away.teamId,
          homeTeamModel: 'TournamentTeam',
          awayTeamModel: 'TournamentTeam',
          status: 'scheduled',
          venue: 'Hellenic Football Club, Milnerton',
        });
      }
    }

    if (allFixtures.length > 0) {
      await Fixture.insertMany(allFixtures);
    }

    // Emit SSE
    sseEmitter.emit('tournament', {
      type: 'draw-generated',
      groups,
      fixtureCount: allFixtures.length,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Draw generated: ${teams.length} teams in ${Object.keys(groups).length} groups, ${allFixtures.length} fixtures created.`,
      groups,
      fixtureCount: allFixtures.length,
    });
  } catch (err) {
    console.error('Draw generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
