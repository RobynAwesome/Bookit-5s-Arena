export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fixture from '@/models/Fixture';
import TournamentTeam from '@/models/TournamentTeam';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import nodemailer from 'nodemailer';

/**
 * POST /api/admin/competitions/tournament/fixtures/notify
 * Sends fixture notifications to team managers based on their communicationPref.
 * Supports: email, whatsapp (wa.me deeplink generation), sms (placeholder)
 * Body: { fixtureIds?: string[] } — if omitted, notifies all unnotified scheduled fixtures
 */
export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!requireRole(session, 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { fixtureIds } = body;

    // Build query
    const query = {
      competitionType: 'tournament',
      status: 'scheduled',
      notificationsSent: { $ne: true },
    };
    if (fixtureIds?.length) {
      query._id = { $in: fixtureIds };
    }

    const fixtures = await Fixture.find(query).lean();
    if (!fixtures.length) {
      return NextResponse.json({ message: 'No unnotified fixtures found', count: 0 });
    }

    // Collect unique team IDs
    const teamIds = [...new Set(
      fixtures.flatMap(f => [f.homeTeam?.toString(), f.awayTeam?.toString()].filter(Boolean))
    )];

    const teams = await TournamentTeam.find({ _id: { $in: teamIds } }).lean();
    const teamMap = Object.fromEntries(teams.map(t => [t._id.toString(), t]));

    const results = { email: 0, whatsapp: 0, sms: 0, errors: 0 };
    const notifiedFixtureIds = [];

    // Email transporter (only init if needed)
    let transporter = null;
    const emailTeams = teams.filter(t => t.communicationPref === 'email' && t.managerEmail);
    if (emailTeams.length && process.env.EMAIL_FROM) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Group fixtures by team for notification
    const fixturesByTeam = {};
    for (const fixture of fixtures) {
      const homeId = fixture.homeTeam?.toString();
      const awayId = fixture.awayTeam?.toString();
      if (homeId) {
        if (!fixturesByTeam[homeId]) fixturesByTeam[homeId] = [];
        fixturesByTeam[homeId].push(fixture);
      }
      if (awayId) {
        if (!fixturesByTeam[awayId]) fixturesByTeam[awayId] = [];
        fixturesByTeam[awayId].push(fixture);
      }
    }

    for (const [teamId, teamFixtures] of Object.entries(fixturesByTeam)) {
      const team = teamMap[teamId];
      if (!team) continue;

      const fixtureLines = teamFixtures.map(f => {
        const homeTeam = teamMap[f.homeTeam?.toString()];
        const awayTeam = teamMap[f.awayTeam?.toString()];
        const homeName = homeTeam?.teamName || 'TBD';
        const awayName = awayTeam?.teamName || 'TBD';
        const date = f.scheduledAt
          ? new Date(f.scheduledAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })
          : 'TBD';
        return `Group ${f.groupLetter} | ${homeName} vs ${awayTeam ? awayName : awayName} | ${date} | ${f.venue || '5s Arena'}`;
      }).join('\n');

      const subject = `5s Arena World Cup – Your Match Fixtures`;
      const body = `Hi ${team.managerName},\n\nYour upcoming fixtures for the 5s Arena World Cup:\n\n${fixtureLines}\n\nGood luck!\n\n— 5s Arena Team\nfivesarena.com`;

      try {
        if (team.communicationPref === 'email' && transporter && team.managerEmail) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'noreply@fivesarena.com',
            to: team.managerEmail,
            subject,
            text: body,
          });
          results.email++;
        } else if (team.communicationPref === 'whatsapp' && team.managerPhone) {
          // WhatsApp deeplink stored for display — actual sending requires WhatsApp Business API
          const encodedMsg = encodeURIComponent(body);
          const phone = team.managerPhone.replace(/\D/g, '');
          // Log the WhatsApp link (can be used in UI to open chats manually)
          console.log(`WhatsApp notify: https://wa.me/${phone}?text=${encodedMsg}`);
          results.whatsapp++;
        } else if (team.communicationPref === 'sms') {
          // SMS placeholder — integrate Twilio when available
          console.log(`SMS notify to ${team.managerPhone}: ${body}`);
          results.sms++;
        }
      } catch (err) {
        console.error(`Notify failed for team ${team.teamName}:`, err.message);
        results.errors++;
      }
    }

    // Mark fixtures as notified
    const fixtureIdsToMark = fixtures.map(f => f._id);
    await Fixture.updateMany(
      { _id: { $in: fixtureIdsToMark } },
      { $set: { notificationsSent: true } }
    );

    notifiedFixtureIds.push(...fixtureIdsToMark.map(id => id.toString()));

    return NextResponse.json({
      message: 'Notifications dispatched',
      notified: notifiedFixtureIds.length,
      results,
    });
  } catch (err) {
    console.error('Fixture notify error:', err);
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
  }
}
