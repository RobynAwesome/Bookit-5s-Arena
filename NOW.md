# NOW.md — FivesArena Booking Communications Lane

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-30T07:39:00+02:00 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`

## CURRENT STATE — 2026-08-30

### Objective

Implement and prove the booking communication contract that was described in historical PR #17 but not actually implemented by that PR's merged patch.

Canonical target:

1. WhatsApp is the default operational confirmation channel for both user and business.
2. User may select Email or SMS instead.
3. Email receipt is always sent to both user and business for every authoritative successful booking.
4. Guest and registered booking paths behave consistently.
5. No channel may report a production success from simulation/mock mode.
6. Delivery attempts are idempotent and persisted per booking, recipient and channel.
7. Confirmation sequencing follows authoritative booking/payment state, not UI optimism.

### Source-proven gaps on upstream main `a014a98f53e91b99de061c48f962350a006cf154`

- Registered `/api/bookings` creates `status: pending`; for non-pay-at-venue bookings it also creates `paymentStatus: unpaid`, then immediately sends user email and WhatsApp.
- Registered route does not notify the business.
- Guest `/api/bookings/guest` creates the booking but emits no user or business communications.
- `models/Booking.js` has no `preferredChannel` or persisted delivery log.
- `lib/integrations/whatsapp.js` returns `{ success: true, mode: "simulation" }` when the provider URL is absent or simulation is enabled.

### POC/FOC

- **Current:** `FOC_FLAGGED` for the complete communications contract.
- **Required witness:** one real booking must be visible to business and carry queryable user/business delivery receipts before `POC_VALIDATED`.

### Next admissible action

Implement this lane only after the bounded Court CRUD/source contract PR is opened, so source restoration and communications sequencing remain separately reviewable.
