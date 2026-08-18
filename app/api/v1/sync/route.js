export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/getSession";
import connectDB from "@/lib/mongodb";
import { rateLimit } from "@/lib/rateLimit";
import {
  KPGS_PROGRESSIVE_UPDATE,
  SWFUS_STAGES,
  buildSwfusReceipt,
  migrateLegacyApuToProgressiveUpdate,
  normalizeProgressiveUpdate,
} from "@/lib/offline/kpgsProgressiveUpdate";
import OfflineSyncEvent from "@/models/OfflineSyncEvent";

const VALID_EVENT_TYPES = new Set([
  "booking",
  "payment",
  "check-in",
  "broadcast",
  "testimony",
  "admin-audit",
]);

const MAX_BODY_BYTES = 32 * 1024;
const IDEMPOTENCY_KEY_PATTERN = /^[a-zA-Z0-9:_.-]{8,220}$/;

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

function sha256(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normalizeBody(body) {
  const eventType = body?.event_type || body?.eventType;
  const payload =
    body?.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? body.payload
      : body?.data && typeof body.data === "object" && !Array.isArray(body.data)
        ? body.data
        : null;
  return { eventType, payload };
}

function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function getOptionalSession() {
  try {
    return await getAuthSession();
  } catch {
    return null;
  }
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function isStoreUnavailable(error) {
  return (
    error?.name === "MongooseServerSelectionError" ||
    error?.name === "MongoServerSelectionError" ||
    /Could not connect to any servers/i.test(error?.message || "")
  );
}

function extractProgressiveUpdate(body, eventType, idempotencyKey) {
  const candidate = body?.progressive_update ?? body?.progressiveUpdate ?? null;
  if (candidate) return normalizeProgressiveUpdate(candidate);
  if (body?.apu) {
    return migrateLegacyApuToProgressiveUpdate(body.apu, { eventType, idempotencyKey });
  }
  return null;
}

function replayPayload(existing, idempotencyKey, eventType) {
  const receipt = existing?.swfusReceipt
    ? { ...existing.swfusReceipt, replayed: true }
    : null;
  return {
    ok: true,
    replay: true,
    idempotencyKey,
    eventType,
    status: existing?.status || "ACCEPTED",
    ...(receipt ? { receipt } : {}),
    ...(existing?.apu ? { apu: existing.apu } : {}),
  };
}

function receiptId(idempotencyKey, payloadHash, disposition) {
  return `swfus:${sha256(`${idempotencyKey}:${payloadHash}:${disposition}`).slice(0, 48)}`;
}

function decideProgressiveUpdate(update) {
  if (update.operation === "READ") {
    return { disposition: "OBSERVED", stopStage: null, stopStatus: null, stopReason: null };
  }

  // /api/v1/sync is an append-only proposal intake. It may persist a CREATE
  // proposal, but it does not pretend to execute authoritative booking/payment
  // UPDATE or DELETE semantics on behalf of their domain adapters.
  if (update.operation !== "CREATE") {
    return {
      disposition: "REJECTED",
      stopStage: "PROTOCOL_SELECTION",
      stopStatus: "REJECT",
      stopReason: "Five's Arena offline sync only admits CREATE proposal records; domain UPDATE/DELETE requires its own governed adapter.",
    };
  }

  if (update.apu_status === "RED") {
    return {
      disposition: "REJECTED",
      stopStage: "POC_FOC_CHECK",
      stopStatus: "REJECT",
      stopReason: "APU RED update cannot mutate or distribute.",
    };
  }
  if (update.apu_status === "YELLOW") {
    return {
      disposition: "HELD",
      stopStage: "POC_FOC_CHECK",
      stopStatus: "HOLD",
      stopReason: "APU YELLOW requires review before mutation.",
    };
  }

  return { disposition: "APPLIED", stopStage: null, stopStatus: null, stopReason: null };
}

function buildReceipt(update, idempotencyKey, payloadHash, decision, stateDigest = null) {
  return buildSwfusReceipt(update, {
    disposition: decision.disposition,
    receiptId: receiptId(idempotencyKey, payloadHash, decision.disposition),
    stateDigest,
    stopStage: decision.stopStage,
    stopStatus: decision.stopStatus,
    stopReason: decision.stopReason,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/v1/sync",
    eventTypes: Array.from(VALID_EVENT_TYPES),
    idempotency: "X-Idempotency-Key",
    progressiveUpdate: {
      schema: KPGS_PROGRESSIVE_UPDATE.schema,
      receiptSchema: KPGS_PROGRESSIVE_UPDATE.receiptSchema,
      boundaryMarker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker,
      stages: SWFUS_STAGES,
      canonicalSource: `${KPGS_PROGRESSIVE_UPDATE.canonicalRepository}@${KPGS_PROGRESSIVE_UPDATE.canonicalCommit}`,
      stateClass: "pending_proposal",
      authorityEffect: "none",
      semantics: "Adaptive Progressive Update -> #NB -> bounded CRUD proposal -> SWFUS; synchronization is not domain authority.",
      legacyApuMigration: "fivesarena.apu.progressive-update.v1 S2_POC is accepted only as migration evidence.",
    },
    status: "ready",
  });
}

export async function POST(request) {
  const idempotencyKey = request.headers.get("X-Idempotency-Key")?.trim();
  if (!idempotencyKey) return badRequest("Missing X-Idempotency-Key header.");
  if (!IDEMPOTENCY_KEY_PATTERN.test(idempotencyKey)) {
    return badRequest("Invalid X-Idempotency-Key format.");
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Sync payload is too large." }, { status: 413 });
  }

  const ip = getClientIp(request);
  if (rateLimit(`offline-sync:${ip}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many sync attempts." }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return badRequest("Request body must be valid JSON.");
  }

  const serializedBody = stableJson(body);
  if (Buffer.byteLength(serializedBody, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Sync payload is too large." }, { status: 413 });
  }

  const { eventType, payload } = normalizeBody(body);
  if (!VALID_EVENT_TYPES.has(eventType)) {
    return badRequest(`Unsupported event_type. Use one of: ${Array.from(VALID_EVENT_TYPES).join(", ")}.`);
  }
  if (!payload) return badRequest("Body must include an object payload.");

  let progressiveUpdate = null;
  try {
    progressiveUpdate = extractProgressiveUpdate(body, eventType, idempotencyKey);
  } catch (error) {
    return badRequest(error?.message || "Invalid canonical progressive update envelope.");
  }

  if (progressiveUpdate && progressiveUpdate.idempotency_key !== idempotencyKey) {
    return badRequest("Progressive update idempotency_key must match X-Idempotency-Key.");
  }

  const payloadHash = sha256(
    stableJson({
      eventType,
      payload,
      ...(progressiveUpdate ? { progressive_update: progressiveUpdate } : {}),
    }),
  );
  const session = await getOptionalSession();

  try {
    await connectDB();

    const existing = await OfflineSyncEvent.findOne({ idempotencyKey }).lean();
    if (existing) {
      if (existing.eventType !== eventType || existing.payloadHash !== payloadHash) {
        const conflictReceipt = progressiveUpdate
          ? buildSwfusReceipt(progressiveUpdate, {
              disposition: "REJECTED",
              receiptId: receiptId(idempotencyKey, payloadHash, "IDEMPOTENCY_COLLISION"),
              stopStage: "TELEMETRY",
              stopStatus: "REJECT",
              stopReason: "idempotency key collision",
            })
          : null;
        return NextResponse.json(
          {
            error: "Idempotency conflict. The same key was used for different content.",
            idempotencyKey,
            status: "CONFLICT",
            ...(conflictReceipt ? { receipt: conflictReceipt } : {}),
          },
          { status: 409 },
        );
      }
      return NextResponse.json(replayPayload(existing, idempotencyKey, eventType));
    }

    const decision = progressiveUpdate ? decideProgressiveUpdate(progressiveUpdate) : null;
    const stateDigest =
      progressiveUpdate && decision?.disposition === "APPLIED"
        ? sha256(stableJson({ eventType, payload, progressive_update: progressiveUpdate }))
        : null;
    const swfusReceipt = progressiveUpdate
      ? buildReceipt(progressiveUpdate, idempotencyKey, payloadHash, decision, stateDigest)
      : null;
    const status =
      decision?.disposition === "HELD"
        ? "HELD"
        : decision?.disposition === "REJECTED"
          ? "REJECTED"
          : "ACCEPTED";

    const created = await OfflineSyncEvent.create({
      idempotencyKey,
      eventType,
      payload,
      payloadHash,
      ...(progressiveUpdate ? { progressiveUpdate } : {}),
      ...(swfusReceipt ? { swfusReceipt } : {}),
      status,
      source: progressiveUpdate ? "fivesarena_kpgs_progressive_swfus_v1" : "bookit_offline_queue",
      user: session?.user?.id || null,
      requestMeta: {
        ipHash: sha256(ip),
        userAgentHash: sha256(request.headers.get("user-agent") || ""),
      },
    });

    const responseStatus = status === "REJECTED" ? 422 : 202;
    return NextResponse.json(
      {
        ok: status !== "REJECTED",
        replay: false,
        idempotencyKey,
        eventType,
        status,
        ...(created.swfusReceipt
          ? { receipt: created.swfusReceipt.toObject?.() || created.swfusReceipt }
          : {}),
      },
      { status: responseStatus },
    );
  } catch (error) {
    if (error?.code === 11000) {
      try {
        const duplicate = await OfflineSyncEvent.findOne({ idempotencyKey }).lean();
        return NextResponse.json(replayPayload(duplicate, idempotencyKey, eventType));
      } catch {
        return NextResponse.json({ ok: true, replay: true, idempotencyKey, eventType, status: "ACCEPTED" });
      }
    }

    if (isStoreUnavailable(error)) {
      console.error("POST /api/v1/sync store unavailable:", error);
      return NextResponse.json(
        { error: "Offline sync store is temporarily unavailable. Retry later." },
        { status: 503 },
      );
    }

    console.error("POST /api/v1/sync error:", error);
    return NextResponse.json({ error: "Offline sync failed." }, { status: 500 });
  }
}
