export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import sseEmitter from '@/lib/sseEmitter';

export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { teamId, updates } = await request.json();

    if (!teamId || !updates) {
      return NextResponse.json({ error: 'Team ID and updates are required.' }, { status: 400 });
    }

    await connectDB();

    // Ensure we don't accidentally update internal Mongo fields or userId unless intended
    const filteredUpdates = { ...updates };
    delete filteredUpdates._id;
    delete filteredUpdates.userId;

    const team = await TournamentTeam.findByIdAndUpdate(
      teamId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Emit real-time update via SSE
    sseEmitter.emit('tournament', {
      type: 'team-update',
      teamId: team._id.toString(),
      team,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" updated successfully in real-time.`,
      team,
    });
  } catch (error) {
    console.error('API Error (Tournament Team Update):', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
