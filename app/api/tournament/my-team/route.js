export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';

/**
 * GET: Fetch the authenticated manager's own team
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    await connectDB();

    // Find team by userId or manager email
    const team = await TournamentTeam.findOne({
      $or: [
        { userId: session.user.id },
        { managerEmail: session.user.email },
      ],
    }).lean();

    if (!team) {
      return NextResponse.json({ error: 'No team found for your account.' }, { status: 404 });
    }

    return NextResponse.json({ team: { ...team, _id: team._id.toString() } });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH: Manager updates their own team (limited fields only)
 * Allowed: teamName, players, supportGuests, worldCupTeam
 * Blocked: standings, groupLetter, status, payment, other teams
 */
export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // Find manager's own team
    const team = await TournamentTeam.findOne({
      $or: [
        { userId: session.user.id },
        { managerEmail: session.user.email },
      ],
    });

    if (!team) {
      return NextResponse.json({ error: 'No team found for your account.' }, { status: 404 });
    }

    // Only allow payment-confirmed teams to edit
    if (team.paymentStatus !== 'confirmed') {
      return NextResponse.json(
        { error: 'Team editing is locked until payment is confirmed.' },
        { status: 403 }
      );
    }

    // SECURITY: Only allow these specific fields
    const ALLOWED_FIELDS = ['teamName', 'players', 'supportGuests', 'worldCupTeam', 'worldCupTeamLogo'];
    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    // If changing World Cup team, check availability
    if (updates.worldCupTeam && updates.worldCupTeam !== team.worldCupTeam) {
      const taken = await TournamentTeam.findOne({
        worldCupTeam: updates.worldCupTeam,
        _id: { $ne: team._id },
      });
      if (taken) {
        return NextResponse.json(
          { error: `"${updates.worldCupTeam}" is already taken by another team.` },
          { status: 409 }
        );
      }
    }

    Object.assign(team, updates);
    await team.save();

    return NextResponse.json({
      success: true,
      message: `Team "${team.teamName}" updated.`,
      team,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
