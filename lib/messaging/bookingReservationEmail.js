import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let resendClient = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function buildReservationEmail({ recipientName, recipientType, booking, court }) {
  const isBusiness = recipientType === 'business';
  const title = isBusiness ? 'New Court Reservation' : 'Court Reservation Receipt';
  const intro = isBusiness
    ? `${recipientName || '5s Arena team'}, a new court reservation has been persisted and is now visible in the booking system.`
    : `Hi ${recipientName || 'player'}, your court slot has been reserved. Payment is due at the venue.`;

  const paymentLabel = booking.paymentStatus === 'paid' ? 'Paid' : 'Pay at venue';

  return {
    subject: `${title} — ${court.name} — ${booking.date} ${booking.start_time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111827">
        <div style="background:#030712;color:#fff;padding:22px 26px;border-radius:12px 12px 0 0;border-bottom:2px solid #22c55e">
          <div style="font-weight:900;letter-spacing:2px;font-size:20px">5S ARENA</div>
          <div style="color:#86efac;font-size:12px;margin-top:4px">${title}</div>
        </div>
        <div style="padding:26px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;background:#fff">
          <p style="margin-top:0">${intro}</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Booking ID</td><td style="padding:9px">${booking._id}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Court</td><td style="padding:9px">${court.name}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Date</td><td style="padding:9px;background:#f3f4f6">${booking.date}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Time</td><td style="padding:9px">${booking.start_time}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Duration</td><td style="padding:9px;background:#f3f4f6">${booking.duration} hour${booking.duration === 1 ? '' : 's'}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Amount due</td><td style="padding:9px">ZAR ${booking.total_price}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Payment state</td><td style="padding:9px;background:#f3f4f6">${paymentLabel}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Reservation state</td><td style="padding:9px">${booking.status}</td></tr>
          </table>
          <p style="font-size:12px;color:#6b7280;margin-bottom:0">This message records the reservation. It does not claim payment has been received unless the payment state above says Paid.</p>
        </div>
      </div>
    `,
  };
}

export async function sendBookingReservationEmail({ to, recipientName, recipientType, booking, court }) {
  if (!to) {
    return { success: false, skipped: true, provider: 'email', reason: 'Missing email address' };
  }

  const message = buildReservationEmail({ recipientName, recipientType, booking, court });
  const resend = getResendClient();

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.BOOKING_EMAIL_FROM || 'Bookings <bookings@fivesarena.com>',
        to: [to],
        subject: message.subject,
        html: message.html,
      });
      if (!error) {
        return { success: true, provider: 'resend', providerMessageId: data?.id || null };
      }
    } catch (error) {
      console.error('Resend reservation email failed:', error);
    }
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
      const info = await transporter.sendMail({
        from: `"Bookit 5s Arena" <${process.env.GMAIL_USER}>`,
        to,
        subject: message.subject,
        html: message.html,
      });
      return {
        success: true,
        provider: 'gmail',
        providerMessageId: info?.messageId || null,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'gmail',
        reason: error?.message || 'Gmail reservation email failed',
      };
    }
  }

  return {
    success: false,
    skipped: true,
    provider: 'email',
    reason: 'No email provider is configured',
  };
}
