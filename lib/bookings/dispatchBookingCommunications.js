import BookingDelivery from '@/models/BookingDelivery';
import { getBookingBusinessContacts } from '@/lib/bookings/businessContacts';
import { sendBookingReservationEmail } from '@/lib/messaging/bookingReservationEmail';
import { sendWhatsAppMessage } from '@/lib/integrations/whatsapp';
import { sendSmsMessage } from '@/lib/integrations/sms';

function clean(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function buildUserNotice({ booking, court, name }) {
  return `⚽ *5s Arena Court Reserved*\n\nHi ${name || 'player'}, your slot at *${court.name}* is reserved.\n\n📅 *Date:* ${booking.date}\n⏰ *Time:* ${booking.start_time}\n⏱️ *Duration:* ${booking.duration}h\n💵 *Amount due:* R${booking.total_price}\n💳 *Payment:* Pay at venue\n\nReservation ID: ${booking._id}\nThis confirms the reservation, not payment.`;
}

function buildBusinessNotice({ booking, court, customerName, customerEmail, customerPhone }) {
  return `⚽ *New 5s Arena Reservation*\n\n🏟️ *Court:* ${court.name}\n📅 *Date:* ${booking.date}\n⏰ *Time:* ${booking.start_time}\n⏱️ *Duration:* ${booking.duration}h\n💵 *Amount due:* R${booking.total_price}\n👤 *Customer:* ${customerName || 'Guest'}\n📧 *Email:* ${customerEmail || 'Not provided'}\n📱 *Phone:* ${customerPhone || 'Not provided'}\n🧾 *Booking:* ${booking._id}\n\nState: reserved / pay at venue.`;
}

async function getOrCreateDelivery({ bookingId, recipientType, channel, purpose, recipientAddress }) {
  try {
    return await BookingDelivery.create({
      booking: bookingId,
      recipientType,
      channel,
      purpose,
      recipientAddress: recipientAddress || '[missing]',
      status: recipientAddress ? 'queued' : 'skipped',
      error: recipientAddress ? null : `Missing ${channel} destination`,
    });
  } catch (error) {
    if (error?.code !== 11000) throw error;
    return BookingDelivery.findOne({
      booking: bookingId,
      recipientType,
      channel,
      purpose,
    });
  }
}

function receiptMeta({ recipientType, channel, purpose }) {
  return { recipientType, channel, purpose };
}

async function runDelivery({ bookingId, recipientType, channel, purpose, recipientAddress, send }) {
  const meta = receiptMeta({ recipientType, channel, purpose });
  const delivery = await getOrCreateDelivery({
    bookingId,
    recipientType,
    channel,
    purpose,
    recipientAddress,
  });

  if (!delivery) {
    return { ...meta, status: 'failed', error: 'Unable to create delivery receipt' };
  }

  if (!recipientAddress) {
    return {
      ...meta,
      status: 'skipped',
      deliveryId: delivery._id.toString(),
      error: `Missing ${channel} destination`,
    };
  }

  if (delivery.status === 'sent') {
    return {
      ...meta,
      status: 'sent',
      duplicateSuppressed: true,
      deliveryId: delivery._id.toString(),
    };
  }

  const claimed = await BookingDelivery.findOneAndUpdate(
    {
      _id: delivery._id,
      status: { $in: ['queued', 'failed', 'skipped'] },
    },
    {
      $set: {
        status: 'sending',
        recipientAddress,
        lastAttemptAt: new Date(),
        error: null,
      },
      $inc: { attempts: 1 },
    },
    { new: true }
  );

  if (!claimed) {
    const current = await BookingDelivery.findById(delivery._id).lean();
    return {
      ...meta,
      status: current?.status || 'sending',
      duplicateSuppressed: true,
      deliveryId: delivery._id.toString(),
    };
  }

  try {
    const result = await send();
    const success = result?.success === true;
    const skipped = !success && result?.skipped === true;
    const finalStatus = success ? 'sent' : skipped ? 'skipped' : 'failed';
    const errorMessage = success
      ? null
      : clean(result?.reason || result?.error?.message || result?.error || `${channel} delivery failed`);

    await BookingDelivery.updateOne(
      { _id: delivery._id },
      {
        $set: {
          status: finalStatus,
          provider: clean(result?.provider || result?.mode || channel),
          providerMessageId: clean(result?.providerMessageId),
          sentAt: success ? new Date() : null,
          error: errorMessage,
        },
      }
    );

    return {
      ...meta,
      status: finalStatus,
      provider: result?.provider || result?.mode || channel,
      deliveryId: delivery._id.toString(),
      error: errorMessage,
    };
  } catch (error) {
    const errorMessage = error?.message || `${channel} delivery failed`;
    await BookingDelivery.updateOne(
      { _id: delivery._id },
      {
        $set: {
          status: 'failed',
          provider: channel,
          error: errorMessage,
        },
      }
    );
    return {
      ...meta,
      status: 'failed',
      deliveryId: delivery._id.toString(),
      error: errorMessage,
    };
  }
}

/**
 * Fan out reservation communications only after the Booking document exists.
 *
 * Always-on receipts:
 * - user email
 * - business email
 * - business WhatsApp
 *
 * User operational channel:
 * - WhatsApp by default
 * - SMS when explicitly selected
 * - Email selection reuses the always-on user email receipt to avoid duplicates
 */
export async function dispatchBookingCommunications({
  booking,
  court,
  customerName,
  customerEmail,
  customerPhone,
  preferredChannel = 'whatsapp',
}) {
  const business = getBookingBusinessContacts();
  const safePreference = ['whatsapp', 'email', 'sms'].includes(preferredChannel)
    ? preferredChannel
    : 'whatsapp';

  const userMessage = buildUserNotice({ booking, court, name: customerName });
  const businessMessage = buildBusinessNotice({
    booking,
    court,
    customerName,
    customerEmail,
    customerPhone,
  });

  const tasks = [
    runDelivery({
      bookingId: booking._id,
      recipientType: 'user',
      channel: 'email',
      purpose: 'reservation_receipt',
      recipientAddress: clean(customerEmail),
      send: () =>
        sendBookingReservationEmail({
          to: customerEmail,
          recipientName: customerName,
          recipientType: 'user',
          booking,
          court,
        }),
    }),
    runDelivery({
      bookingId: booking._id,
      recipientType: 'business',
      channel: 'email',
      purpose: 'reservation_receipt',
      recipientAddress: business.email,
      send: () =>
        sendBookingReservationEmail({
          to: business.email,
          recipientName: '5s Arena team',
          recipientType: 'business',
          booking,
          court,
        }),
    }),
    runDelivery({
      bookingId: booking._id,
      recipientType: 'business',
      channel: 'whatsapp',
      purpose: 'reservation_notice',
      recipientAddress: business.whatsapp,
      send: () => sendWhatsAppMessage({ to: business.whatsapp, message: businessMessage }),
    }),
  ];

  if (safePreference === 'whatsapp') {
    tasks.push(
      runDelivery({
        bookingId: booking._id,
        recipientType: 'user',
        channel: 'whatsapp',
        purpose: 'reservation_notice',
        recipientAddress: clean(customerPhone),
        send: () => sendWhatsAppMessage({ to: customerPhone, message: userMessage }),
      })
    );
  } else if (safePreference === 'sms') {
    tasks.push(
      runDelivery({
        bookingId: booking._id,
        recipientType: 'user',
        channel: 'sms',
        purpose: 'reservation_notice',
        recipientAddress: clean(customerPhone),
        send: () => sendSmsMessage({ to: customerPhone, message: userMessage.replace(/\*/g, '') }),
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  return results.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : { status: 'failed', error: result.reason?.message || String(result.reason) }
  );
}
