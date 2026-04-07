export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeagueTeam from '@/models/LeagueTeam';

/**
 * GET: Public league standings (no auth required)
 * Returns standings grouped by groupLetter (if applicable) or flat
 */
export async function GET(request, { params }) {
  try {
    const { leagueId } = await params;
    await connectDB();

    const teams = await LeagueTeam.find({ leagueId, status: 'confirmed' })
      .select('teamName logo groupLetter mp w d l gf ga gd pts')
      .lean();

    // Check if this league uses groups
    const hasGroups = teams.some(t => t.groupLetter);

    if (hasGroups) {
      const groups = {};
      teams.forEach(t => {
        const letter = t.groupLetter || '?';
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push({ ...t, _id: t._id.toString() });
      });

      // Sort each group by pts/gd/gf
      Object.keys(groups).forEach(l => {
        groups[l].sort((a, b) =>
          (b.pts || 0) - (a.pts || 0) ||
          (b.gd || 0) - (a.gd || 0) ||
          (b.gf || 0) - (a.gf || 0)
        );
      });

      return NextResponse.json({ groups });
    }

    // Flat league table
    const standings = teams
      .map(t => ({ ...t, _id: t._id.toString() }))
      .sort((a, b) =>
        (b.pts || 0) - (a.pts || 0) ||
        (b.gd || 0) - (a.gd || 0) ||
        (b.gf || 0) - (a.gf || 0)
      );

    return NextResponse.json({ standings });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
