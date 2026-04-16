export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';

/**
 * GET: Public list of tournament fixtures
 * Query params: ?status=live&limit=4
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Number(searchParams.get('limit')) || 20;

    const filter = { competitionType: 'tournament' };
    if (status) filter.status = status;

    await connectDB();

    const fixtures = await Fixture.find(filter)
      .populate('homeTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter')
      .populate('awayTeam', 'teamName worldCupTeam worldCupTeamLogo groupLetter')
      .sort({ scheduledAt: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ fixtures });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
