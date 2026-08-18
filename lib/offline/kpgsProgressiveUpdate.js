export const KPGS_PROGRESSIVE_UPDATE = Object.freeze({
  canonicalRepository: "RobynAwesome/Introduction-to-MCP",
  canonicalCommit: "6eeb285d0775a7e74ceadc06e32b4068fcfbc595",
  schema: "kpgs.progressive-update.v1",
  receiptSchema: "kpgs.swfus.receipt.v1",
  boundaryMarker: "#NB",
});

export const SWFUS_STAGES = Object.freeze([
  "TELEMETRY",
  "CLASSIFICATION",
  "ROUTING",
  "PROTOCOL_SELECTION",
  "INVARIANT_AUDIT",
  "POC_FOC_CHECK",
  "STATE_UPDATE",
  "DISTRIBUTION",
]);

export const CRUD_OPERATIONS = Object.freeze(["CREATE", "READ", "UPDATE", "DELETE"]);
export const SWFUS_DISPOSITIONS = Object.freeze(["APPLIED", "OBSERVED", "HELD", "REJECTED"]);
export const APU_STATUSES = Object.freeze(["GREEN", "YELLOW", "RED", "UNSPECIFIED"]);
export const PROGRESSIVE_STATE_CLASSES = Object.freeze([
  "non_authoritative",
  "derived_projection",
  "pending_proposal",
]);

const CRUD_OPERATION_SET = new Set(CRUD_OPERATIONS);
const APU_STATUS_SET = new Set(APU_STATUSES);
const STATE_CLASS_SET = new Set(PROGRESSIVE_STATE_CLASSES);
const SWFUS_DISPOSITION_SET = new Set(SWFUS_DISPOSITIONS);
const MUTATING_OPERATIONS = new Set(["CREATE", "UPDATE", "DELETE"]);

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value, field) {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error(`${field} must be a string when provided.`);
  return value.trim();
}

function booleanValue(value, field) {
  if (typeof value !== "boolean") throw new Error(`${field} must be boolean.`);
  return value;
}

function expectedVersion(value) {
  if (value === undefined || value === null) return null;
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("expected_version must be a non-negative integer or null.");
  }
  return value;
}

function evidenceRefs(value) {
  if (!Array.isArray(value)) throw new Error("evidence_refs must be an array.");
  const refs = value.map((item, index) => requiredString(item, `evidence_refs[${index}]`));
  if (new Set(refs).size !== refs.length) throw new Error("evidence_refs must be unique.");
  return refs;
}

function normalizeOperation(value) {
  const operation = requiredString(value, "operation").toUpperCase();
  if (!CRUD_OPERATION_SET.has(operation)) {
    throw new Error(`operation must be one of: ${CRUD_OPERATIONS.join(", ")}.`);
  }
  return operation;
}

