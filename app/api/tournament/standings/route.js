export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';

/**
 * GET: Public tournament standings (no auth required)
 * Returns all groups sorted by PTS/GD/GF
 */
export async function GET() {
  try {
    await connectDB();

    const teams = await TournamentTeam.find({ status: 'confirmed' })
      .select('teamName worldCupTeam worldCupTeamLogo groupLetter mp w d l gf ga gd pts')
      .lean();

    const groups = {};
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((l) => (groups[l] = []));

    teams.forEach((t) => {
      if (t.groupLetter && groups[t.groupLetter]) {
        groups[t.groupLetter].push({ ...t, _id: t._id.toString() });
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach((l) => {
      if (groups[l].length === 0) delete groups[l];
    });

    // Sort each group
    Object.keys(groups).forEach((l) => {
      groups[l].sort(
        (a, b) =>
          (b.pts || 0) - (a.pts || 0) ||
          (b.gd || 0) - (a.gd || 0) ||
          (b.gf || 0) - (a.gf || 0)
      );
    });

    return NextResponse.json({ groups });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
