export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    await connectDB();

    const teams = await LeagueTeam.find({ leagueId }).lean();

    // Group by groupLetter (league-format leagues may not have groups)
    const groups = {};
    const ungrouped = [];

    teams.forEach((t) => {
      if (t.groupLetter) {
        if (!groups[t.groupLetter]) groups[t.groupLetter] = [];
        groups[t.groupLetter].push({ ...t, _id: t._id.toString() });
      } else {
        ungrouped.push({ ...t, _id: t._id.toString() });
      }
    });

    // Sort each group
    Object.keys(groups).forEach((l) => {
      groups[l].sort(
        (a, b) => (b.pts || 0) - (a.pts || 0) || (b.gd || 0) - (a.gd || 0) || (b.gf || 0) - (a.gf || 0)
      );
    });

    // Sort ungrouped (full league table)
    ungrouped.sort(
      (a, b) => (b.pts || 0) - (a.pts || 0) || (b.gd || 0) - (a.gd || 0) || (b.gf || 0) - (a.gf || 0)
    );

    return NextResponse.json({ groups, ungrouped });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Bulk update standings
 * Body: { groupLetter?: 'A', teams: [{ _id, mp, w, d, l, gf, ga, gd, pts }] }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { leagueId } = params;
    const { groupLetter, teams } = await request.json();

    if (!teams || !Array.isArray(teams)) {
      return NextResponse.json({ error: 'teams array is required.' }, { status: 400 });
    }

    await connectDB();

    const bulkOps = teams.map((t) => ({
      updateOne: {
        filter: { _id: t._id, leagueId },
        update: {
          $set: {
            mp: t.mp ?? 0,
            w: t.w ?? 0,
            d: t.d ?? 0,
            l: t.l ?? 0,
            gf: t.gf ?? 0,
            ga: t.ga ?? 0,
            gd: t.gd ?? 0,
            pts: t.pts ?? 0,
            ...(groupLetter && { groupLetter }),
          },
        },
      },
    }));

    await LeagueTeam.bulkWrite(bulkOps);

    const filter = groupLetter
      ? { leagueId, groupLetter }
      : { leagueId };

    const updated = await LeagueTeam.find(filter)
      .sort({ pts: -1, gd: -1, gf: -1 })
      .lean();

    sseEmitter.emit(`league:${leagueId}`, {
      type: 'standings-update',
      groupLetter: groupLetter || null,
      standings: updated.map((t) => ({ ...t, _id: t._id.toString() })),
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: groupLetter ? `Group ${groupLetter} standings updated.` : 'League standings updated.',
      standings: updated,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
