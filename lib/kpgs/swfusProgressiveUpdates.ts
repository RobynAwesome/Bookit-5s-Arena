'use client';

import {
  SWFUS_CONTRACT,
  isSwfusReceipt,
  type SwfusProgressiveUpdate,
  type SwfusReceipt,
} from './progressiveUpdateContract';

const WITNESS_KEY = 'fivesarena.swfus.witnesses.v1';
const RECEIPT_KEY = 'fivesarena.swfus.receipts.v1';
const MAX_LOCAL_RECEIPTS = 100;

export const LOCALITY_SWFUS_NODE = 'fivesarena:locality:province';

type LocalWitness = {
  nodeId: string;
  revision: number;
  data: Record<string, unknown>;
  tombstoned: boolean;
  updatedAt: string;
  evidenceHash: string;
};

type WitnessMap = Record<string, LocalWitness>;

type ApplyInput = {
  nodeId: string;
  data: Record<string, unknown>;
  telemetryValue?: number;
  correlationId?: string | null;
  capabilityLeaseId?: string | null;
};

function browserStorageAvailable() {
  if (typeof window === 'undefined') return false;
  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  if (!browserStorageAvailable()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!browserStorageAvailable()) {
    throw new Error('progressive-update-storage-unavailable');
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readWitnesses(): WitnessMap {
  return readJson<WitnessMap>(WITNESS_KEY, {});
}

function persistReceipt(receipt: SwfusReceipt) {
  const receipts = readJson<SwfusReceipt[]>(RECEIPT_KEY, []);
  const next = [...receipts.filter((item) => item.evidenceHash !== receipt.evidenceHash), receipt]
    .slice(-MAX_LOCAL_RECEIPTS);
  writeJson(RECEIPT_KEY, next);
}

function replaceReceipt(receipt: SwfusReceipt) {
  persistReceipt(receipt);
}

function createCorrelationId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `fivesarena-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeForHash(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeForHash);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, normalizeForHash(item)]),
  );
}

async function sha256Hex(value: unknown) {
  const serialized = JSON.stringify(normalizeForHash(value));
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(serialized);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  // A non-cryptographic fallback is used only when SubtleCrypto is unavailable.
  // It preserves receipt shape but is not a signature or authentication proof.
  let hash = 2166136261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const block = (hash >>> 0).toString(16).padStart(8, '0');
  return block.repeat(8);
}

function buildReceipt(
  update: SwfusProgressiveUpdate,
  input: {
    accepted: boolean;
    stage: SwfusReceipt['stage'];
    syncState: SwfusReceipt['syncState'];
    revision: number | null;
    evidenceHash: string;
    reason?: string | null;
  },
): SwfusReceipt {
  return {
    schema: SWFUS_CONTRACT.receiptSchema,
    nodeId: update.nodeId,
    requestedAction: update.action,
    resolvedAction: update.action,
    accepted: input.accepted,
    stage: input.stage,
    syncState: input.syncState,
    revision: input.revision,
    correlationId: update.correlationId,
    capabilityLeaseId: update.capabilityLeaseId,
    evidenceHash: input.evidenceHash,
    reason: input.reason ?? null,
    observedAt: new Date().toISOString(),
  };
}

async function tryCanonicalSync(
  update: SwfusProgressiveUpdate,
  localReceipt: SwfusReceipt,
): Promise<SwfusReceipt> {
  if (
    typeof fetch !== 'function' ||
    typeof navigator === 'undefined' ||
    !navigator.onLine
  ) {
    return localReceipt;
  }

  try {
    const response = await fetch('/api/organism/progressive-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ update, localReceipt }),
    });
    const payload = (await response.json()) as { receipt?: unknown };

    // A valid canonical receipt is authoritative even when the HTTP status is a
    // conflict/rejection. Only absence of a valid receipt is treated as transport pending.
    if (isSwfusReceipt(payload.receipt)) {
      replaceReceipt(payload.receipt);
      return payload.receipt;
    }
  } catch {
    // Offline/degraded transport never rewrites local acceptance into severance.
  }

  return localReceipt;
}

export function readLatestProgressiveReceipt(
  nodeId: string,
): SwfusReceipt | null {
  const receipts = readJson<SwfusReceipt[]>(RECEIPT_KEY, []);
  return [...receipts].reverse().find((item) => item.nodeId === nodeId) || null;
}

export function readLocalWitness(nodeId: string): LocalWitness | null {
  const witness = readWitnesses()[nodeId];
  if (!witness || witness.tombstoned) return null;
  return witness;
}

export async function applyLocalProgressiveUpdate(
  input: ApplyInput,
): Promise<SwfusReceipt> {
  if (!browserStorageAvailable()) {
    throw new Error('progressive-update-storage-unavailable');
  }

  const initialWitness = readLocalWitness(input.nodeId);
  const action: SwfusProgressiveUpdate['action'] = initialWitness ? 'UPDATE' : 'CREATE';
  const expectedRevision = initialWitness?.revision ?? null;
  const update: SwfusProgressiveUpdate = {
    schema: SWFUS_CONTRACT.schema,
    nodeId: input.nodeId,
    action,
    telemetryValue: input.telemetryValue ?? 0,
    data: input.data,
    expectedRevision,
    correlationId: input.correlationId ?? createCorrelationId(),
    capabilityLeaseId: input.capabilityLeaseId ?? null,
    observedAt: new Date().toISOString(),
  };

  const nextRevision = (initialWitness?.revision ?? 0) + 1;
  const evidenceHash = await sha256Hex({ ...update, nextRevision });

  // Re-read after hashing so another tab cannot silently overwrite the revision
  // witnessed when this update was prepared.
  const currentWitness = readLocalWitness(input.nodeId);
  const currentRevision = currentWitness?.revision ?? null;
  if (currentRevision !== expectedRevision) {
    const conflict = buildReceipt(update, {
      accepted: false,
      stage: 'fluid_vectoring',
      syncState: 'severed',
      revision: currentRevision,
      evidenceHash,
      reason: `revision conflict: expected ${expectedRevision ?? 'none'}, witnessed ${currentRevision ?? 'none'}`,
    });
    persistReceipt(conflict);
    return conflict;
  }

  const witnesses = readWitnesses();
  witnesses[input.nodeId] = {
    nodeId: input.nodeId,
    revision: nextRevision,
    data: input.data,
    tombstoned: false,
    updatedAt: update.observedAt || new Date().toISOString(),
    evidenceHash,
  };
  writeJson(WITNESS_KEY, witnesses);

  const localReceipt = buildReceipt(update, {
    accepted: true,
    stage: 'witness_isolation',
    syncState: 'pending_sync',
    revision: nextRevision,
    evidenceHash,
    reason: 'local witness accepted; canonical adapter synchronization not yet proven',
  });
  persistReceipt(localReceipt);

  const canonicalReceipt = await tryCanonicalSync(update, localReceipt);
  if (canonicalReceipt.accepted && canonicalReceipt.syncState === 'synced') {
    const latestWitnesses = readWitnesses();
    const latest = latestWitnesses[input.nodeId];
    if (latest && latest.evidenceHash === evidenceHash) {
      latestWitnesses[input.nodeId] = {
        ...latest,
        evidenceHash: canonicalReceipt.evidenceHash,
      };
      writeJson(WITNESS_KEY, latestWitnesses);
    }
  }
  return canonicalReceipt;
}

export async function retryProgressiveSync(nodeId: string): Promise<SwfusReceipt | null> {
  const receipt = readLatestProgressiveReceipt(nodeId);
  const witness = readLocalWitness(nodeId);
  if (!receipt || !witness || !receipt.accepted || receipt.syncState !== 'pending_sync') {
    return receipt;
  }

  const update: SwfusProgressiveUpdate = {
    schema: SWFUS_CONTRACT.schema,
    nodeId,
    action: receipt.resolvedAction,
    telemetryValue: 0,
    data: witness.data,
    expectedRevision: Math.max(0, witness.revision - 1),
    correlationId: receipt.correlationId,
    capabilityLeaseId: receipt.capabilityLeaseId,
    observedAt: witness.updatedAt,
  };

  return tryCanonicalSync(update, receipt);
}
