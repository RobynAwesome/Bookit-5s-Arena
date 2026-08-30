export const ARENA_REALITY_STATES = Object.freeze({
  DATABASE: 'database',
  DATABASE_EMPTY: 'database-empty',
  UNAVAILABLE: 'unavailable',
});

export function projectArenaReality({ courtSource, courts = [], minPrice = null } = {}) {
  const count = Array.isArray(courts) ? courts.length : 0;
  const source = Object.values(ARENA_REALITY_STATES).includes(courtSource)
    ? courtSource
    : ARENA_REALITY_STATES.UNAVAILABLE;

  if (source === ARENA_REALITY_STATES.DATABASE && count > 0) {
    return {
      source,
      evidenceClass: 'verified-source',
      inventoryVerified: true,
      slotAvailabilityVerified: false,
      bookingMode: 'transactional-entry',
      count,
      minPrice: Number.isFinite(Number(minPrice)) ? Number(minPrice) : null,
      label: 'Live court inventory connected',
      detail: 'Court records and pricing come from the arena database. Slot availability resolves on the selected court before booking.',
    };
  }

  if (source === ARENA_REALITY_STATES.DATABASE_EMPTY) {
    return {
      source,
      evidenceClass: 'database-empty',
      inventoryVerified: false,
      slotAvailabilityVerified: false,
      bookingMode: 'manual-verification',
      count: 0,
      minPrice: null,
      label: 'Arena database connected · inventory empty',
      detail: 'The database answered, but no public court inventory is currently published. No demo courts or guessed availability are substituted.',
    };
  }

  return {
    source: ARENA_REALITY_STATES.UNAVAILABLE,
    evidenceClass: 'unavailable',
    inventoryVerified: false,
    slotAvailabilityVerified: false,
    bookingMode: 'manual-verification',
    count: 0,
    minPrice: null,
    label: 'Live court inventory temporarily unavailable',
    detail: 'The arena source could not be verified. FivesArena keeps the experience live without manufacturing courts, prices, or availability claims.',
  };
}