export function normalizeProgressiveUpdate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("progressive_update must be an object.");
  }

  const schema = value.schema || KPGS_PROGRESSIVE_UPDATE.schema;
  if (schema !== KPGS_PROGRESSIVE_UPDATE.schema) {
    throw new Error(`Unsupported progressive-update schema: ${schema}`);
  }

  const operation = normalizeOperation(value.operation);
  const apuStatus = requiredString(value.apu_status, "apu_status").toUpperCase();
  if (!APU_STATUS_SET.has(apuStatus)) {
    throw new Error(`apu_status must be one of: ${APU_STATUSES.join(", ")}.`);
  }

  const stateClass = requiredString(value.state_class, "state_class");
  if (!STATE_CLASS_SET.has(stateClass)) {
    throw new Error(`state_class must be one of: ${PROGRESSIVE_STATE_CLASSES.join(", ")}.`);
  }

  const authorityEffect = requiredString(value.authority_effect, "authority_effect");
  if (authorityEffect !== "none") {
    throw new Error("authority_effect must remain none.");
  }

  const boundaryMarker = requiredString(value.boundary_marker, "boundary_marker");
  if (boundaryMarker !== KPGS_PROGRESSIVE_UPDATE.boundaryMarker) {
    throw new Error("#NB boundary marker is required.");
  }

  const pocValidated = booleanValue(value.poc_validated, "poc_validated");
  const focDetected = booleanValue(value.foc_detected, "foc_detected");
  const invariantPassed = booleanValue(value.invariant_passed, "invariant_passed");
  const refs = evidenceRefs(value.evidence_refs);

  if (MUTATING_OPERATIONS.has(operation)) {
    if (!pocValidated) throw new Error("mutating progressive updates require poc_validated=true.");
    if (focDetected) throw new Error("mutating progressive updates require foc_detected=false.");
    if (refs.length === 0) throw new Error("mutating progressive updates require evidence_refs.");
  }

  return {
    schema: KPGS_PROGRESSIVE_UPDATE.schema,
    update_id: requiredString(value.update_id, "update_id"),
    node_id: requiredString(value.node_id, "node_id"),
    operation,
    lane: requiredString(value.lane, "lane"),
    context_route: requiredString(value.context_route, "context_route"),
    protocol: requiredString(value.protocol, "protocol"),
    idempotency_key: requiredString(value.idempotency_key, "idempotency_key"),
    value: value.value ?? null,
    apu_status: apuStatus,
    poc_validated: pocValidated,
    foc_detected: focDetected,
    invariant_passed: invariantPassed,
    authority_effect: "none",
    state_class: stateClass,
    evidence_refs: refs,
    correlation_id: optionalString(value.correlation_id, "correlation_id"),
    source: optionalString(value.source, "source"),
    expected_version: expectedVersion(value.expected_version),
    boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
  };
}

export function createOfflineProgressiveUpdate({
  eventType,
  idempotencyKey,
  operation = "CREATE",
  resourceId = null,
  expectedVersion: version = null,
  evidenceRefs: refs = [],
  apuStatus = "UNSPECIFIED",
} = {}) {
  const normalizedEventType = requiredString(eventType, "eventType");
  const normalizedKey = requiredString(idempotencyKey, "idempotencyKey");
  const normalizedOperation = normalizeOperation(operation);
  const nodeSuffix = resourceId ? requiredString(resourceId, "resourceId") : normalizedKey;

  return normalizeProgressiveUpdate({
    schema: KPGS_PROGRESSIVE_UPDATE.schema,
    update_id: `fivesarena:${normalizedKey}`,
    node_id: `fivesarena:${normalizedEventType}:${nodeSuffix}`,
    operation: normalizedOperation,
    lane: "fivesarena.offline-sync",
    context_route: `fivesarena.${normalizedEventType}.offline-sync`,
    protocol: "FIVESARENA_OFFLINE_SYNC_V1",
    idempotency_key: normalizedKey,
    value: {
      event_type: normalizedEventType,
      resource_id: resourceId || null,
    },
    apu_status: apuStatus,
    poc_validated: true,
    foc_detected: false,
    invariant_passed: true,
    authority_effect: "none",
    state_class: "pending_proposal",
    evidence_refs: refs,
    correlation_id: `offline-sync:${normalizedKey}`,
    source: "fivesarena-offline-queue",
    expected_version: version,
    boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
  });
}

/**
 * Compatibility decoder for browser records written before canonical KPGS vNext.
 * The legacy S2_POC envelope is evidence input only; it is never returned as a
 * canonical SWFUS receipt and never grants authority.
 */
export function migrateLegacyApuToProgressiveUpdate(legacyApu, { eventType, idempotencyKey } = {}) {
  if (!legacyApu || typeof legacyApu !== "object" || Array.isArray(legacyApu)) {
    throw new Error("legacy APU record must be an object.");
  }
  if (legacyApu.schema !== "fivesarena.apu.progressive-update.v1") {
    throw new Error("Unsupported legacy APU schema.");
  }
  if (legacyApu.stage !== "S2_POC") {
    throw new Error(`Legacy APU migration requires S2_POC, received ${legacyApu.stage || "unknown"}.`);
  }

  const legacyRefs = Array.isArray(legacyApu.receipts)
    ? legacyApu.receipts
        .map((receipt) => receipt?.receipt_id)
        .filter((receiptId) => typeof receiptId === "string" && receiptId.trim())
        .map((receiptId) => `legacy-apu://receipt/${receiptId.trim()}`)
    : [];

  const operation = normalizeOperation(legacyApu.operation || "CREATE");
  return createOfflineProgressiveUpdate({
    eventType,
    idempotencyKey,
    operation,
    resourceId: legacyApu.resource_id || legacyApu.resource || null,
    expectedVersion: legacyApu.base_version ?? null,
    evidenceRefs: [
      `queue://indexeddb/${requiredString(idempotencyKey, "idempotencyKey")}`,
      ...legacyRefs,
    ],
    apuStatus: "UNSPECIFIED",
  });
}

