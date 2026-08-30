# NOW.md — FivesArena Booking Communications Lane

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-30 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`
> **Baseline:** upstream production lineage `a014a98f53e91b99de061c48f962350a006cf154`

## CURRENT STATE — 2026-08-30

### Objective

Implement and prove the booking communication contract that was described in historical upstream PR #17 but not actually implemented by that PR's merged patch.

Canonical target:

1. WhatsApp is the default operational reservation channel for both user and business.
2. User may select Email or SMS instead for their operational updates.
3. Reservation receipt email is always attempted for both user and business after authoritative booking persistence.
4. Guest and registered booking paths behave consistently.
5. No channel may report a production success from simulation/mock mode.
6. Delivery attempts are idempotent and persisted per booking, recipient, channel and purpose.
7. Communication sequencing follows authoritative reservation/payment state, not UI optimism.
8. Staff can query and retry the communication receipts for the exact persisted booking.

### Source-proven upstream gaps

On upstream main `a014a98f53e91b99de061c48f962350a006cf154`:

- Registered `/api/bookings` could create `status: pending` / `paymentStatus: unpaid` and immediately send user-facing "confirmed" communication.
- Registered route did not notify the business.
- Guest `/api/bookings/guest` persisted the booking but emitted no user or business communications.
- `models/Booking.js` had no per-booking preferred-channel/contact snapshot or delivery evidence.
- `lib/integrations/whatsapp.js` could return `{ success: true, mode: "simulation" }`.
- Existing email copy could call a pay-at-venue reservation "confirmed" and label the amount "Amount Paid".
- Current production booking UX is pay-at-venue only; Stripe checkout/verification routes are disabled. Therefore reservation persistence and payment confirmation are separate states.

## IMPLEMENTED ON THIS BRANCH

### Authoritative reservation sequencing

- Registered and guest routes persist the `Booking` first.
- Current reservation state is `status: pending`, `paymentStatus: reserved`.
- Communications run only after the booking exists and is visible to the admin booking query.
- Registered bookings resolve the current User record instead of relying only on a possibly stale session contact copy.
- Booking snapshots `preferredChannel`, `contactEmail`, and `contactPhone`.
- Duplicate booking-key races return HTTP `409` rather than a generic server error.

### User + business communication policy

Always-on attempts after persistence:

- user email reservation receipt;
- business email reservation receipt;
- business WhatsApp reservation notice.

User operational preference:

- WhatsApp by default;
- Email may be selected and reuses the always-on email receipt rather than sending a duplicate email;
- SMS may be selected through the provider-neutral `SMS_WEBHOOK_URL` adapter.

### Delivery evidence / idempotency

- Added `models/BookingDelivery.js`.
- Logical idempotency key is the unique tuple:
  `booking + recipientType + channel + purpose`.
- Delivery states: `queued | sending | sent | failed | skipped`.
- Provider, provider message ID, attempts, timestamps and error are persisted.
- Re-dispatch updates the same logical receipt rather than creating another one.
- Concurrent duplicate dispatches are suppressed while one receipt is actively `sending`.
- A `sending` claim older than five minutes can be reclaimed after a crashed process.
- Missing destination/provider is persisted as `skipped` or `failed`; it is not silently discarded.

### Provider truth hardening

- Explicit WhatsApp simulation is a no-send mode and returns `success: false`.
- A configured WhatsApp webhook or Evolution API must return successful HTTP status before the adapter reports `sent`.
- SMS missing provider configuration returns an explicit skipped receipt.
- Reservation email copy says reservation / amount due / pay at venue and explicitly does not claim payment unless payment state is actually paid.

### Business observability / recovery

- `GET /api/admin/bookings/[id]/deliveries` returns the booking communication timeline and status summary.
- `POST /api/admin/bookings/[id]/deliveries/retry` re-runs the same idempotent dispatcher for non-cancelled bookings; already-sent logical receipts remain suppressed.

### Booking UX

- Existing BookingForm visual language, animations, guest flow, tooltips, spinners and button treatment were preserved after review removed an earlier unnecessary style-drift pass.
- WhatsApp / Email / SMS selector added with WhatsApp preselected.
- UI states that the reservation receipt is always emailed to customer and venue.
- Registered users can supply/override the phone used for WhatsApp or SMS; backend can fall back to the current stored User phone.
- Communication degradation does not destroy the already-persisted reservation and is surfaced to the user.
- Reservation success copy separates court reservation from later staff-recorded payment confirmation.

### Offline boundary preserved

`/api/v1/sync` currently stores an accepted offline booking intent as `OfflineSyncEvent`; it does not create a real `Booking` or hold a court slot. This branch preserves that evidence class rather than silently promoting offline intent into transactional state.

## REVIEW / VALIDATION RECEIPTS

- Review PR: `RobynAwesome/Bookit-5s-Arena#14`
- Review base: `upstream-main-a014a98` -> exact upstream SHA `a014a98f53e91b99de061c48f962350a006cf154`.
- Branch is currently reviewable/mergeable inside the fork; it is not production.
- Added dependency-free static validator:
  `npm run validate:booking-communications`.
- The isolated execution runtime cannot resolve public GitHub to clone the exact branch, so this validator has **not** been falsely recorded as executed/passing.
- Latest PR head currently has **no GitHub Actions workflow run**. Absence of CI is not a green receipt.
- Automated Codex review bot reported that its code-review usage quota is exhausted; that is also not a validation receipt.
- The connected GitHub integration returns HTTP `403 Resource not accessible by integration` for issue/branch/PR writes against `Kopano-Labs/Bookit-5s-Arena`; therefore the review surface is in the writable fork and upstream production remains unchanged.

## POC / FOC

- **Source implementation:** prepared and manually source-reviewed on the fork branch.
- **Runtime POC:** `NOT_YET_VALIDATED`.
- **Production transaction chain:** `FOC_FLAGGED` until an authorized upstream merge, provider configuration, authoritative Court records, and a real witness reservation prove the full chain.

Required production witness:

`verified court -> slot reserved -> Booking visible to business -> user operational channel -> user email receipt -> business WhatsApp -> business email -> queryable BookingDelivery receipts`

## NEXT ADMISSIBLE ACTIONS

1. Keep this PR bounded to communication/state evidence; do not merge unrelated UX redesign.
2. Obtain/restore a CI or executable checkout receipt for `validate:booking-communications`, lint and build.
3. Route the prepared branch through an upstream-authorized PR path; do not claim deployment before that happens.
4. Configure/verify production email, WhatsApp and SMS providers without exposing secrets.
5. After the Court source lane is merged/populated, run one real witness reservation and inspect `/api/admin/bookings/[id]/deliveries`.
6. Only then promote the transaction communications lane to `POC_VALIDATED`.
