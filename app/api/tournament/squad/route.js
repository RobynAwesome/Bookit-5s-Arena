export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';

export async function PUT(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'manager') && !requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Manager access required.' }, { status: 403 });
    }

    const { teamId, players } = await request.json();

    if (!teamId || !players || !Array.isArray(players)) {
      return NextResponse.json({ error: 'Team ID and players array are required.' }, { status: 400 });
    }

    await connectDB();

    const team = await TournamentTeam.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Security check: Only allow the manager of this team (or admin) to edit
    if (!requireRole(session, 'admin') && team.managerEmail !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized. You can only edit your own team.' }, { status: 403 });
    }

    // Only allow editing if payment is confirmed
    if (team.paymentStatus !== 'confirmed') {
      return NextResponse.json({ error: 'Squad editing is locked until payment is confirmed.' }, { status: 403 });
    }

    // Update players
    team.players = players;
    await team.save();

    return NextResponse.json({
      success: true,
      message: 'Squad updated successfully.',
      team,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
