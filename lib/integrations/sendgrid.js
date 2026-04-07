// ── SendGrid Email Integration Boilerplate ──
// To activate: npm install @sendgrid/mail
// Then add SENDGRID_API_KEY and SENDGRID_FROM_EMAIL to .env.local
//
// Usage:
//   import { sendBookingConfirmation, sendCancellationEmail } from '@/lib/integrations/sendgrid';

import sgMailModule from '@sendgrid/mail';

let sgMail = null;
const getSendGrid = () => {
  if (!sgMail) {
    sgMail = sgMailModule;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  return sgMail;
};

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'bookings@fivesarena.com';

/**
 * Send a booking confirmation email
 * @param {Object} params - { to, userName, courtName, date, time, duration, totalPrice }
 */
export async function sendBookingConfirmation({ to, userName, courtName, date, time, duration, totalPrice }) {
  const sg = getSendGrid();
  await sg.send({
    to,
    from: { email: FROM_EMAIL, name: '5s Arena' },
    subject: `Booking Confirmed: ${courtName} on ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #15803d, #22c55e); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚽ Booking Confirmed!</h1>
        </div>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your court booking has been confirmed. Here are the details:</p>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 5px 0;"><strong>Court:</strong> ${courtName}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 5px 0;"><strong>Duration:</strong> ${duration} hour${duration > 1 ? 's' : ''}</p>
          <p style="margin: 5px 0;"><strong>Total:</strong> R${totalPrice}</p>
        </div>
        <p><strong>Reminders:</strong></p>
        <ul>
          <li>Arrive 10 minutes before your slot</li>
          <li>Flat-soled shoes or astro boots only (no studs)</li>
          <li>Pay at the venue (cash or card accepted)</li>
        </ul>
        <p>See you on the pitch!</p>
        <p style="color: #666; font-size: 12px;">— The 5s Arena Team<br>Hellenic Football Club, Milnerton, Cape Town</p>
      </div>
    `,
  });
}

/**
 * Send a booking cancellation email
 * @param {Object} params - { to, userName, courtName, date, time }
 */
export async function sendCancellationEmail({ to, userName, courtName, date, time }) {
  const sg = getSendGrid();
  await sg.send({
    to,
    from: { email: FROM_EMAIL, name: '5s Arena' },
    subject: `Booking Cancelled: ${courtName} on ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Booking Cancelled</h1>
        </div>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your booking for <strong>${courtName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
        <p>If this was a mistake, you can rebook from your dashboard.</p>
        <p style="color: #666; font-size: 12px;">— The 5s Arena Team</p>
      </div>
    `,
  });
}

/**
 * Send a generic notification email
 * @param {Object} params - { to, subject, html }
 */
export async function sendEmail({ to, subject, html }) {
  const sg = getSendGrid();
  await sg.send({
    to,
    from: { email: FROM_EMAIL, name: '5s Arena' },
    subject,
    html,
  });
}
