import assert from "node:assert/strict";
import test from "node:test";

import {
  KPGS_PROGRESSIVE_UPDATE,
  SWFUS_STAGES,
  assertSwfusReceiptForUpdate,
  buildSwfusReceipt,
  classifySwfusReceipt,
  createOfflineProgressiveUpdate,
  migrateLegacyApuToProgressiveUpdate,
  normalizeProgressiveUpdate,
  normalizeSwfusReceipt,
} from "../../lib/offline/kpgsProgressiveUpdate.js";

function canonical(overrides = {}) {
  return createOfflineProgressiveUpdate({
    eventType: "booking",
    idempotencyKey: "booking:test-canonical-001",
    operation: "CREATE",
    resourceId: "booking-001",
    evidenceRefs: ["queue://indexeddb/booking:test-canonical-001"],
    ...overrides,
  });
}

test("new Five's Arena offline writes use the canonical KPGS progressive-update envelope", () => {
  const update = canonical();

  assert.equal(update.schema, "kpgs.progressive-update.v1");
  assert.equal(update.operation, "CREATE");
  assert.equal(update.boundary_marker, "#NB");
  assert.equal(update.authority_effect, "none");
  assert.equal(update.state_class, "pending_proposal");
  assert.equal(update.apu_status, "UNSPECIFIED");
  assert.equal(update.poc_validated, true);
  assert.equal(update.foc_detected, false);
  assert.equal(KPGS_PROGRESSIVE_UPDATE.canonicalCommit, "6eeb285d0775a7e74ceadc06e32b4068fcfbc595");
});

test("mutating canonical updates cannot bypass POC evidence or #NB", () => {
  const update = canonical();

  assert.throws(
    () => normalizeProgressiveUpdate({ ...update, poc_validated: false }),
    /poc_validated=true/,
  );
  assert.throws(
    () => normalizeProgressiveUpdate({ ...update, evidence_refs: [] }),
    /evidence_refs/,
  );
  assert.throws(
    () => normalizeProgressiveUpdate({ ...update, boundary_marker: "NB" }),
    /#NB/,
  );
  assert.throws(
    () => normalizeProgressiveUpdate({ ...update, authority_effect: "canonical" }),
    /authority_effect must remain none/,
  );
});

test("canonical SWFUS APPLIED receipt preserves all eight stages and never grants authority", () => {
  const update = canonical();
  const receipt = buildSwfusReceipt(update, {
    disposition: "APPLIED",
    receiptId: "swfus:test-applied-001",
    stateDigest: "abc123",
    createdAt: "2026-08-18T12:00:00.000Z",
  });

  assert.equal(receipt.schema, "kpgs.swfus.receipt.v1");
  assert.deepEqual(receipt.stages.map((stage) => stage.stage), SWFUS_STAGES);
  assert.equal(receipt.disposition, "APPLIED");
  assert.equal(receipt.synchronized, true);
  assert.equal(receipt.canonical_authority_changed, false);
  assert.equal(classifySwfusReceipt(receipt), "APPLIED");
  assert.deepEqual(assertSwfusReceiptForUpdate(receipt, update), receipt);
});

test("APU YELLOW is held at POC/FOC and later stages are NOT_REACHED", () => {
  const update = canonical({ apuStatus: "YELLOW" });
  const receipt = buildSwfusReceipt(update, {
    disposition: "HELD",
    receiptId: "swfus:test-held-001",
    stopStage: "POC_FOC_CHECK",
    stopStatus: "HOLD",
    stopReason: "APU YELLOW requires review before mutation.",
    createdAt: "2026-08-18T12:00:00.000Z",
  });

  const pocStage = receipt.stages.find((stage) => stage.stage === "POC_FOC_CHECK");
  const stateStage = receipt.stages.find((stage) => stage.stage === "STATE_UPDATE");
  const distributionStage = receipt.stages.find((stage) => stage.stage === "DISTRIBUTION");

  assert.equal(pocStage.status, "HOLD");
  assert.equal(stateStage.status, "NOT_REACHED");
  assert.equal(distributionStage.status, "NOT_REACHED");
  assert.equal(receipt.synchronized, false);
  assert.equal(classifySwfusReceipt(receipt), "HELD");
});

test("legacy Five's Arena S2_POC records migrate into canonical pending proposals without authority promotion", () => {
  const migrated = migrateLegacyApuToProgressiveUpdate(
    {
      schema: "fivesarena.apu.progressive-update.v1",
      update_id: "booking:apu:legacy-001",
      resource: "booking",
      resource_id: "booking-legacy",
      operation: "update",
      base_version: 4,
      stage: "S2_POC",
      receipts: [
        {
          receipt_id: "queue:booking:legacy-001",
          kind: "crud-local-persistence",
          evidence: "IndexedDB queue persisted.",
          at: "2026-08-18T08:00:00.000Z",
        },
      ],
    },
    { eventType: "booking", idempotencyKey: "booking:legacy-001" },
  );

  assert.equal(migrated.schema, "kpgs.progressive-update.v1");
  assert.equal(migrated.operation, "UPDATE");
  assert.equal(migrated.state_class, "pending_proposal");
  assert.equal(migrated.authority_effect, "none");
  assert.ok(migrated.evidence_refs.includes("legacy-apu://receipt/queue:booking:legacy-001"));
});

test("SWFUS receipts are rejected when stage order or update identity is forged", () => {
  const update = canonical();
  const receipt = buildSwfusReceipt(update, {
    disposition: "APPLIED",
    receiptId: "swfus:test-integrity-001",
    stateDigest: "digest",
    createdAt: "2026-08-18T12:00:00.000Z",
  });

  const wrongOrder = structuredClone(receipt);
  [wrongOrder.stages[0], wrongOrder.stages[1]] = [wrongOrder.stages[1], wrongOrder.stages[0]];
  assert.throws(() => normalizeSwfusReceipt(wrongOrder), /stage order mismatch/);

  const wrongUpdate = { ...receipt, update_id: "forged-update" };
  assert.throws(() => assertSwfusReceiptForUpdate(wrongUpdate, update), /update_id mismatch/);
});

test("synchronization remains distinct from canonical authority", () => {
  const update = canonical();
  const forged = {
    ...buildSwfusReceipt(update, {
      disposition: "APPLIED",
      receiptId: "swfus:test-authority-001",
      stateDigest: "digest",
      createdAt: "2026-08-18T12:00:00.000Z",
    }),
    canonical_authority_changed: true,
  };

  assert.throws(() => normalizeSwfusReceipt(forged), /may not claim canonical authority/);
});
