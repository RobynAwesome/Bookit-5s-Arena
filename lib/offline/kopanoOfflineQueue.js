"use client";

import { openKopanoVaultDB, VAULT_STORES as STORES } from "@/lib/offline/kopanoVaultDb";
import {
  assertSwfusReceiptForUpdate,
  classifySwfusReceipt,
  createOfflineProgressiveUpdate,
  migrateLegacyApuToProgressiveUpdate,
  normalizeProgressiveUpdate,
} from "@/lib/offline/kpgsProgressiveUpdate";

const VALID_EVENT_TYPES = new Set([
  "booking",
  "payment",
  "check-in",
  "broadcast",
  "testimony",
  "admin-audit",
]);
const MAX_RETRIES = 5;
const DEFAULT_SYNC_URL = "/api/v1/sync";
const TERMINAL_QUEUE_STATES = new Set(["CONFLICT", "DEAD_LETTER", "RESOLVED", "HELD", "REJECTED"]);

function assertIndexedDB() {
  if (typeof window === "undefined" || !window.indexedDB) {
    throw new Error("IndexedDB is not available in this runtime.");
  }
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted."));
  });
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map((item) => stableJson(item)).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value) {
  const input = new TextEncoder().encode(String(value));
  if (globalThis.crypto?.subtle) {
    const hash = await globalThis.crypto.subtle.digest("SHA-256", input);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 0;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export async function deriveOfflineIdempotencyKey(eventType, stableParts) {
  if (!VALID_EVENT_TYPES.has(eventType)) throw new Error(`Unsupported offline event type: ${eventType}`);
  if (!stableParts || typeof stableParts !== "object" || Array.isArray(stableParts)) {
    throw new Error("stableParts must be an object tied to the user's logical action.");
  }

  const hash = await sha256(stableJson({ eventType, stableParts }));
  return `${eventType}:${hash.slice(0, 40)}`;
}

export async function openOfflineQueueDB() {
  assertIndexedDB();
  return openKopanoVaultDB();
}

async function appendAudit(db, entry) {
  const transaction = db.transaction(STORES.AUDIT, "readwrite");
  transaction.objectStore(STORES.AUDIT).add({ ...entry, at: Date.now() });
  await transactionDone(transaction);
}

async function putQueueRecord(db, record, auditEntry) {
  const transaction = db.transaction([STORES.QUEUE, STORES.AUDIT], "readwrite");
  transaction.objectStore(STORES.QUEUE).put(record);
  if (auditEntry) transaction.objectStore(STORES.AUDIT).add({ ...auditEntry, at: Date.now() });
  await transactionDone(transaction);
}

function queueEvidenceRef(idempotencyKey) {
  return `queue://indexeddb/${idempotencyKey}`;
}

function addQueueEvidence(update, idempotencyKey) {
  const normalized = normalizeProgressiveUpdate(update);
  const ref = queueEvidenceRef(idempotencyKey);
  const refs = normalized.evidence_refs.includes(ref)
    ? normalized.evidence_refs
    : [...normalized.evidence_refs, ref];
  return normalizeProgressiveUpdate({ ...normalized, evidence_refs: refs });
}

function progressiveForRecord(record) {
  if (record.progressive_update) return normalizeProgressiveUpdate(record.progressive_update);
  if (record.apu) {
    return migrateLegacyApuToProgressiveUpdate(record.apu, {
      eventType: record.event_type,
      idempotencyKey: record.idempotency_key,
    });
  }
  return null;
}

export async function enqueueOfflineEvent({
  eventType,
  payload,
  idempotencyKey,
  syncUrl = DEFAULT_SYNC_URL,
  progressiveUpdate = null,
  apu = null,
}) {
  if (!VALID_EVENT_TYPES.has(eventType)) throw new Error(`Unsupported offline event type: ${eventType}`);
  if (!idempotencyKey || typeof idempotencyKey !== "string") {
    throw new Error("A stable idempotencyKey is required for offline events.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Offline event payload must be an object.");
  }
  if (progressiveUpdate && apu) {
    throw new Error("Supply progressiveUpdate or legacy apu, not both.");
  }

  const db = await openOfflineQueueDB();
  const timestamp = Date.now();
  let progressive;
  if (progressiveUpdate) {
    progressive = addQueueEvidence(progressiveUpdate, idempotencyKey);
  } else if (apu) {
    progressive = migrateLegacyApuToProgressiveUpdate(apu, { eventType, idempotencyKey });
  } else {
    progressive = createOfflineProgressiveUpdate({
      eventType,
      idempotencyKey,
      operation: "CREATE",
      evidenceRefs: [queueEvidenceRef(idempotencyKey)],
      apuStatus: "UNSPECIFIED",
    });
  }

  if (progressive.idempotency_key !== idempotencyKey) {
    throw new Error("Progressive update idempotency_key must match the offline queue key.");
  }

  const record = {
    idempotency_key: idempotencyKey,
    event_type: eventType,
    payload,
    progressive_update: progressive,
    status: "PENDING",
    retry_count: 0,
    created_at: timestamp,
    updated_at: timestamp,
    next_retry_at: timestamp,
    last_error: null,
    sync_url: syncUrl,
  };

  await putQueueRecord(db, record, {
    type: "enqueue",
    idempotency_key: idempotencyKey,
    event_type: eventType,
    progressive_update_id: progressive.update_id,
    progressive_schema: progressive.schema,
    boundary_marker: progressive.boundary_marker,
  });

  window.dispatchEvent(new CustomEvent("kopano:degraded-mode", { detail: record }));
  return record;
}

async function readQueueRecords(db) {
  const transaction = db.transaction(STORES.QUEUE, "readonly");
  const request = transaction.objectStore(STORES.QUEUE).getAll();
  const records = await requestResult(request);
  await transactionDone(transaction);
  return Array.isArray(records) ? records : [];
}

function retryDelay(retryCount) {
  const base = Math.min(60_000, 1000 * 2 ** Math.max(0, retryCount));
  return base + Math.floor(Math.random() * 750);
}

async function markRecord(db, record, patch, auditType) {
  const updated = { ...record, ...patch, updated_at: Date.now() };
  await putQueueRecord(db, updated, {
    type: auditType,
    idempotency_key: record.idempotency_key,
    event_type: record.event_type,
    status: updated.status,
    retry_count: updated.retry_count,
    last_error: updated.last_error || null,
    progressive_update_id: updated.progressive_update?.update_id || null,
    swfus_receipt_id: updated.swfus_receipt?.receipt_id || null,
    swfus_disposition: updated.swfus_receipt?.disposition || null,
  });
  return updated;
}

async function deleteRecord(db, record, receipt = null) {
  const transaction = db.transaction([STORES.QUEUE, STORES.AUDIT], "readwrite");
  transaction.objectStore(STORES.QUEUE).delete(record.idempotency_key);
  transaction.objectStore(STORES.AUDIT).add({
    type: "sync_success",
    idempotency_key: record.idempotency_key,
    event_type: record.event_type,
    progressive_update_id: record.progressive_update?.update_id || null,
    swfus_receipt_id: receipt?.receipt_id || null,
    swfus_disposition: receipt?.disposition || null,
    at: Date.now(),
  });
  await transactionDone(transaction);
}

export async function processOfflineQueue({ syncUrl = DEFAULT_SYNC_URL, batchSize = 10 } = {}) {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { attempted: 0, synced: 0, deferred: true };
  }

  const db = await openOfflineQueueDB();
  const timestamp = Date.now();
  const records = (await readQueueRecords(db))
    .filter((record) => !TERMINAL_QUEUE_STATES.has(record.status))
    .filter((record) => !record.next_retry_at || record.next_retry_at <= timestamp)
    .slice(0, batchSize);

  let synced = 0;

  for (const record of records) {
    if (record.retry_count >= MAX_RETRIES) {
      await markRecord(db, record, { status: "DEAD_LETTER", last_error: "Retry limit reached." }, "dead_letter");
      continue;
    }

    let progressive = null;
    try {
      progressive = progressiveForRecord(record);
      if (progressive && progressive.idempotency_key !== record.idempotency_key) {
        throw new Error("Queued progressive update idempotency key mismatch.");
      }
    } catch (error) {
      await markRecord(
        db,
        record,
        { status: "DEAD_LETTER", last_error: error?.message || "Invalid progressive update." },
        "progressive_update_invalid",
      );
      continue;
    }

    const migratedRecord =
      progressive && !record.progressive_update
        ? await markRecord(
            db,
            record,
            { progressive_update: progressive },
            "legacy_apu_migrated_to_canonical_progressive_update",
          )
        : record;

    const syncTarget = migratedRecord.sync_url || syncUrl;
    const syncingRecord = await markRecord(db, migratedRecord, { status: "SYNCING" }, "sync_start");

    try {
      const response = await fetch(syncTarget, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": syncingRecord.idempotency_key,
        },
        body: JSON.stringify({
          event_type: syncingRecord.event_type,
          payload: syncingRecord.payload,
          ...(progressive ? { progressive_update: progressive } : {}),
          retry_count: syncingRecord.retry_count,
          created_at: syncingRecord.created_at,
          updated_at: syncingRecord.updated_at,
        }),
      });

      let responseBody = null;
      try {
        responseBody = await response.json();
      } catch {
        responseBody = null;
      }

      if (progressive && responseBody?.receipt) {
        const receipt = assertSwfusReceiptForUpdate(responseBody.receipt, progressive);
        const disposition = classifySwfusReceipt(receipt);

        if (disposition === "APPLIED") {
          await deleteRecord(db, syncingRecord, receipt);
          synced += 1;
          continue;
        }

        await markRecord(
          db,
          syncingRecord,
          {
            status: disposition,
            swfus_receipt: receipt,
            last_error: [...receipt.stages]
              .reverse()
              .find((stage) => ["HOLD", "REJECT"].includes(stage.status))?.reason || receipt.disposition,
          },
          disposition === "REJECTED" ? "swfus_rejected" : "swfus_held",
        );
        continue;
      }

      if (response.ok && !progressive) {
        await deleteRecord(db, syncingRecord, null);
        synced += 1;
        continue;
      }

      if (response.ok && progressive) {
        throw new Error("Canonical progressive synchronization response is missing its SWFUS receipt.");
      }

      const errorBody = responseBody ? JSON.stringify(responseBody).slice(0, 500) : `HTTP ${response.status}`;
      if (response.status === 409) {
        await markRecord(db, syncingRecord, { status: "CONFLICT", last_error: errorBody }, "conflict");
      } else if (response.status === 400 || response.status === 422) {
        await markRecord(db, syncingRecord, { status: "DEAD_LETTER", last_error: errorBody }, "dead_letter");
      } else {
        const retryCount = syncingRecord.retry_count + 1;
        await markRecord(
          db,
          syncingRecord,
          {
            status: "PENDING",
            retry_count: retryCount,
            next_retry_at: Date.now() + retryDelay(retryCount),
            last_error: errorBody,
          },
          "retry_scheduled",
        );
      }
    } catch (error) {
      const retryCount = syncingRecord.retry_count + 1;
      await markRecord(
        db,
        syncingRecord,
        {
          status: "PENDING",
          retry_count: retryCount,
          next_retry_at: Date.now() + retryDelay(retryCount),
          last_error: error?.message || "Network sync failed.",
        },
        "retry_scheduled",
      );
    }
  }

  await appendAudit(db, { type: "sync_pass", attempted: records.length, synced });
  return { attempted: records.length, synced, deferred: false };
}

export async function getOfflineQueueSnapshot() {
  const db = await openOfflineQueueDB();
  const records = await readQueueRecords(db);
  const counts = records.reduce(
    (acc, record) => {
      acc.total += 1;
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    },
    { total: 0 },
  );
  return { counts, records };
}
