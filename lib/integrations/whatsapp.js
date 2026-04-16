/**
 * WhatsApp Notification Service
 * Orchestrates sending messages via Evolution API or high-fidelity simulation.
 */

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE = process.env.WHATSAPP_INSTANCE || "Arena_Main";
const SIMULATION_MODE = !WHATSAPP_API_URL || process.env.WHATSAPP_SIMULATION === "true";

export async function sendWhatsAppMessage({ to, message }) {
  const normalizedNumber = to.replace(/[^\d]/g, "");
  const zapierWebhook = process.env.WHATSAPP_ZAPIER_WEBHOOK;

  if (SIMULATION_MODE) {
    console.log(`[WA-SIM] To: ${normalizedNumber} | Msg: ${message}`);
    // Return mock success
    return { success: true, mode: "simulation" };
  }

  // Option 1: Zapier/Make Webhook (Easiest for quick scaling)
  if (zapierWebhook) {
     try {
       await fetch(zapierWebhook, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ to: normalizedNumber, message }),
       });
       return { success: true, provider: 'webhook' };
     } catch (err) {
       console.error("Webhook WA failure:", err);
     }
  }

  // Option 2: Evolution API / WPPConnect (Direct Implementation)
  if (WHATSAPP_API_URL) {
    try {
      const res = await fetch(`${WHATSAPP_API_URL}/message/sendText/${WHATSAPP_INSTANCE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: WHATSAPP_API_KEY,
        },
        body: JSON.stringify({
          number: normalizedNumber,
          text: message,
          linkPreview: true,
        }),
      });
      return await res.json();
    } catch (error) {
      console.error("Evolution API failure:", error);
      throw new Error("WhatsApp delivery failed");
    }
  }

  return { success: false, reason: "No provider configured" };
}

export async function sendBookingWATip({ to, name, courtName, date, time }) {
  const msg = `⚽ *5s Arena Booking Confirmed!*\n\nHi ${name}, your session at *${courtName}* is secured.\n\n📅 *Date:* ${date}\n⏰ *Time:* ${time}\n\nSee you on the pitch! 🏟️`;
  return await sendWhatsAppMessage({ to, message: msg });
}
