export class BookingSlotShapeError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'BookingSlotShapeError';
    this.code = code;
  }
}

/**
 * Expand an hourly booking into the exact atomic slots it owns.
 * Example: 10:00 for 3 hours => 10:00, 11:00, 12:00.
 */
export function buildOccupiedStartTimes(startTime, duration) {
  if (!/^\d{2}:\d{2}$/.test(String(startTime || ''))) {
    throw new BookingSlotShapeError('INVALID_START_TIME', 'Booking start time must use HH:MM.');
  }
  if (!Number.isInteger(duration) || duration < 1 || duration > 3) {
    throw new BookingSlotShapeError('INVALID_DURATION', 'Booking duration must be 1, 2 or 3 hours.');
  }

  const [startHour, startMinute] = startTime.split(':').map(Number);
  if (!Number.isInteger(startHour) || startHour < 0 || startHour > 23 || startMinute !== 0) {
    throw new BookingSlotShapeError(
      'INVALID_START_TIME',
      'Atomic booking slots must begin on a whole hour.'
    );
  }

  const finalHour = startHour + duration - 1;
  if (finalHour > 23) {
    throw new BookingSlotShapeError('INVALID_SLOT_RANGE', 'Booking slots cannot cross into another day.');
  }

  return Array.from({ length: duration }, (_, offset) =>
    `${String(startHour + offset).padStart(2, '0')}:00`
  );
}

export function occupiedSlotsOverlap(leftStart, leftDuration, rightStart, rightDuration) {
  const left = new Set(buildOccupiedStartTimes(leftStart, leftDuration));
  return buildOccupiedStartTimes(rightStart, rightDuration).some((slot) => left.has(slot));
}
