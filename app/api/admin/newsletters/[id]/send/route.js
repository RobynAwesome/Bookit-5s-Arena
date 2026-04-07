export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/getSession';
import { requireRole } from '@/lib/roles';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import User from '@/models/User';
import nodemailer from 'nodemailer';

// Lazy-load so missing env vars don't crash cold-start
const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

function buildEmailHtml(newsletter) {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

      <!-- Header -->
      <div style="background-color: #0a0a0a; padding: 24px 28px; border-radius: 12px 12px 0 0; border-bottom: 2px solid #22c55e;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: linear-gradient(135deg, #15803d, #22c55e); width: 48px; height: 48px; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="color: #fff; font-size: 20px; font-weight: 900; font-family: Impact, Arial Black, sans-serif; line-height: 48px;">5S</span>
                  </td>
                  <td style="padding-left: 14px; vertical-align: middle;">
                    <div style="color: #fff; font-size: 22px; font-family: Impact, Arial Black, sans-serif; letter-spacing: 3px; line-height: 1;">5S ARENA</div>
                    <div style="color: #22c55e; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 3px;">Milnerton · Cape Town</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>

      <!-- Body -->
      <div style="background-color: #f9f9f9; padding: 32px 28px; border-radius: 0 0 12px 12px; border: 1px solid #e5e5e5; border-top: none;">

        <h2 style="color: #111; margin-top: 0; font-size: 22px;">${newsletter.title}</h2>

        <div style="color: #333; line-height: 1.7; font-size: 15px;">
          ${newsletter.body}
        </div>

        <div style="margin: 28px 0 20px;">
          <a href="${siteUrl}"
            style="display: inline-block; background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px;">
            ⚽ Visit 5S Arena
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

        <p style="font-size: 12px; color: #aaa; margin: 0;">
          You are receiving this email because you subscribed to the 5S Arena newsletter.<br />
          To unsubscribe, visit your <a href="${siteUrl}/profile" style="color: #aaa;">Profile page</a>.<br />
          <a href="${siteUrl}" style="color: #aaa; text-decoration: none;">${siteUrl}</a>
        </p>

      </div>
    </div>
  `;
}

export async function POST(request, { params }) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    if (!requireRole(session, 'admin')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();

    const newsletter = await Newsletter.findById(params.id);
    if (!newsletter) return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });

    if (newsletter.status === 'sent') {
      return NextResponse.json({ error: 'Newsletter has already been sent' }, { status: 400 });
    }

    // Get all opted-in subscribers
    const subscribers = await User.find({ newsletterOptIn: true }).select('email name').lean();

    if (!subscribers.length) {
      return NextResponse.json({ error: 'No subscribers to send to' }, { status: 400 });
    }

    const html = buildEmailHtml(newsletter);

    // Send emails (batch with BCC or individual — using individual for personalisation)
    let sent = 0;
    const errors = [];
    for (const sub of subscribers) {
      try {
        await getTransporter().sendMail({
          from: `"${newsletter.fromName}" <${process.env.GMAIL_USER}>`,
          to: sub.email,
          subject: newsletter.subject,
          html,
        });
        sent++;
      } catch (err) {
        errors.push({ email: sub.email, error: err.message });
      }
    }

    // Update newsletter status
    await Newsletter.findByIdAndUpdate(params.id, {
      status: 'sent',
      sentAt: new Date(),
      recipientCount: sent,
    });

    return NextResponse.json({
      ok: true,
      sent,
      failed: errors.length,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error('POST /api/admin/newsletters/[id]/send error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
