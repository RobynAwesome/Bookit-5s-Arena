# 5s Arena APWA + Three.js Physics POC Receipt

**Control issue:** `RobynAwesome/Introduction-to-MCP#27`  
**Implementation repository:** `RobynAwesome/Bookit-5s-Arena`  
**Date:** 2026-08-16

## APWA contract

```text
APWA = Progressive Shell + Adaptive Runtime + Resilient Mission Continuity
```

This POC makes those boundaries executable instead of using APWA as a marketing label.

### Progressive shell

- installable manifest and existing brand icons remain the baseline;
- existing icon Git blob receipts are pinned in `docs/apwa/asset-provenance.json`;
- service worker caches only public football reads and safe same-origin static/navigation responses;
- auth, booking, payment, checkout, account, profile, admin and arbitrary API responses are network-only.

### Adaptive runtime

`lib/apwa/runtime.ts` classifies a device/session into `full`, `balanced`, `lite`, or `static` from:

- reduced-motion preference;
- Save-Data / effective connection type;
- WebGL availability;
- memory/CPU hints;
- document visibility.

The result controls whether Three.js and deterministic physics should run and establishes DPR/FPS budgets.

### Resilient continuity

`lib/apwa/dataTruth.ts` forbids the UI from treating cached or old data as implicitly live. Every normalized provider payload is classified as:

```text
live | delayed | stale | unavailable
```

The service worker's offline football miss also returns `truthState: unavailable` rather than a fake live fixture response.

## Three.js / physics boundary

- `components/apwa/AdaptiveMatchWorld.tsx` owns the isolated R3F scene;
- `lib/apwa/physics.ts` advances the ball in a deterministic fixed `1/60 s` step;
- the physics state has no authority over bookings, accounts, payments or authentication;
- low-capability/reduced-motion devices receive a static court rather than a broken or wasteful canvas;
- `/labs/apwa-proof/` exposes the POC publicly inside the application shell.

## TypeScript 7 truth

The repository already contains an isolated TypeScript 7 comparison command/workflow. Production TypeScript remains the repository's declared compiler until a separate promotion changes that truth.

Therefore this POC may claim **TypeScript 7 compatibility is continuously evaluated**, but may not claim **production runs TypeScript 7** solely because the experimental checker passes.

## Definition of done for the control issue

The control issue can close when CI proves:

1. normal repository typecheck/build remain healthy;
2. TS7 compatibility check does not introduce an unclassified regression;
3. private/transactional service-worker cache exclusions remain present;
4. adaptive runtime has a static fallback;
5. deterministic physics produces the same witness for the same initial state;
6. data truth correctly separates live/delayed/stale/unavailable;
7. `/labs/apwa-proof/` builds as part of the Next.js application.

Later production expansion can deepen fixture sources, scene fidelity and device telemetry without reopening this architecture POC unless one of those invariants regresses.
