# NOW.md — FivesArena Atomic Booking Occupancy Lane

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-30 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`
> **Execution:** CRUD → SWFUS → BP → **BMP** → POCvsFOC → KPCB+
> **Stacked base:** `forge/booking-communications-contract` @ `c520d2ef0172a8467f11bfb59c713ae61e457692`
> **Upstream production lineage:** `a014a98f53e91b99de061c48f962350a006cf154`

## BMP BREAKING-MODEL POINT

The previous availability model performed a read-time overlap check and then wrote a Booking. That is insufficient under concurrency:

- request A: 10:00 for 2h → occupies 10:00 + 11:00;
- request B: 11:00 for 1h → occupies 11:00;
- both can read before either writes;
- the legacy unique Booking index only compared exact `start_time`, so 10:00 and 11:00 did not collide.

BMP result: **availability cannot remain a calculated opinion. Occupancy must be an atomic database fact.**

A second breaking point was found in the legacy unique index: `{ court, date, start_time }` remained unique even after `status: cancelled`, so an exact cancelled start time could stay blocked forever.

## IMPLEMENTED MODEL

### 1. Atomic hourly ownership

Added `models/BookingSlot.js` with unique database key:

`court + date + slot_time`

A booking owns one row per occupied hour. Example:

`10:00 × 3h -> 10:00, 11:00, 12:00`

Therefore `10:00 × 2h` and `11:00 × 1h` must collide on the same 11:00 database key.

### 2. Transaction authority

Added `lib/bookings/bookingOccupancy.js`.

All occupancy mutations execute through MongoDB `withTransaction()` using snapshot read concern and majority write concern. No fallback creates a Booking without its slot rows.

Governed mutations:

1. registered booking creation;
2. guest booking creation;
3. reschedule;
4. owner/admin cancellation;
5. admin status transition / cancelled-booking restore.

Communication dispatch remains outside and after the committed reservation transaction.

### 3. Cancellation-safe index migration

Before occupancy writes, the helper:

1. ensures `BookingSlot` unique indexes exist;
2. finds/removes the legacy unconditional `{ court, date, start_time }` Booking index;
3. creates `active_booking_start_unique` with `partialFilterExpression: { occupancyActive: true }`.

`Booking.occupancyActive` is true for active reservations and false on cancellation.

This preserves exact-start defense while allowing a cancelled slot to be legitimately reused.

### 4. Legacy compatibility without weakening the invariant

The existing Booking overlap query remains as:

- fast user-facing rejection;
- protection for untouched legacy Booking documents that predate BookingSlot.

It is no longer the concurrency authority.

Every new or touched active booking receives hourly BookingSlot rows. Admin active-status transitions also refresh/backfill slot rows for legacy bookings.

### 5. Reschedule rollback semantics

Reschedule changes Booking fields and replaces its hourly locks in one transaction.

If any new hour is already owned:

- transaction aborts;
- the new Booking state is not committed;
- deletion of old locks is rolled back;
- original reservation remains authoritative.

### 6. Restore semantics

Cancelled → pending/confirmed must reacquire every hourly slot in the same transaction. If another booking has taken any hour, restore returns conflict and status remains cancelled.

## PROOF SURFACES

Pure slot law:

- `lib/bookings/bookingOccupancySlots.mjs`

Dependency-free validator:

- `npm run validate:booking-occupancy`
- `scripts/validate-booking-occupancy-contract.mjs`

Validator checks:

- hourly expansion examples;
- overlap vs adjacency;
- invalid half-hour/day-crossing inputs;
- unique BookingSlot index presence;
- MongoDB transaction usage;
- active-only start index migration;
- removal of legacy unconditional schema uniqueness;
- registered/guest create routing;
- reschedule/cancel routing;
- admin status routing;
- absence of direct bypass writes in those routes.

CI gate:

- `.github/workflows/booking-occupancy-contract.yml`
- zero secrets required;
- runs validator plus `node --check` on authoritative server files.
- first push run ID: `33297490828`.

## EVIDENCE STATE

### Source-level

`PREPARED_AND_GATED`

### CI

The first branch push successfully created GitHub Actions run `33297490828`. Its final conclusion must be read before promotion; queued/running is not PASS.

### Runtime database witness

`NOT_YET_VALIDATED`

Required witness is a real transaction-capable MongoDB environment proving:

1. overlapping concurrent requests produce one commit + one conflict;
2. no orphan Booking survives the losing transaction;
3. cancelling releases slot ownership;
4. exact cancelled start time can be rebooked;
5. failed reschedule preserves original booking and original locks;
6. cancelled restore fails if any hour has been taken.

## POC / FOC

- **Model/BMP remediation:** implemented on the stacked branch.
- **Static CI POC:** pending final workflow conclusion.
- **Database concurrency POC:** `NOT_YET_VALIDATED` until live transaction witness.
- **Production FOC:** blocked until PR1 Court source + PR2 communications + this occupancy lane are authorized upstream and the full reservation witness passes.

## NEXT ADMISSIBLE ACTION

1. Read CI run `33297490828` to PASS/failure and fix any failure rather than explain it away.
2. Open the bounded stacked review PR against `forge/booking-communications-contract`.
3. Do not merge/deploy from this branch without the database concurrency witness.
4. After upstream authorization, execute the real collision/cancel/rebook/reschedule/restore witness before `POC_VALIDATED`.