function normalizeStage(value, index) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`receipt.stages[${index}] must be an object.`);
  }
  const stage = requiredString(value.stage, `receipt.stages[${index}].stage`);
  if (stage !== SWFUS_STAGES[index]) {
    throw new Error(`receipt stage order mismatch at ${index}: expected ${SWFUS_STAGES[index]}.`);
  }
  return {
    stage,
    status: requiredString(value.status, `receipt.stages[${index}].status`),
    reason: typeof value.reason === "string" ? value.reason : "",
  };
}

export function normalizeSwfusReceipt(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("SWFUS receipt must be an object.");
  }
  if (value.schema !== KPGS_PROGRESSIVE_UPDATE.receiptSchema) {
    throw new Error(`Unsupported SWFUS receipt schema: ${value.schema || "missing"}`);
  }

  const disposition = requiredString(value.disposition, "receipt.disposition").toUpperCase();
  if (!SWFUS_DISPOSITION_SET.has(disposition)) {
    throw new Error(`Unsupported SWFUS disposition: ${disposition}`);
  }
  const operation = normalizeOperation(value.operation);
  if (!Array.isArray(value.stages) || value.stages.length !== SWFUS_STAGES.length) {
    throw new Error(`SWFUS receipt must contain ${SWFUS_STAGES.length} ordered stage receipts.`);
  }
  if (value.canonical_authority_changed !== false) {
    throw new Error("SWFUS synchronization may not claim canonical authority changed.");
  }
  if (value.boundary_marker !== KPGS_PROGRESSIVE_UPDATE.boundaryMarker) {
    throw new Error("SWFUS receipt must preserve #NB.");
  }

  return {
    schema: KPGS_PROGRESSIVE_UPDATE.receiptSchema,
    receipt_id: requiredString(value.receipt_id, "receipt.receipt_id"),
    update_id: requiredString(value.update_id, "receipt.update_id"),
    node_id: requiredString(value.node_id, "receipt.node_id"),
    operation,
    disposition,
    stages: value.stages.map(normalizeStage),
    synchronized: booleanValue(value.synchronized, "receipt.synchronized"),
    canonical_authority_changed: false,
    state_digest:
      value.state_digest === null || value.state_digest === undefined
        ? null
        : requiredString(value.state_digest, "receipt.state_digest"),
    evidence_refs: evidenceRefs(value.evidence_refs),
    correlation_id: optionalString(value.correlation_id, "receipt.correlation_id"),
    boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
    replayed: booleanValue(value.replayed, "receipt.replayed"),
    created_at: requiredString(value.created_at, "receipt.created_at"),
  };
}

export function isSwfusReceipt(value) {
  try {
    normalizeSwfusReceipt(value);
    return true;
  } catch {
    return false;
  }
}

export function assertSwfusReceiptForUpdate(receiptValue, updateValue) {
  const receipt = normalizeSwfusReceipt(receiptValue);
  const update = normalizeProgressiveUpdate(updateValue);

  if (receipt.update_id !== update.update_id) throw new Error("SWFUS receipt update_id mismatch.");
  if (receipt.node_id !== update.node_id) throw new Error("SWFUS receipt node_id mismatch.");
  if (receipt.operation !== update.operation) throw new Error("SWFUS receipt operation mismatch.");
  if (receipt.evidence_refs.length !== update.evidence_refs.length) {
    throw new Error("SWFUS receipt evidence_refs mismatch.");
  }
  for (let index = 0; index < update.evidence_refs.length; index += 1) {
    if (receipt.evidence_refs[index] !== update.evidence_refs[index]) {
      throw new Error("SWFUS receipt evidence_refs mismatch.");
    }
  }
  return receipt;
}

