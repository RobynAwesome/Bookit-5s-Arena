import nodemailer from 'nodemailer';

// Lazy-load transporter so missing env vars don't crash cold-start
const getTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const HEADER = `
  <div style="background-color:#0a0a0a;padding:24px 28px;border-radius:12px 12px 0 0;border-bottom:2px solid #22c55e;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td>
      <table cellpadding="0" cellspacing="0"><tr>
        <td><div style="background:linear-gradient(135deg,#15803d,#22c55e);width:48px;height:48px;border-radius:50%;text-align:center;line-height:48px;display:inline-block;border:2px solid #4ade80;"><span style="color:#fff;font-size:20px;font-weight:900;font-family:Impact,Arial Black,sans-serif;display:block;line-height:48px;">5S</span></div></td>
        <td style="padding-left:14px;vertical-align:middle;">
          <div style="color:#fff;font-size:20px;font-family:Impact,Arial Black,sans-serif;letter-spacing:3px;line-height:1;">5S ARENA</div>
          <div style="color:#22c55e;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin-top:3px;">Milnerton · Cape Town</div>
        </td>
      </tr></table>
    </td></tr></table>
  </div>
`;

const FOOTER = `
  <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />
  <p style="font-size:12px;color:#aaa;margin:0;">
    See you on the pitch! — The 5s Arena Team<br />
    <a href="${siteUrl}" style="color:#aaa;text-decoration:none;">${siteUrl}</a>
  </p>
`;

/**
 * Send fixture notification to a team manager
 */
export async function sendFixtureNotification({
  to,
  managerName,
  teamName,
  opponentName,
  matchday,
  groupLetter,
  competitionName,
  scheduledAt,
}) {
  const dateStr = scheduledAt
    ? new Date(scheduledAt).toLocaleDateString('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'TBD';
  const timeStr = scheduledAt
    ? new Date(scheduledAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
    : 'TBD';

  await getTransporter().sendMail({
    from: `"5s Arena" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Fixture Notice — ${teamName} vs ${opponentName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
        ${HEADER}
        <div style="background-color:#f9f9f9;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none;">
          <h2 style="color:#111;margin-top:0;font-size:22px;">⚽ Fixture Confirmed</h2>
          <p>Hi <strong>${managerName}</strong>,</p>
          <p>Your fixture for <strong>${competitionName}</strong> has been scheduled.</p>

          <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:14px;border-radius:8px;overflow:hidden;">
            <tr style="background-color:#111;color:#fff;">
              <td style="padding:12px 16px;font-weight:bold;width:40%;">Competition</td>
              <td style="padding:12px 16px;">${competitionName}</td>
            </tr>
            <tr style="background-color:#f4f4f4;">
              <td style="padding:12px 16px;font-weight:bold;color:#555;">Your Team</td>
              <td style="padding:12px 16px;color:#333;font-weight:bold;">${teamName}</td>
            </tr>
            <tr style="background-color:#fff;">
              <td style="padding:12px 16px;font-weight:bold;color:#555;">Opponent</td>
              <td style="padding:12px 16px;color:#333;">${opponentName}</td>
            </tr>
            ${groupLetter ? `<tr style="background-color:#f4f4f4;"><td style="padding:12px 16px;font-weight:bold;color:#555;">Group</td><td style="padding:12px 16px;color:#333;">Group ${groupLetter}</td></tr>` : ''}
            <tr style="background-color:#f4f4f4;">
              <td style="padding:12px 16px;font-weight:bold;color:#555;">Matchday</td>
              <td style="padding:12px 16px;color:#333;">Matchday ${matchday}</td>
            </tr>
            <tr style="background-color:#fff;">
              <td style="padding:12px 16px;font-weight:bold;color:#555;">Date</td>
              <td style="padding:12px 16px;color:#333;">${dateStr}</td>
            </tr>
            <tr style="background-color:#14532d;">
              <td style="padding:14px 16px;font-weight:bold;color:#86efac;border-radius:0 0 0 8px;">Time</td>
              <td style="padding:14px 16px;font-weight:bold;color:#4ade80;font-size:18px;border-radius:0 0 8px 0;">${timeStr}</td>
            </tr>
          </table>

          <div style="background:#111;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="color:#9ca3af;margin:0;font-size:13px;">📍 <strong style="color:#fff;">Venue:</strong> Hellenic Football Club, Milnerton, Cape Town</p>
          </div>

          <a href="${siteUrl}/manager/fixtures"
            style="display:inline-block;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:1px;">
            View My Fixtures
          </a>

          ${FOOTER}
        </div>
      </div>
    `,
  });
}

/**
 * Send match result notification
 */
export async function sendMatchResultNotification({
  to,
  managerName,
  teamName,
  opponentName,
  myScore,
  opponentScore,
  competitionName,
  groupLetter,
}) {
  const won = myScore > opponentScore;
  const drew = myScore === opponentScore;
  const resultText = won ? 'WIN' : drew ? 'DRAW' : 'LOSS';
  const resultColor = won ? '#22c55e' : drew ? '#eab308' : '#ef4444';

  await getTransporter().sendMail({
    from: `"5s Arena" <${process.env.GMAIL_USER}>`,
    to,
    subject: `Match Result — ${teamName} ${myScore}:${opponentScore} ${opponentName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
        ${HEADER}
        <div style="background-color:#f9f9f9;padding:32px 28px;border-radius:0 0 12px 12px;border:1px solid #e5e5e5;border-top:none;">
          <h2 style="color:#111;margin-top:0;font-size:22px;">Full Time Result</h2>
          <p>Hi <strong>${managerName}</strong>,</p>

          <div style="text-align:center;margin:24px 0;">
            <div style="background:#111;border-radius:16px;padding:28px;display:inline-block;min-width:300px;">
              <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:3px;margin:0 0 16px;">Final Score</p>
              <div style="font-size:48px;font-weight:900;color:#fff;font-family:Impact,Arial Black,sans-serif;letter-spacing:4px;">
                ${myScore} <span style="color:#374151;">:</span> ${opponentScore}
              </div>
              <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">${teamName} vs ${opponentName}</p>
              <div style="margin-top:16px;padding:8px 20px;border-radius:999px;display:inline-block;background:${resultColor}20;border:1px solid ${resultColor}50;">
                <span style="color:${resultColor};font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:3px;">${resultText}</span>
              </div>
            </div>
          </div>

          <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
            <tr style="background-color:#f4f4f4;">
              <td style="padding:10px 16px;font-weight:bold;color:#555;width:40%;">Competition</td>
              <td style="padding:10px 16px;color:#333;">${competitionName}</td>
            </tr>
            ${groupLetter ? `<tr style="background:#fff;"><td style="padding:10px 16px;font-weight:bold;color:#555;">Group</td><td style="padding:10px 16px;color:#333;">Group ${groupLetter}</td></tr>` : ''}
          </table>

          <a href="${siteUrl}/manager/fixtures"
            style="display:inline-block;background:linear-gradient(135deg,#15803d,#22c55e);color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;letter-spacing:1px;margin-top:8px;">
            View Full Standings
          </a>

          ${FOOTER}
        </div>
      </div>
    `,
  });
}
