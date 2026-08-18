import mongoose from "mongoose";

// Legacy Five's Arena S0-S5 envelope retained only so already-persisted rows
// remain readable during migration. New writes use the canonical KPGS vNext
// progressiveUpdate + swfusReceipt fields below.
const LegacyApuReceiptSchema = new mongoose.Schema(
  {
    receipt_id: { type: String, required: true, trim: true },
    kind: { type: String, required: true, trim: true },
    evidence: { type: String, required: true, trim: true },
    at: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const LegacyApuProgressiveUpdateSchema = new mongoose.Schema(
  {
    schema: { type: String, required: true, enum: ["fivesarena.apu.progressive-update.v1"] },
    update_id: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    resource_id: { type: String, default: null, trim: true },
    operation: { type: String, required: true, enum: ["create", "read", "update", "delete"] },
    base_version: { type: Number, default: null, min: 0 },
    stage: {
      type: String,
      required: true,
      enum: ["S0_CONCEPT", "S1_IMPLEMENTED", "S2_POC", "S3_SYNCED", "S4_PSO", "S5_GOVERNED"],
    },
    receipts: { type: [LegacyApuReceiptSchema], default: [] },
  },
  { _id: false },
);

const ProgressiveUpdateSchema = new mongoose.Schema(
  {
    schema: { type: String, required: true, enum: ["kpgs.progressive-update.v1"] },
    update_id: { type: String, required: true, trim: true },
    node_id: { type: String, required: true, trim: true },
    operation: { type: String, required: true, enum: ["CREATE", "READ", "UPDATE", "DELETE"] },
    lane: { type: String, required: true, trim: true },
    context_route: { type: String, required: true, trim: true },
    protocol: { type: String, required: true, trim: true },
    idempotency_key: { type: String, required: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    apu_status: { type: String, required: true, enum: ["GREEN", "YELLOW", "RED", "UNSPECIFIED"] },
    poc_validated: { type: Boolean, required: true },
    foc_detected: { type: Boolean, required: true },
    invariant_passed: { type: Boolean, required: true },
    authority_effect: { type: String, required: true, enum: ["none"] },
    state_class: {
      type: String,
      required: true,
      enum: ["non_authoritative", "derived_projection", "pending_proposal"],
    },
    evidence_refs: { type: [String], default: [] },
    correlation_id: { type: String, default: "" },
    source: { type: String, default: "" },
    expected_version: { type: Number, default: null, min: 0 },
    boundary_marker: { type: String, required: true, enum: ["#NB"] },
  },
  { _id: false },
);

const SwfusStageSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      required: true,
      enum: [
        "TELEMETRY",
        "CLASSIFICATION",
        "ROUTING",
        "PROTOCOL_SELECTION",
        "INVARIANT_AUDIT",
        "POC_FOC_CHECK",
        "STATE_UPDATE",
        "DISTRIBUTION",
      ],
    },
    status: { type: String, required: true, trim: true },
    reason: { type: String, default: "" },
  },
  { _id: false },
);

const SwfusReceiptSchema = new mongoose.Schema(
  {
    schema: { type: String, required: true, enum: ["kpgs.swfus.receipt.v1"] },
    receipt_id: { type: String, required: true, trim: true },
    update_id: { type: String, required: true, trim: true },
    node_id: { type: String, required: true, trim: true },
    operation: { type: String, required: true, enum: ["CREATE", "READ", "UPDATE", "DELETE"] },
    disposition: { type: String, required: true, enum: ["APPLIED", "OBSERVED", "HELD", "REJECTED"] },
    stages: { type: [SwfusStageSchema], required: true },
    synchronized: { type: Boolean, required: true },
    canonical_authority_changed: { type: Boolean, required: true, enum: [false] },
    state_digest: { type: String, default: null },
    evidence_refs: { type: [String], default: [] },
    correlation_id: { type: String, default: "" },
    boundary_marker: { type: String, required: true, enum: ["#NB"] },
    replayed: { type: Boolean, required: true, default: false },
    created_at: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const OfflineSyncEventSchema = new mongoose.Schema(
  {
    idempotencyKey: { type: String, required: true, unique: true, trim: true },
    eventType: {
      type: String,
      required: true,
      enum: ["booking", "payment", "check-in", "broadcast", "testimony", "admin-audit"],
      trim: true,
    },
    payload: { type: mongoose.Schema.Types.Mixed, required: true },
    payloadHash: { type: String, required: true, trim: true },
    progressiveUpdate: { type: ProgressiveUpdateSchema, default: null },
    swfusReceipt: { type: SwfusReceiptSchema, default: null },
    apu: { type: LegacyApuProgressiveUpdateSchema, default: null },
    status: {
      type: String,
      enum: ["ACCEPTED", "HELD", "REJECTED", "CONFLICT", "DEAD_LETTER", "RESOLVED"],
      default: "ACCEPTED",
    },
    source: { type: String, default: "bookit_offline_queue", trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    requestMeta: {
      ipHash: { type: String, default: null },
      userAgentHash: { type: String, default: null },
    },
    lastError: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

OfflineSyncEventSchema.index({ eventType: 1, createdAt: -1 });
OfflineSyncEventSchema.index({ status: 1, updatedAt: -1 });
OfflineSyncEventSchema.index({ user: 1, createdAt: -1 });
OfflineSyncEventSchema.index({ "progressiveUpdate.update_id": 1 }, { sparse: true });
OfflineSyncEventSchema.index({ "swfusReceipt.receipt_id": 1 }, { sparse: true });
OfflineSyncEventSchema.index({ "swfusReceipt.disposition": 1, createdAt: -1 }, { sparse: true });
OfflineSyncEventSchema.index({ "apu.update_id": 1 }, { sparse: true });
OfflineSyncEventSchema.index({ "apu.stage": 1, createdAt: -1 }, { sparse: true });

if (mongoose.models.OfflineSyncEvent) {
  try {
    mongoose.deleteModel("OfflineSyncEvent");
  } catch {
    /* ignore */
  }
}

export default mongoose.model("OfflineSyncEvent", OfflineSyncEventSchema);
