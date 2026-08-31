export const LEGACY_DEFAULT_BOOKING_POLICY = Object.freeze({
  timezone: 'Africa/Johannesburg',
  openTime: '10:00',
  closeTime: '22:00',
  slotMinutes: 60,
  minDurationHours: 1,
  maxDurationHours: 3,
  editCutoffMinutes: 8 * 60,
});

export const BOOKING_OPEN_HOUR = 10;
export const BOOKING_CLOSE_HOUR = 22;
export const BOOKING_MAX_DURATION = 3;
export const BOOKING_START_HOURS = Array.from(
  { length: BOOKING_CLOSE_HOUR - BOOKING_OPEN_HOUR },
  (_, index) => BOOKING_OPEN_HOUR + index,
);

const CLOCK_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function asPositiveInteger(value, fallback) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizeTimeZone(value) {
  const candidate = typeof value === 'string' && value.trim()
    ? value.trim()
    : LEGACY_DEFAULT_BOOKING_POLICY.timezone;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate }).format(new Date(0));
    return candidate;
  } catch {
    return LEGACY_DEFAULT_BOOKING_POLICY.timezone;
  }
}

function getTimeZoneOffsetMs(timeZone, date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  const representedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  const actualUtc = Math.floor(date.getTime() / 1000) * 1000;
  return representedAsUtc - actualUtc;
}

export function parseClockMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = CLOCK_RE.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToClock(totalMinutes) {
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0 || totalMinutes >= 24 * 60) {
    return null;
  }
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function resolveBookingPolicy(input = {}) {
  const candidate = input?.bookingPolicy && typeof input.bookingPolicy === 'object'
    ? input.bookingPolicy
    : (input && typeof input === 'object' ? input : {});

  const explicitKeys = [
    'openTime',
    'closeTime',
    'slotMinutes',
    'minDurationHours',
    'maxDurationHours',
    'editCutoffMinutes',
  ];
  const hasExplicitPolicy = explicitKeys.some((key) => candidate[key] !== undefined && candidate[key] !== null);

  let openTime = parseClockMinutes(candidate.openTime) !== null
    ? candidate.openTime
    : LEGACY_DEFAULT_BOOKING_POLICY.openTime;
  let closeTime = parseClockMinutes(candidate.closeTime) !== null
    ? candidate.closeTime
    : LEGACY_DEFAULT_BOOKING_POLICY.closeTime;
  let slotMinutes = asPositiveInteger(candidate.slotMinutes, LEGACY_DEFAULT_BOOKING_POLICY.slotMinutes);
  let minDurationHours = asPositiveInteger(
    candidate.minDurationHours,
    LEGACY_DEFAULT_BOOKING_POLICY.minDurationHours,
  );
  let maxDurationHours = asPositiveInteger(
    candidate.maxDurationHours,
    LEGACY_DEFAULT_BOOKING_POLICY.maxDurationHours,
  );
  const rawEditCutoff = Number(candidate.editCutoffMinutes);
  const editCutoffMinutes = Number.isInteger(rawEditCutoff) && rawEditCutoff >= 0
    ? rawEditCutoff
    : LEGACY_DEFAULT_BOOKING_POLICY.editCutoffMinutes;

  const openMinutes = parseClockMinutes(openTime);
  const closeMinutes = parseClockMinutes(closeTime);

  if (openMinutes === null || closeMinutes === null || closeMinutes <= openMinutes) {
    openTime = LEGACY_DEFAULT_BOOKING_POLICY.openTime;
    closeTime = LEGACY_DEFAULT_BOOKING_POLICY.closeTime;
  }

  if (slotMinutes > 12 * 60) {
    slotMinutes = LEGACY_DEFAULT_BOOKING_POLICY.slotMinutes;
  }

  if (maxDurationHours < minDurationHours) {
    maxDurationHours = minDurationHours;
  }

  const windowMinutes = parseClockMinutes(closeTime) - parseClockMinutes(openTime);
  const maxWindowHours = Math.max(1, Math.floor(windowMinutes / 60));
  minDurationHours = Math.min(minDurationHours, maxWindowHours);
  maxDurationHours = Math.min(maxDurationHours, maxWindowHours);

  return {
    timezone: normalizeTimeZone(candidate.timezone),
    openTime,
    closeTime,
    slotMinutes,
    minDurationHours,
    maxDurationHours,
    editCutoffMinutes,
    source: candidate.source === 'legacy-default' || !hasExplicitPolicy
      ? 'legacy-default'
      : 'court-policy',
  };
}

