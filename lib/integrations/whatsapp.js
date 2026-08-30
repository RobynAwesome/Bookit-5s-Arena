/**
 * WhatsApp Notification Service
 * Orchestrates sending messages via a configured webhook or Evolution API.
 * Simulation is evidence-classified and never returned as a successful send.
 */

const WHATSAPP_API_URL = String(process.env.WHATSAPP_API_URL || '').trim();
const WHATSAPP_API_KEY = String(process.env.WHATSAPP_API_KEY || '').trim();
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || 'Arena_Main';
const WHATSAPP_SIMULATION = process.env.WHATSAPP_SIMULATION === 'true';

function normalizeNumber(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export async function sendWhatsAppMessage({ to, message }) {
  const normalizedNumber = normalizeNumber(to);
  const webhook = String(process.env.WHATSAPP_ZAPIER_WEBHOOK || '').trim();

  if (!normalizedNumber) {
    return { success: false, skipped: true, provider: 'whatsapp', reason: 'Missing phone number' };
  }

  // Explicit simulation is a no-send mode even when real provider credentials
  // are present. It may exercise application flow, but it is never delivery.
  if (WHATSAPP_SIMULATION) {
    console.log(`[WA-SIM] To: ${normalizedNumber} | Msg: ${message}`);
    return {
      success: false,
      skipped: true,
      provider: 'simulation',
      mode: 'simulation',
      reason: 'WhatsApp simulation is enabled; no real message was sent',
    };
  }

  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: normalizedNumber, message }),
      });

      const responseText = await response.text();
      let payload = null;
      try {
        payload = responseText ? JSON.parse(responseText) : null;
      } catch {
        payload = responseText || null;
      }

      if (!response.ok) {
        return {
          success: false,
          provider: 'whatsapp-webhook',
          reason: `WhatsApp webhook returned HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        provider: 'whatsapp-webhook',
        providerMessageId:
          payload?.id || payload?.messageId || payload?.message_id || payload?.key?.id || null,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'whatsapp-webhook',
        reason: error?.message || 'WhatsApp webhook delivery failed',
      };
    }
  }

  if (WHATSAPP_API_URL) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(WHATSAPP_API_KEY ? { apikey: WHATSAPP_API_KEY } : {}),
        },
        body: JSON.stringify({
          number: normalizedNumber,
          text: message,
          linkPreview: true,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        return {
          success: false,
          provider: 'evolution-api',
          reason: `Evolution API returned HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        provider: 'evolution-api',
        providerMessageId:
          payload?.key?.id || payload?.id || payload?.messageId || payload?.message_id || null,
      };
    } catch (error) {
      return {
        success: false,
        provider: 'evolution-api',
        reason: error?.message || 'WhatsApp delivery failed',
      };
    }
  }

  return {
    success: false,
    skipped: true,
    provider: 'whatsapp',
    reason: 'No WhatsApp provider is configured',
  };
}

export async function sendBookingWATip({ to, name, courtName, date, time }) {
  const msg = `⚽ *5s Arena Court Reserved*\n\nHi ${name}, your slot at *${courtName}* is reserved.\n\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n💵 *Payment:* Pay at venue\n\nThis message confirms the reservation, not payment.`;
  return sendWhatsAppMessage({ to, message: msg });
}
