import nodemailer from 'nodemailer';
import { Resend } from 'resend';

let resendClient = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildReservationEmail({ recipientName, recipientType, booking, court }) {
  const isBusiness = recipientType === 'business';
  const revision = Math.max(1, Number(booking.communicationRevision || 1));
  const isUpdate = revision > 1;
  const title = isUpdate
    ? isBusiness ? 'Updated Court Reservation' : 'Court Reservation Updated'
    : isBusiness ? 'New Court Reservation' : 'Court Reservation Receipt';
  const intro = isBusiness
    ? isUpdate
      ? `${recipientName || '5s Arena team'}, an existing court reservation has been updated in the booking system.`
      : `${recipientName || '5s Arena team'}, a new court reservation has been persisted and is now visible in the booking system.`
    : isUpdate
      ? `Hi ${recipientName || 'player'}, your court reservation details have been updated. Payment remains due at the venue unless recorded as paid below.`
      : `Hi ${recipientName || 'player'}, your court slot has been reserved. Payment is due at the venue.`;

  const paymentLabel = booking.paymentStatus === 'paid' ? 'Paid' : 'Pay at venue';
  const safeTitle = escapeHtml(title);

  return {
    subject: `${title} — ${court.name} — ${booking.date} ${booking.start_time}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#111827">
        <div style="background:#030712;color:#fff;padding:22px 26px;border-radius:12px 12px 0 0;border-bottom:2px solid #22c55e">
          <div style="font-weight:900;letter-spacing:2px;font-size:20px">5S ARENA</div>
          <div style="color:#86efac;font-size:12px;margin-top:4px">${safeTitle}</div>
        </div>
        <div style="padding:26px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;background:#fff">
          <p style="margin-top:0">${escapeHtml(intro)}</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Booking ID</td><td style="padding:9px">${escapeHtml(booking._id)}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Revision</td><td style="padding:9px">${revision}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Court</td><td style="padding:9px;background:#f3f4f6">${escapeHtml(court.name)}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Date</td><td style="padding:9px">${escapeHtml(booking.date)}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Time</td><td style="padding:9px;background:#f3f4f6">${escapeHtml(booking.start_time)}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Duration</td><td style="padding:9px">${booking.duration} hour${booking.duration === 1 ? '' : 's'}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Amount due</td><td style="padding:9px;background:#f3f4f6">ZAR ${escapeHtml(booking.total_price)}</td></tr>
            <tr><td style="padding:9px;font-weight:700">Payment state</td><td style="padding:9px">${paymentLabel}</td></tr>
            <tr><td style="padding:9px;font-weight:700;background:#f3f4f6">Reservation state</td><td style="padding:9px;background:#f3f4f6">${escapeHtml(booking.status)}</td></tr>
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
  let resendFailure = null;

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
      resendFailure = typeof error === 'string' ? error : JSON.stringify(error);
    } catch (error) {
      resendFailure = error?.message || 'Resend reservation email failed';
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

  if (resendFailure) {
    return { success: false, provider: 'resend', reason: resendFailure };
  }

  return {
    success: false,
    skipped: true,
    provider: 'email',
    reason: 'No email provider is configured',
  };
}
