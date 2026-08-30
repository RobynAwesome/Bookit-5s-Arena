/**
 * WhatsApp Notification Service
 * Orchestrates sending messages via a configured webhook or Evolution API.
 * Simulation is evidence-classified and never returned as a successful send.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || 'Arena_Main';
const SIMULATION_MODE = !WHATSAPP_API_URL || process.env.WHATSAPP_SIMULATION === 'true';

function normalizeNumber(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export async function sendWhatsAppMessage({ to, message }) {
  const normalizedNumber = normalizeNumber(to);
  const zapierWebhook = String(process.env.WHATSAPP_ZAPIER_WEBHOOK || '').trim();

  if (!normalizedNumber) {
    return { success: false, skipped: true, provider: 'whatsapp', reason: 'Missing phone number' };
  }

  // A simulator can help development, but it is never a delivery receipt.
  if (SIMULATION_MODE && !zapierWebhook) {
    console.log(`[WA-SIM] To: ${normalizedNumber} | Msg: ${message}`);
    return {
      success: false,
      skipped: true,
      provider: 'simulation',
      mode: 'simulation',
      reason: 'WhatsApp provider is not configured; simulation is not delivery',
    };
  }

  if (zapierWebhook) {
    try {
      const response = await fetch(zapierWebhook, {
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

  return { success: false, skipped: true, provider: 'whatsapp', reason: 'No provider configured' };
}

export async function sendBookingWATip({ to, name, courtName, date, time }) {
  const msg = `⚽ *5s Arena Court Reserved*\n\nHi ${name}, your slot at *${courtName}* is reserved.\n\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n💵 *Payment:* Pay at venue\n\nThis message confirms the reservation, not payment.`;
  return sendWhatsAppMessage({ to, message: msg });
}
