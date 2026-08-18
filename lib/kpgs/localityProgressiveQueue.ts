'use client';

import {
  KPGS_PROGRESSIVE_UPDATE,
  isKpgsSwfusReceipt,
  type KpgsProgressiveUpdate,
  type KpgsSwfusReceipt,
} from './progressiveUpdateContract';

const CLIENT_ID_KEY = 'fivesarena.progressive.client-id.v1';
const QUEUE_KEY = 'fivesarena.progressive.locality-queue.v1';
const LAST_RECEIPT_KEY = 'fivesarena.progressive.locality-receipt.v1';

const POC_EVIDENCE = [
  'repo://docs/governance/FIVESARENA_LOCALITY_PROGRESSIVE_UPDATE_POC.md',
  'git://RobynAwesome/Bookit-5s-Arena/f62dbc3a16fe8a9adfe6cb685a3e22c9f1dddd5d',
];

type LocalitySource = 'arena-default' | 'saved' | 'manual' | 'device-nearest';
type BlockedQueueStatus = 'held' | 'rejected';

type QueuedLocalityUpdate = {
  update: KpgsProgressiveUpdate;
  queued_at: string;
  status: 'pending' | BlockedQueueStatus;
  receipt: KpgsSwfusReceipt | null;
};

export type LocalityProgressiveStatus =
  | { state: 'idle'; receipt: null; reason: null }
  | { state: 'pending'; receipt: null; reason: string }
  | { state: 'applied'; receipt: KpgsSwfusReceipt; reason: null }
  | { state: 'held'; receipt: KpgsSwfusReceipt; reason: string }
  | { state: 'rejected'; receipt: KpgsSwfusReceipt; reason: string };

function storage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function randomId(prefix: string) {
  const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${id}`;
}

function readJson<T>(key: string, fallback: T): T {
  const target = storage();
  if (!target) return fallback;
  try {
    const raw = target.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const target = storage();
  if (!target) throw new Error('progressive-local-storage-unavailable');
  target.setItem(key, JSON.stringify(value));
}

function getClientId() {
  const target = storage();
  if (!target) throw new Error('progressive-local-storage-unavailable');
  const existing = target.getItem(CLIENT_ID_KEY);
  if (existing) return existing;
  const created = randomId('client');
  target.setItem(CLIENT_ID_KEY, created);
  return created;
}

function readQueue() {
  return readJson<QueuedLocalityUpdate[]>(QUEUE_KEY, []);
}

function writeQueue(queue: QueuedLocalityUpdate[]) {
  writeJson(QUEUE_KEY, queue);
}

function isBlockedStatus(status: QueuedLocalityUpdate['status']): status is BlockedQueueStatus {
  return status === 'held' || status === 'rejected';
}

function stageReason(receipt: KpgsSwfusReceipt) {
  const decisive = [...receipt.stages]
    .reverse()
    .find((stage) => ['HOLD', 'REJECT'].includes(stage.status));
  return decisive?.reason || `canonical SWFUS disposition: ${receipt.disposition}`;
}

export function readLocalityProgressiveStatus(): LocalityProgressiveStatus {
  const queue = readQueue();
  const blocked = queue.find(
    (item): item is QueuedLocalityUpdate & { status: BlockedQueueStatus; receipt: KpgsSwfusReceipt } =>
      isBlockedStatus(item.status) && item.receipt !== null,
  );
  if (blocked) {
    return {
      state: blocked.status,
      receipt: blocked.receipt,
      reason: stageReason(blocked.receipt),
    };
  }
  if (queue.length) {
    return {
      state: 'pending',
      receipt: null,
      reason: 'device preference saved; canonical progressive update is queued',
    };
  }
  const receipt = readJson<KpgsSwfusReceipt | null>(LAST_RECEIPT_KEY, null);
  if (isKpgsSwfusReceipt(receipt) && receipt.disposition === 'APPLIED' && receipt.synchronized) {
    return { state: 'applied', receipt, reason: null };
  }
  return { state: 'idle', receipt: null, reason: null };
}

export function enqueueLocalityProgressiveUpdate(input: {
  provinceSlug: string;
  source: LocalitySource;
  updatedAt: string;
}): KpgsProgressiveUpdate {
  const clientId = getClientId();
  const queue = readQueue();
  const lastReceipt = readJson<KpgsSwfusReceipt | null>(LAST_RECEIPT_KEY, null);
  const projectionKnown =
    (isKpgsSwfusReceipt(lastReceipt) && lastReceipt.disposition === 'APPLIED') ||
    queue.some((item) => item.update.operation === 'CREATE');
  const updateId = randomId('locality');

  const update: KpgsProgressiveUpdate = {
    schema: KPGS_PROGRESSIVE_UPDATE.schema,
    update_id: updateId,
    node_id: `fivesarena:locality:province:${clientId}`,
    operation: projectionKnown ? 'UPDATE' : 'CREATE',
    lane: 'arena.public-state',
    context_route: 'fivesarena.locality',
    protocol: 'FIVESARENA_LOCALITY_PREFERENCE_V1',
    idempotency_key: updateId,
    value: {
      province_slug: input.provinceSlug,
      source: input.source,
      client_observed_at: input.updatedAt,
    },
    apu_status: 'UNSPECIFIED',
    poc_validated: true,
    foc_detected: false,
    invariant_passed: true,
    authority_effect: 'none',
    state_class: 'non_authoritative',
    evidence_refs: [...POC_EVIDENCE, `ui://province-selector/${input.source}`],
    correlation_id: randomId('corr'),
    source: 'fivesarena-pwa',
    expected_version: null,
    boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
  };

  queue.push({ update, queued_at: new Date().toISOString(), status: 'pending', receipt: null });
  writeQueue(queue);
  window.dispatchEvent(new CustomEvent('fivesarena:progressive-update'));
  return update;
}

async function submit(update: KpgsProgressiveUpdate): Promise<KpgsSwfusReceipt | null> {
  try {
    const response = await fetch('/api/organism/progressive-updates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(update),
    });
    const payload = (await response.json()) as { receipt?: unknown };
    return isKpgsSwfusReceipt(payload.receipt) ? payload.receipt : null;
  } catch {
    return null;
  }
}

export async function flushLocalityProgressiveQueue(): Promise<LocalityProgressiveStatus> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return readLocalityProgressiveStatus();
  }

  const queue = readQueue();
  for (let index = 0; index < queue.length; index += 1) {
    const item = queue[index];
    if (item.status !== 'pending') break;

    const receipt = await submit(item.update);
    if (!receipt) break;

    if (receipt.disposition === 'APPLIED' && receipt.synchronized) {
      writeJson(LAST_RECEIPT_KEY, receipt);
      queue.splice(index, 1);
      index -= 1;
      writeQueue(queue);
      continue;
    }

    item.receipt = receipt;
    item.status = receipt.disposition === 'REJECTED' ? 'rejected' : 'held';
    writeQueue(queue);
    break;
  }

  window.dispatchEvent(new CustomEvent('fivesarena:progressive-update'));
  return readLocalityProgressiveStatus();
}
