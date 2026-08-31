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

function asPositiveInteger(value, fallback) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : fallback;
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

  // Invalid or inverted windows fall back as a complete unit rather than
  // silently inventing a hybrid business policy.
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
    timezone: typeof candidate.timezone === 'string' && candidate.timezone.trim()
      ? candidate.timezone.trim()
      : LEGACY_DEFAULT_BOOKING_POLICY.timezone,
    openTime,
    closeTime,
    slotMinutes,
    minDurationHours,
    maxDurationHours,
    editCutoffMinutes,
    source: hasExplicitPolicy ? 'court-policy' : 'legacy-default',
  };
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
