export const BOOKING_OPEN_HOUR = 10;
export const BOOKING_CLOSE_HOUR = 22;
export const BOOKING_MAX_DURATION = 3;
export const BOOKING_START_HOURS = Array.from(
  { length: BOOKING_CLOSE_HOUR - BOOKING_OPEN_HOUR },
  (_, index) => BOOKING_OPEN_HOUR + index,
);

export function toHourStart(hour) {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function parseBookingHour(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, hourText, minuteText] = match;
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return { hour, minute };
}

export function normalizeDuration(duration) {
  const numeric = Number(duration);
  if (!Number.isInteger(numeric)) return 1;
  return Math.min(Math.max(numeric, 1), BOOKING_MAX_DURATION);
}

export function formatBookingTimeLabel(value) {
  const parsed = parseBookingHour(value);
  if (!parsed) return value;

  const suffix = parsed.hour >= 12 ? "PM" : "AM";
  const hour12 = parsed.hour % 12 || 12;
  return `${hour12}:00 ${suffix}`;
}

export function getAllowedStartHours(duration = 1) {
  const safeDuration = normalizeDuration(duration);
  return BOOKING_START_HOURS.filter(
    (hour) => hour + safeDuration <= BOOKING_CLOSE_HOUR,
  );
}

export function getAllowedStartTimes(duration = 1) {
  return getAllowedStartHours(duration).map((hour) => ({
    value: toHourStart(hour),
    label: formatBookingTimeLabel(toHourStart(hour)),
  }));
}

export function isWholeHourStartTime(value) {
  const parsed = parseBookingHour(value);
  if (!parsed) return false;
  return parsed.minute === 0;
}

export function isAllowedBookingStartTime(value, duration = 1) {
  const parsed = parseBookingHour(value);
  if (!parsed || parsed.minute !== 0) return false;
  if (parsed.hour < BOOKING_OPEN_HOUR || parsed.hour >= BOOKING_CLOSE_HOUR) {
    return false;
  }

  const safeDuration = normalizeDuration(duration);
  return parsed.hour + safeDuration <= BOOKING_CLOSE_HOUR;
}

export function normalizeAvailabilityLabel(value) {
  if (!value) return "10:00 AM - 10:00 PM";

  return value
    .replace("22:00 PM", "10:00 PM")
    .replace("22:00", "10:00 PM")
    .replace("21:00", "9:00 PM")
    .replace("10:00 AM - 10:00 PM PM", "10:00 AM - 10:00 PM");
}
