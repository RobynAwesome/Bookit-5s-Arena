export type DataTruthState = 'live' | 'delayed' | 'stale' | 'unavailable';

export interface DataTruthReceipt<T> {
  state: DataTruthState;
  observedAt: string;
  sourceTimestamp: string | null;
  ageMs: number | null;
  maxLiveAgeMs: number;
  maxDelayedAgeMs: number;
  source: string;
  data: T | null;
  reason: string;
}

export function classifyDataTruth<T>(input: {
  data: T | null;
  observedAt?: Date;
  sourceTimestamp?: string | Date | null;
  source: string;
  maxLiveAgeMs?: number;
  maxDelayedAgeMs?: number;
}): DataTruthReceipt<T> {
  const observedAt = input.observedAt ?? new Date();
  const maxLiveAgeMs = input.maxLiveAgeMs ?? 2 * 60_000;
  const maxDelayedAgeMs = input.maxDelayedAgeMs ?? 15 * 60_000;

  if (input.data == null) {
    return {
      state: 'unavailable',
      observedAt: observedAt.toISOString(),
      sourceTimestamp: null,
      ageMs: null,
      maxLiveAgeMs,
      maxDelayedAgeMs,
      source: input.source,
      data: null,
      reason: 'provider returned no usable normalized payload',
    };
  }

  if (input.sourceTimestamp == null) {
    return {
      state: 'delayed',
      observedAt: observedAt.toISOString(),
      sourceTimestamp: null,
      ageMs: null,
      maxLiveAgeMs,
      maxDelayedAgeMs,
      source: input.source,
      data: input.data,
      reason: 'payload exists but source freshness cannot be proven',
    };
  }

  const sourceDate = input.sourceTimestamp instanceof Date ? input.sourceTimestamp : new Date(input.sourceTimestamp);
  if (Number.isNaN(sourceDate.getTime())) {
    return {
      state: 'delayed',
      observedAt: observedAt.toISOString(),
      sourceTimestamp: String(input.sourceTimestamp),
      ageMs: null,
      maxLiveAgeMs,
      maxDelayedAgeMs,
      source: input.source,
      data: input.data,
      reason: 'payload exists but source timestamp is invalid',
    };
  }

  const ageMs = Math.max(0, observedAt.getTime() - sourceDate.getTime());
  const state: DataTruthState = ageMs <= maxLiveAgeMs ? 'live' : ageMs <= maxDelayedAgeMs ? 'delayed' : 'stale';

  return {
    state,
    observedAt: observedAt.toISOString(),
    sourceTimestamp: sourceDate.toISOString(),
    ageMs,
    maxLiveAgeMs,
    maxDelayedAgeMs,
    source: input.source,
    data: input.data,
    reason:
      state === 'live'
        ? 'normalized provider data is inside the live freshness budget'
        : state === 'delayed'
          ? 'normalized provider data is outside live budget but inside delayed budget'
          : 'normalized provider data exceeded the delayed freshness budget',
  };
}
