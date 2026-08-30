# NOW.md — FivesArena Atomic Booking Occupancy Lane

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-30 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`
> **Execution:** CRUD → SWFUS → BP → **BMP** → POCvsFOC → KPCB+
> **Stacked base:** `forge/booking-communications-contract` @ `c520d2ef0172a8467f11bfb59c713ae61e457692`
> **Upstream production lineage:** `a014a98f53e91b99de061c48f962350a006cf154`
> **Review:** `RobynAwesome/Bookit-5s-Arena#15`

## BMP BREAKING-MODEL POINT

The former availability model performed a read-time overlap check and then wrote a Booking. Under concurrency, two overlapping requests could both pass the read before either write. The legacy exact-start unique index also remained effective for cancelled bookings, preventing legitimate exact-time reuse.

**BMP result:** availability cannot remain a calculated opinion. **Occupancy is now an atomic database fact.**

## IMPLEMENTED INVARIANT

### Atomic hourly ownership

`models/BookingSlot.js` owns a unique database key:

`court + date + slot_time`

Example:

`10:00 × 3h -> 10:00, 11:00, 12:00`

`10:00 × 2h` and `11:00 × 1h` therefore collide on the same `11:00` database key.

### Transaction authority

`lib/bookings/bookingOccupancy.js` is the sole occupancy mutation engine. Booking state and hourly locks commit through MongoDB `withTransaction()` using snapshot read concern and majority write concern. There is **no non-transactional fallback**.

Governed mutations:

1. registered booking creation;
2. guest booking creation;
3. reschedule;
4. owner/admin cancellation;
5. admin status transition / cancelled-booking restore.

Communication dispatch remains after the committed reservation transaction.

### Cancellation-safe start uniqueness

Before writes the occupancy helper:

1. ensures the Booking collection exists;
2. ensures `BookingSlot` unique indexes exist;
3. removes the legacy unconditional `{ court, date, start_time }` Booking index when present;
4. creates `active_booking_start_unique` with `partialFilterExpression: { occupancyActive: true }`.

Cancellation sets `occupancyActive=false` and releases hourly locks in the same transaction. Exact cancelled starts can therefore be reused.

### Legacy compatibility

The existing read-time overlap query remains only as:

- fast user-facing rejection;
- protection for untouched legacy Booking documents that predate BookingSlot.

It is not the concurrency authority. New/touched active bookings receive hourly BookingSlot ownership; admin active-state transitions also refresh/backfill those locks.

### Rollback laws

**Reschedule:** Booking changes + slot replacement occur in one transaction. A conflict rolls back both the new Booking state and deletion of the old locks.

**Restore:** cancelled → pending/confirmed must reacquire every hourly lock. If any released hour has since been taken, restore conflicts and the Booking remains cancelled/non-occupying.

## PROOF SURFACES

### Pure/static law

- `lib/bookings/bookingOccupancySlots.mjs`
- `scripts/validate-booking-occupancy-contract.mjs`
- command: `npm run validate:booking-occupancy`

Static validator proves:

- exact hourly expansion;
- overlap vs legal adjacency;
- invalid half-hour/day-crossing rejection;
- BookingSlot unique key;
- transaction usage;
- active-only exact-start index migration;
- removal of the unconditional legacy schema uniqueness;
- all five authoritative mutation routes use the shared engine;
- registered/guest direct `Booking.create()` bypass is absent;
- admin direct status `findByIdAndUpdate()` bypass is absent.

### Real MongoDB transaction witness

- `scripts/validate-booking-occupancy-mongo.mjs`
- command: `npm run validate:booking-occupancy:mongo`
- runs against disposable MongoDB 7 single-node replica set in GitHub Actions;
- uses the same `lib/bookings/bookingOccupancy.js` engine as the API routes;
- no production secret or mock database is used.

Witness assertions returned `PASS`:

1. concurrent overlap → exactly one commit + one conflict;
2. losing transaction leaves **no orphan Booking**;
3. cancellation releases all slot locks;
4. exact cancelled start is reusable;
5. failed reschedule preserves original Booking + original locks;
6. failed cancelled-booking restore preserves cancelled state and leaves no partial locks;
7. adjacent non-overlapping bookings both commit.

## CI RECEIPTS

### Run `33297688814`

- static contract: PASS;
- syntax checks: PASS;
- `npm ci`: PASS;
- MongoDB replica set boot: PASS;
- real Mongo concurrency witness: PASS;
- production Next build: PASS.

That build surfaced the existing homepage warning that Mongo was not configured during static generation because the build step did not inherit the CI database URI.

### Final latest-head run `33297770948`

Head tested: `39e965a3aeeacc7facff7464a52635d02b5fbb2b`.

- static contract: PASS;
- authoritative syntax checks: PASS;
- locked dependency install: PASS;
- MongoDB replica set: PASS;
- real concurrency witness: PASS;
- **production Next build against the verified CI database: PASS**;
- optimized build compiled successfully and generated all 67 static pages;
- the previous missing-Mongo court-inventory warning is absent.

## POC / FOC STATE

### Occupancy mechanism

`POC_VALIDATED`

Reason: both deterministic contract proof and a real transaction-capable MongoDB concurrency witness passed against the actual occupancy implementation.

### Production FivesArena transaction chain

`NOT_YET_PRODUCTION_VALIDATED`

The occupancy mechanism is proven, but production promotion still requires the already-prepared transaction stack to be authorized upstream:

1. PR1 / fork #13 — authoritative Court source contract;
2. PR2 / fork #14 — booking communication receipts;
3. PR3 / fork #15 — atomic booking occupancy.

Then one real production-lineage reservation witness must prove:

`court source -> reservation -> business visibility -> communication receipts -> later staff payment state`

No merge/deploy is claimed from this fork review lane.

## KPCB+ FINDINGS

`npm ci` currently reports **7 dependency advisories: 1 moderate, 6 high**. PR15 changes no dependency versions, so these advisories are pre-existing dependency debt rather than occupancy-package additions. They must not be silently forgotten; schedule a separate bounded dependency-security lane instead of mixing breaking upgrades into this P0 transaction invariant.

GitHub Actions also warns that `actions/checkout@v4` and `actions/setup-node@v4` target the deprecated Node 20 action runtime and are being forced onto Node 24 by the runner. The application itself is explicitly tested on Node 22 in this workflow.

## NEXT ADMISSIBLE ACTION

1. Keep PR15 stacked and unmerged until PR2 order is preserved.
2. Preserve upstream truth: `Kopano-Labs/Bookit-5s-Arena/main` remains `a014a98f53e91b99de061c48f962350a006cf154` as of this receipt.
3. Move next to the upstream integration / full transaction witness lane; do not reopen the proven occupancy model unless new evidence breaks it.
4. Track dependency-security remediation separately so a package upgrade cannot destabilize the now-proven booking invariant.
