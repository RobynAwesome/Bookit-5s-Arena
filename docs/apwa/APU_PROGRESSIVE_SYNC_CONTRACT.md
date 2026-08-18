# Five's Arena — Adaptive Progressive Updates → #NB → CRUD → SWFUS

**Status:** canonical KPGS vNext adapter / non-authoritative synchronization surface.  
**Canonical authority:** `RobynAwesome/Introduction-to-MCP@6eeb285d0775a7e74ceadc06e32b4068fcfbc595`.  
**Canonical contract:** `governance/kpgs-vnext/progressive-updates/progressive-update.schema.json`.  
**Canonical runtime law:** `kopano-core/kopano/swfus_engine.py`.

Five's Arena adapts the canonical contract to its existing live Adaptive PWA. It does **not** create a second SWFUS meaning and it does not rewrite the booking product around governance terminology.

```text
Adaptive Progressive Updates (APU)
        ↓
Progressive Update
        ↓
#NB
        ↓
bounded CRUD proposal
        ↓
SWFUS
State-Wide Framework Universal Synchronization
```

`#NB` is preserved literally. This adapter does not invent an expansion.

## Canonical law

> **CRUD changes bounded state. SWFUS aligns governed system reality. Synchronization is not authority.**

For Five's Arena that means the offline synchronization endpoint may persist and synchronize a **pending proposal record**. It does not thereby prove that a booking changed, a payment settled, an account mutated, or an administrative action became canonical.

```text
SYNCED != DOMAIN WRITE APPLIED
AVAILABILITY != AUTHORITY
TRANSPORT != AUTHORITY
PROJECTION != CANONICAL BUSINESS TRUTH
```

## Canonical eight-stage receipt

Every canonical request is accounted for in this order:

```text
1. Telemetry
2. Classification
3. Routing
4. Protocol Selection
5. Invariant Audit
6. POC / FOC Check
7. State Update
8. Distribution
```

A held or rejected update still returns the full ordered receipt. Stages after the stopping gate are `NOT_REACHED`; they do not silently disappear.

### 1 — Telemetry

The request binds:

- `update_id`;
- `node_id`;
- CRUD operation;
- `idempotency_key`.

Five's Arena also requires the existing `X-Idempotency-Key` HTTP header to equal the canonical `idempotency_key` field.

Exact replay returns the existing persisted result. Reusing the same key for different content is a conflict, not a second mutation.

### 2 — Classification

The browser queue uses:

```text
lane = fivesarena.offline-sync
state_class = pending_proposal
authority_effect = none
```

APU remains a bounded adaptive signal:

- `GREEN` — may proceed to proof gates;
- `YELLOW` — HOLD;
- `RED` — REJECT;
- `UNSPECIFIED` — no signal is fabricated; explicit POC evidence is still required.

New queue writes default to `UNSPECIFIED`, not manufactured GREEN.

### 3 — Routing

Every update carries an explicit context route such as:

```text
fivesarena.booking.offline-sync
fivesarena.payment.offline-sync
```

Routing is required before any synchronized proposal is persisted.

### 4 — Protocol Selection

New browser queue writes declare:

```text
FIVESARENA_OFFLINE_SYNC_V1
```

The generic endpoint is intentionally narrow. It admits `CREATE` records for offline proposals. It does **not** pretend to execute authoritative booking/payment `UPDATE` or `DELETE` operations. Those require their own governed domain adapters and receipts.

### 5 — Invariant Audit

The canonical envelope preserves:

- `authority_effect = none`;
- `boundary_marker = #NB`;
- `invariant_passed = true`;
- finite/valid version metadata where supplied.

### 6 — POC / FOC Check

Mutating canonical requests require:

```text
poc_validated = true
foc_detected = false
evidence_refs.length >= 1
```

The browser's successful IndexedDB queue transaction is the bounded POC for **replayable offline proposal persistence**, represented by an evidence URI such as:

```text
queue://indexeddb/<idempotency-key>
```