export function zonedDateTimeToDate(dateValue, timeValue, timeZone = LEGACY_DEFAULT_BOOKING_POLICY.timezone) {
  const dateMatch = typeof dateValue === 'string' ? DATE_RE.exec(dateValue) : null;
  const timeMinutes = parseClockMinutes(timeValue);
  if (!dateMatch || timeMinutes === null) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hour = Math.floor(timeMinutes / 60);
  const minute = timeMinutes % 60;
  const zone = normalizeTimeZone(timeZone);

  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const guess = new Date(wallClockAsUtc);
  const firstOffset = getTimeZoneOffsetMs(zone, guess);
  let instant = wallClockAsUtc - firstOffset;

  const secondOffset = getTimeZoneOffsetMs(zone, new Date(instant));
  if (secondOffset !== firstOffset) {
    instant = wallClockAsUtc - secondOffset;
  }

  const resolved = new Date(instant);
  return Number.isNaN(resolved.getTime()) ? null : resolved;
}

export function minutesUntilBookingStart(dateValue, timeValue, policyInput = {}, now = new Date()) {
  const policy = resolveBookingPolicy(policyInput);
  const start = zonedDateTimeToDate(dateValue, timeValue, policy.timezone);
  if (!start || Number.isNaN(now?.getTime?.())) return null;
  return (start.getTime() - now.getTime()) / (1000 * 60);
}

export function toHourStart(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

export function parseBookingHour(value) {
  const minutes = parseClockMinutes(value);
  if (minutes === null) return null;
  return {
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
  };
}

export function normalizeDuration(duration, policyInput = {}) {
  const policy = resolveBookingPolicy(policyInput);
  const numeric = Number(duration);
  if (!Number.isInteger(numeric)) return policy.minDurationHours;
  return Math.min(Math.max(numeric, policy.minDurationHours), policy.maxDurationHours);
}

export function formatBookingTimeLabel(value) {
  const minutes = parseClockMinutes(value);
  if (minutes === null) return value;

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

export function getDurationOptions(policyInput = {}) {
  const policy = resolveBookingPolicy(policyInput);
  return Array.from(
    { length: policy.maxDurationHours - policy.minDurationHours + 1 },
    (_, index) => policy.minDurationHours + index,
  );
}

export function getAllowedStartTimes(duration = 1, policyInput = {}) {
  const policy = resolveBookingPolicy(policyInput);
  const safeDuration = normalizeDuration(duration, policy);
  const openMinutes = parseClockMinutes(policy.openTime);
  const closeMinutes = parseClockMinutes(policy.closeTime);
  const latestStart = closeMinutes - safeDuration * 60;
  const slots = [];

  for (let minute = openMinutes; minute <= latestStart; minute += policy.slotMinutes) {
    const value = minutesToClock(minute);
    if (!value) continue;
    slots.push({ value, label: formatBookingTimeLabel(value) });
  }
  return slots;
}

export function getAllowedStartHours(duration = 1) {
  return getAllowedStartTimes(duration, LEGACY_DEFAULT_BOOKING_POLICY)
    .filter((option) => option.value.endsWith(':00'))
    .map((option) => Number(option.value.slice(0, 2)));
}

export function isWholeHourStartTime(value) {
  const parsed = parseBookingHour(value);
  return Boolean(parsed && parsed.minute === 0);
}

export function isAllowedBookingStartTime(value, duration = 1, policyInput = {}) {
  const policy = resolveBookingPolicy(policyInput);
  const startMinutes = parseClockMinutes(value);
  if (startMinutes === null) return false;

  const numericDuration = Number(duration);
  if (
    !Number.isInteger(numericDuration)
    || numericDuration < policy.minDurationHours
    || numericDuration > policy.maxDurationHours
  ) {
    return false;
  }

  const openMinutes = parseClockMinutes(policy.openTime);
  const closeMinutes = parseClockMinutes(policy.closeTime);
  if (startMinutes < openMinutes || startMinutes >= closeMinutes) return false;
  if ((startMinutes - openMinutes) % policy.slotMinutes !== 0) return false;

  return startMinutes + numericDuration * 60 <= closeMinutes;
}

export function bookingIntervalsOverlap(existing, requested) {
  const existingStart = parseClockMinutes(existing?.start_time);
  const requestedStart = parseClockMinutes(requested?.start_time);
  const existingDuration = Number(existing?.duration);
  const requestedDuration = Number(requested?.duration);

  if (
    existingStart === null
    || requestedStart === null
    || !Number.isFinite(existingDuration)
    || !Number.isFinite(requestedDuration)
  ) {
    return false;
  }

  const existingEnd = existingStart + existingDuration * 60;
  const requestedEnd = requestedStart + requestedDuration * 60;
  return requestedStart < existingEnd && requestedEnd > existingStart;
}

export function formatBookingPolicyLabel(policyInput = {}) {
  const policy = resolveBookingPolicy(policyInput);
  return `${formatBookingTimeLabel(policy.openTime)} - ${formatBookingTimeLabel(policy.closeTime)}`;
}

export function normalizeAvailabilityLabel(value) {
  if (!value) return formatBookingPolicyLabel(LEGACY_DEFAULT_BOOKING_POLICY);

  return value
    .replace('22:00 PM', '10:00 PM')
    .replace('22:00', '10:00 PM')
    .replace('21:00', '9:00 PM')
    .replace('10:00 AM - 10:00 PM PM', '10:00 AM - 10:00 PM');
}