export function classifySwfusReceipt(receiptValue) {
  const receipt = normalizeSwfusReceipt(receiptValue);
  if (receipt.disposition === "APPLIED" && receipt.synchronized) return "APPLIED";
  if (receipt.disposition === "REJECTED") return "REJECTED";
  return "HELD";
}

function stageReceipt(stage, status, reason) {
  return { stage, status, reason };
}

export function buildSwfusReceipt(
  updateValue,
  {
    disposition,
    receiptId,
    stateDigest = null,
    replayed = false,
    createdAt = new Date().toISOString(),
    stopStage = null,
    stopStatus = null,
    stopReason = null,
  } = {},
) {
  const update = normalizeProgressiveUpdate(updateValue);
  const normalizedDisposition = requiredString(disposition, "disposition").toUpperCase();
  if (!SWFUS_DISPOSITION_SET.has(normalizedDisposition)) {
    throw new Error(`Unsupported SWFUS disposition: ${normalizedDisposition}`);
  }

  const stages = [];
  const passReasons = {
    TELEMETRY: "update identity and idempotency accepted",
    CLASSIFICATION: `lane=${update.lane}; apu=${update.apu_status}`,
    ROUTING: `route=${update.context_route}`,
    PROTOCOL_SELECTION: `protocol=${update.protocol}`,
    INVARIANT_AUDIT: "authority_effect=none; #NB and invariants preserved",
    POC_FOC_CHECK: "POC evidence admitted; no FOC mutation signal",
    STATE_UPDATE: "bounded non-authoritative sync projection persisted",
    DISTRIBUTION: "server synchronization receipt persisted",
  };

  for (const stage of SWFUS_STAGES) {
    if (stopStage) {
      const stopIndex = SWFUS_STAGES.indexOf(stopStage);
      const stageIndex = SWFUS_STAGES.indexOf(stage);
      if (stageIndex > stopIndex) {
        stages.push(stageReceipt(stage, "NOT_REACHED", "prior governance gate stopped progression"));
        continue;
      }
      if (stage === stopStage) {
        stages.push(stageReceipt(stage, stopStatus || "HOLD", stopReason || "governance gate stopped progression"));
        continue;
      }
    }

    if (normalizedDisposition === "OBSERVED" && stage === "PROTOCOL_SELECTION") {
      stages.push(stageReceipt(stage, "SKIP", "read requires no mutation protocol"));
    } else if (normalizedDisposition === "OBSERVED" && stage === "INVARIANT_AUDIT") {
      stages.push(stageReceipt(stage, "SKIP", "observation is not mutation"));
    } else if (normalizedDisposition === "OBSERVED" && stage === "POC_FOC_CHECK") {
      stages.push(stageReceipt(stage, "SKIP", "read cannot promote state"));
    } else if (normalizedDisposition === "OBSERVED" && stage === "STATE_UPDATE") {
      stages.push(stageReceipt(stage, "OBSERVE", "projection read only"));
    } else if (normalizedDisposition === "OBSERVED" && stage === "DISTRIBUTION") {
      stages.push(stageReceipt(stage, "SKIP", "reads are not synchronized mutations"));
    } else {
      stages.push(stageReceipt(stage, "PASS", passReasons[stage]));
    }
  }

  return normalizeSwfusReceipt({
    schema: KPGS_PROGRESSIVE_UPDATE.receiptSchema,
    receipt_id: requiredString(receiptId, "receiptId"),
    update_id: update.update_id,
    node_id: update.node_id,
    operation: update.operation,
    disposition: normalizedDisposition,
    stages,
    synchronized: normalizedDisposition === "APPLIED" && !stopStage,
    canonical_authority_changed: false,
    state_digest: stateDigest,
    evidence_refs: [...update.evidence_refs],
    correlation_id: update.correlation_id,
    boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
    replayed,
    created_at: createdAt,
  });
}
