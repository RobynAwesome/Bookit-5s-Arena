import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  KPGS_PROGRESSIVE_UPDATE,
  SWFUS_STAGES,
  assertSwfusReceiptForUpdate,
  buildSwfusReceipt,
  createOfflineProgressiveUpdate,
} from "../lib/offline/kpgsProgressiveUpdate.js";

const ROOT = resolve(import.meta.dirname, "..");

function source(path) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function requireMarkers(path, markers) {
  const text = source(path);
  for (const marker of markers) {
    assert.ok(text.includes(marker), `${path} is missing required KPGS marker: ${marker}`);
  }
}

const update = createOfflineProgressiveUpdate({
  eventType: "booking",
  idempotencyKey: "booking:validation:canonical-001",
  operation: "CREATE",
  resourceId: "validation-booking",
  evidenceRefs: ["queue://indexeddb/booking:validation:canonical-001"],
  apuStatus: "UNSPECIFIED",
});

assert.equal(update.schema, "kpgs.progressive-update.v1");
assert.equal(update.boundary_marker, "#NB");
assert.equal(update.authority_effect, "none");
assert.equal(update.state_class, "pending_proposal");

const applied = buildSwfusReceipt(update, {
  disposition: "APPLIED",
  receiptId: "swfus:validation:canonical-001",
  stateDigest: "validation-state-digest",
  createdAt: "2026-08-18T12:00:00.000Z",
});
assert.equal(applied.synchronized, true);
assert.equal(applied.canonical_authority_changed, false);
assert.deepEqual(applied.stages.map((stage) => stage.stage), SWFUS_STAGES);
assertSwfusReceiptForUpdate(applied, update);

const yellow = createOfflineProgressiveUpdate({
  eventType: "booking",
  idempotencyKey: "booking:validation:yellow-001",
  operation: "CREATE",
  evidenceRefs: ["queue://indexeddb/booking:validation:yellow-001"],
  apuStatus: "YELLOW",
});
const held = buildSwfusReceipt(yellow, {
  disposition: "HELD",
  receiptId: "swfus:validation:yellow-001",
  stopStage: "POC_FOC_CHECK",
  stopStatus: "HOLD",
  stopReason: "APU YELLOW requires review before mutation.",
  createdAt: "2026-08-18T12:00:00.000Z",
});
assert.equal(held.synchronized, false);
assert.equal(held.stages[6].status, "NOT_REACHED");
assert.equal(held.stages[7].status, "NOT_REACHED");

requireMarkers("lib/offline/kopanoOfflineQueue.js", [
  "kpgsProgressiveUpdate",
  "progressive_update: progressive",
  "assertSwfusReceiptForUpdate",
  'status: disposition',
  '"HELD"',
  '"REJECTED"',
]);

requireMarkers("app/api/v1/sync/route.js", [
  "KPGS_PROGRESSIVE_UPDATE",
  "SWFUS_STAGES",
  "progressive_update",
  "buildSwfusReceipt",
  "canonical_authority_changed",
  "domain UPDATE/DELETE requires its own governed adapter",
]);

requireMarkers("models/OfflineSyncEvent.js", [
  '"kpgs.progressive-update.v1"',
  '"kpgs.swfus.receipt.v1"',
  'enum: ["#NB"]',
  '"HELD"',
  '"REJECTED"',
  "LegacyApuProgressiveUpdateSchema",
]);

requireMarkers("docs/apwa/APU_PROGRESSIVE_SYNC_CONTRACT.md", [
  "Adaptive Progressive Updates (APU)",
  "#NB",
  "kpgs.progressive-update.v1",
  "kpgs.swfus.receipt.v1",
  "Telemetry",
  "Classification",
  "Routing",
  "Protocol Selection",
  "Invariant Audit",
  "POC / FOC Check",
  "State Update",
  "Distribution",
  "SYNCED != DOMAIN WRITE APPLIED",
]);

const receipt = {
  schema: "fivesarena.kpgs.progressive-sync.validation-receipt.v2",
  verdict: "PASS",
  canonical: {
    repository: KPGS_PROGRESSIVE_UPDATE.canonicalRepository,
    commit: KPGS_PROGRESSIVE_UPDATE.canonicalCommit,
    progressiveUpdateSchema: KPGS_PROGRESSIVE_UPDATE.schema,
    swfusReceiptSchema: KPGS_PROGRESSIVE_UPDATE.receiptSchema,
    boundaryMarker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
    stageOrder: SWFUS_STAGES,
  },
  proof: {
    appliedDisposition: applied.disposition,
    synchronized: applied.synchronized,
    heldDisposition: held.disposition,
    heldStateUpdate: held.stages[6].status,
    heldDistribution: held.stages[7].status,
  },
  boundaries: {
    authorityEffect: update.authority_effect,
    stateClass: update.state_class,
    canonicalAuthorityChanged: applied.canonical_authority_changed,
    domainWriteAppliedClaimed: false,
    legacyFiveSArenaEnvelopeCanonical: false,
  },
};

const receiptDir = resolve(ROOT, ".kpgs", "receipts");
mkdirSync(receiptDir, { recursive: true });
writeFileSync(
  resolve(receiptDir, "apu-progressive-sync.json"),
  `${JSON.stringify(receipt, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(receipt, null, 2));
