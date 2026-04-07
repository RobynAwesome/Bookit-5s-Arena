export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { teamId, action } = await request.json(); // action: 'confirm' | 'reject' | 'reset'

    if (!teamId || !action) {
      return NextResponse.json({ error: 'Team ID and action are required.' }, { status: 400 });
    }

    await connectDB();

    let update = {};
    if (action === 'confirm') {
      update = { paymentStatus: 'confirmed', status: 'confirmed' };
    } else if (action === 'reject') {
      update = { paymentStatus: 'rejected', status: 'pending' };
    } else if (action === 'reset') {
      update = { paymentStatus: 'unpaid', status: 'pending', paymentScreenshot: null };
    }

    const team = await TournamentTeam.findByIdAndUpdate(teamId, update, { new: true });

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" ${action}ed successfully.`,
      team,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