It is not proof of the eventual domain write.

### 7 — State Update

`POST /api/v1/sync` persists the non-authoritative proposal record and its canonical receipt metadata in MongoDB.

For this adapter:

```text
CREATE proposal record = supported
READ observation = canonical contract shape supported
UPDATE domain resource = not claimed here
DELETE domain resource = not claimed here
```

The application keeps authoritative booking/payment consequences behind their existing domain-specific services.

### 8 — Distribution

Only an admitted `APPLIED` proposal returns:

```json
{
  "schema": "kpgs.swfus.receipt.v1",
  "disposition": "APPLIED",
  "synchronized": true,
  "canonical_authority_changed": false,
  "boundary_marker": "#NB"
}
```

The browser deletes the queued proposal only after it validates:

- canonical SWFUS receipt schema;
- all eight stages in canonical order;
- matching `update_id`, `node_id`, operation and evidence refs;
- `disposition = APPLIED`;
- `synchronized = true`;
- `canonical_authority_changed = false`.

`HELD` and `REJECTED` remain visible local queue states rather than being retried or erased as successful syncs.

## Canonical wire contract

Schema: `kpgs.progressive-update.v1`

```json
{
  "schema": "kpgs.progressive-update.v1",
  "update_id": "fivesarena:booking:example-001",
  "node_id": "fivesarena:booking:booking-001",
  "operation": "CREATE",
  "lane": "fivesarena.offline-sync",
  "context_route": "fivesarena.booking.offline-sync",
  "protocol": "FIVESARENA_OFFLINE_SYNC_V1",
  "idempotency_key": "booking:example-001",
  "value": {
    "event_type": "booking",
    "resource_id": "booking-001"
  },
  "apu_status": "UNSPECIFIED",
  "poc_validated": true,
  "foc_detected": false,
  "invariant_passed": true,
  "authority_effect": "none",
  "state_class": "pending_proposal",
  "evidence_refs": [
    "queue://indexeddb/booking:example-001"
  ],
  "correlation_id": "offline-sync:booking:example-001",
  "source": "fivesarena-offline-queue",
  "expected_version": null,
  "boundary_marker": "#NB"
}
```

## Legacy Five's Arena envelope

The former application-specific schema:

```text
fivesarena.apu.progressive-update.v1
S0_CONCEPT → S1_IMPLEMENTED → S2_POC → S3_SYNCED → S4_PSO → S5_GOVERNED
```

is **not canonical KPGS vNext**.

It remains readable only as a migration source for already-persisted browser/server evidence. New writes use `kpgs.progressive-update.v1`; new server proof uses `kpgs.swfus.receipt.v1`.

A legacy `S2_POC` browser record may be converted into a canonical `pending_proposal` while preserving the old receipt IDs as provenance. The migration does not turn the legacy stage names into KPGS authority.

## Existing live APWA remains intact

This is an **ADAPT_EXISTING** change.

Five's Arena keeps its existing:

- Next.js application and user journeys;
- province-aware/live context runtime;
- `full | balanced | lite | static` immersive capability behavior;
- IndexedDB degraded-mode queue;
- MongoDB sync boundary;
- booking/payment/account authority separation.

The progressive update contract sits beneath that experience so the live UI can remain simple while state movement is inspectable.

The same architectural pattern is used by the Kopano Labs Adaptive Player: local adaptive telemetry does not become authored state, the browser does not mint SWFUS receipts, and synchronized projections never claim canonical authority.

## Hard laws

```text
APU SIGNAL != POC
POC != DOMAIN WRITE
QUEUED != SYNCHRONIZED
SYNCHRONIZED != CANONICAL AUTHORITY
CLIENT MAY NOT MINT SWFUS RECEIPTS
HELD != APPLIED
REJECTED != APPLIED
IDEMPOTENCY KEY REUSE WITH DIFFERENT CONTENT => CONFLICT
OLD S0-S5 ADAPTER != CANONICAL KPGS VNEXT
```
