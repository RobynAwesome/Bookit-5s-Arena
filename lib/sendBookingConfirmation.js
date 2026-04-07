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

export async function sendBookingConfirmation({
  to, name, courtName, date, start_time, duration, total_price, type = 'confirmation'
}) {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const isUpdate = type === 'update';

  const logoHtml = (siteUrl && siteUrl.startsWith('https://') && !siteUrl.includes('localhost'))
    ? `<img src="${siteUrl}/images/logo.png" alt="5S Arena" width="52" height="52" style="width:52px;height:52px;border-radius:50%;border:2px solid #22c55e;object-fit:cover;display:block;" />`
    : `<div style="background: linear-gradient(135deg, #15803d, #22c55e); width: 52px; height: 52px; border-radius: 50%; text-align: center; line-height: 52px; border: 2px solid #4ade80; display: inline-block;"><span style="color: #fff; font-size: 22px; font-weight: 900; font-family: Impact, Arial Black, sans-serif; line-height: 52px; display: block;">5S</span></div>`;

  const subject = isUpdate
    ? `Booking Updated — ${courtName}`
    : `Booking Confirmed — ${courtName}`;

  const heading = isUpdate ? 'Booking Updated' : 'Booking Confirmed!';
  const message = isUpdate
    ? `Your booking for <strong>${courtName}</strong> has been updated. Here are your new details:`
    : `Your booking for <strong>${courtName}</strong> has been confirmed. Here are your details:`;

  await getTransporter().sendMail({
    from: `"Bookit 5s Arena" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

        <!-- Header -->
        <div style="background-color: #0a0a0a; padding: 24px 28px; border-radius: 12px 12px 0 0; border-bottom: 2px solid #22c55e;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <!-- Logo -->
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle;">
                      ${logoHtml}
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

          <h2 style="color: #111; margin-top: 0; font-size: 22px;">${heading}</h2>
          <p style="margin-bottom: 4px; color: #444;">Hi ${name},</p>
          <p style="color: #444;">${message}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; border-radius: 8px; overflow: hidden;">
            <tr style="background-color: #111; color: #fff;">
              <td style="padding: 12px 16px; font-weight: bold; width: 40%; border-radius: 8px 0 0 0;">Court</td>
              <td style="padding: 12px 16px; border-radius: 0 8px 0 0;">${courtName}</td>
            </tr>
            <tr style="background-color: #f4f4f4;">
              <td style="padding: 12px 16px; font-weight: bold; color: #555;">Date</td>
              <td style="padding: 12px 16px; color: #333;">${date}</td>
            </tr>
            <tr style="background-color: #fff;">
              <td style="padding: 12px 16px; font-weight: bold; color: #555;">Start Time</td>
              <td style="padding: 12px 16px; color: #333;">${start_time}</td>
            </tr>
            <tr style="background-color: #f4f4f4;">
              <td style="padding: 12px 16px; font-weight: bold; color: #555;">Duration</td>
              <td style="padding: 12px 16px; color: #333;">${duration} hour${duration > 1 ? 's' : ''}</td>
            </tr>
            <tr style="background-color: #14532d;">
              <td style="padding: 14px 16px; font-weight: bold; color: #86efac; border-radius: 0 0 0 8px;">Total</td>
              <td style="padding: 14px 16px; font-weight: bold; color: #4ade80; font-size: 18px; border-radius: 0 0 8px 0;">R${total_price}</td>
            </tr>
          </table>

          <div style="margin: 28px 0 20px;">
            <a href="${siteUrl}/bookings"
              style="display: inline-block; background: linear-gradient(135deg, #15803d, #22c55e); color: #fff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 1px;">
              ⚽ View My Bookings
            </a>
          </div>

          <p style="font-size: 13px; color: #888; margin-top: 24px;">
            Not you? <a href="${siteUrl}/login" style="color: #22c55e; font-weight: bold;">Log in to your account</a> to manage your bookings.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

          <p style="font-size: 12px; color: #aaa; margin: 0;">
            See you on the pitch! — The 5s Arena Team<br />
            <a href="${siteUrl}" style="color: #aaa; text-decoration: none;">${siteUrl}</a>
          </p>

        </div>
      </div>
    `,
  });
}
