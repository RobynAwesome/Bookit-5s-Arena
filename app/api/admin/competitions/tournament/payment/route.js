export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';

export async function PATCH(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { teamId, paymentStatus } = await request.json();

    if (!teamId || !paymentStatus) {
      return NextResponse.json({ error: 'Team ID and paymentStatus are required.' }, { status: 400 });
    }

    const validStatuses = ['confirmed', 'rejected', 'unpaid', 'pending'];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
    }

    await connectDB();

    const update = { paymentStatus };
    // Also update team status based on payment decision
    if (paymentStatus === 'confirmed') {
      update.status = 'confirmed';
    } else if (paymentStatus === 'rejected') {
      update.status = 'pending';
    } else if (paymentStatus === 'unpaid') {
      update.status = 'pending';
      update.paymentScreenshot = null;
    }

    const team = await TournamentTeam.findByIdAndUpdate(teamId, update, { new: true });

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status for "${team.teamName}" set to ${paymentStatus}.`,
      team,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
