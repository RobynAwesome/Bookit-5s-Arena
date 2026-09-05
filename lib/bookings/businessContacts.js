const DEFAULT_BUSINESS_EMAIL = 'fivearena@gmail.com';
const DEFAULT_BUSINESS_WHATSAPP = '27637820245';

function clean(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

export function getBookingBusinessContacts() {
  return {
    email: clean(process.env.BOOKING_BUSINESS_EMAIL || process.env.BUSINESS_EMAIL) || DEFAULT_BUSINESS_EMAIL,
    whatsapp:
      clean(process.env.BOOKING_BUSINESS_WHATSAPP || process.env.BUSINESS_WHATSAPP_NUMBER) ||
      DEFAULT_BUSINESS_WHATSAPP,
    sms: clean(process.env.BOOKING_BUSINESS_SMS || process.env.BUSINESS_SMS_NUMBER),
  };
}

export const bookingBusinessContactDefaults = Object.freeze({
  email: DEFAULT_BUSINESS_EMAIL,
  whatsapp: DEFAULT_BUSINESS_WHATSAPP,
});
