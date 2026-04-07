export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import sseEmitter from '@/lib/sseEmitter';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const teams = await TournamentTeam.find().lean();
    
    // Group teams into A-H
    const groups = {};
    ['A','B','C','D','E','F','G','H'].forEach(l => groups[l] = []);
    
    teams.forEach(t => {
      if (t.groupLetter && groups[t.groupLetter]) {
        groups[t.groupLetter].push({
          ...t,
          _id: t._id.toString()
        });
      }
    });

    // Sort teams in each group by PTS, then GD, then GF
    Object.keys(groups).forEach(l => {
      groups[l].sort((a,b) => (b.pts||0) - (a.pts||0) || (b.gd||0) - (a.gd||0) || (b.gf||0) - (a.gf||0));
    });

    return NextResponse.json({ groups });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * Bulk update standings for all teams in a group
 * Body: { groupLetter: 'A', teams: [{ _id, mp, w, d, l, gf, ga, gd, pts }] }
 */
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { groupLetter, teams } = await request.json();

    if (!groupLetter || !teams || !Array.isArray(teams)) {
      return NextResponse.json(
        { error: 'groupLetter and teams array are required.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Bulk update all teams in the group
    const bulkOps = teams.map((t) => ({
      updateOne: {
        filter: { _id: t._id },
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
            groupLetter,
          },
        },
      },
    }));

    await TournamentTeam.bulkWrite(bulkOps);

    // Fetch updated standings for this group
    const updated = await TournamentTeam.find({ groupLetter })
      .sort({ pts: -1, gd: -1, gf: -1 })
      .lean();

    // Emit SSE for real-time update
    sseEmitter.emit('tournament', {
      type: 'standings-update',
      groupLetter,
      standings: updated.map((t) => ({ ...t, _id: t._id.toString() })),
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Group ${groupLetter} standings updated.`,
      standings: updated,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
