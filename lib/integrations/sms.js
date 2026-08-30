function normalizePhone(value) {
  return String(value || '').replace(/[^\d+]/g, '').trim();
}

/**
 * Provider-neutral SMS adapter.
 *
 * Configure `SMS_WEBHOOK_URL` to an SMS provider/automation endpoint that
 * accepts `{ to, message }`. An optional `SMS_API_KEY` is sent as a Bearer
 * token. Missing configuration is returned as an explicit skipped receipt —
 * never as a successful delivery.
 */
export async function sendSmsMessage({ to, message }) {
  const endpoint = String(process.env.SMS_WEBHOOK_URL || '').trim();
  const apiKey = String(process.env.SMS_API_KEY || '').trim();
  const normalizedNumber = normalizePhone(to);

  if (!normalizedNumber) {
    return { success: false, skipped: true, provider: 'sms-webhook', reason: 'Missing phone number' };
  }

  if (!endpoint) {
    return {
      success: false,
      skipped: true,
      provider: 'sms-webhook',
      reason: 'SMS_WEBHOOK_URL is not configured',
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
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
        provider: 'sms-webhook',
        reason: `SMS provider returned HTTP ${response.status}`,
        response: payload,
      };
    }

    return {
      success: true,
      provider: 'sms-webhook',
      providerMessageId:
        payload?.id || payload?.messageId || payload?.message_id || payload?.sid || null,
    };
  } catch (error) {
    return {
      success: false,
      provider: 'sms-webhook',
      reason: error?.message || 'SMS delivery failed',
    };
  }
}
