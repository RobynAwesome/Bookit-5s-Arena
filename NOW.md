# NOW.md — FivesArena Active Working Log

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-30T07:39:00+02:00 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`
> **Doctrine:** recover current state before execution; receipt material changes before handoff.

## CURRENT STATE — 2026-08-30

### Current objective

Restore the FivesArena proof-of-concept transaction chain before treating presentation work as proof:

`authoritative court -> bookable slot -> persisted booking -> business visibility -> user/business communication receipts`

### Active lane

- **Status:** IN-PROGRESS
- **WHO:** Forge / stateless renter
- **WHAT:** Repair the `Court` CRUD contract and then remediate booking communication/state sequencing.
- **WHERE:** `Kopano-Labs/Bookit-5s-Arena`, branch `forge/restore-court-source-contract` in `RobynAwesome/Bookit-5s-Arena`.
- **WHY:** Production currently withholds court inventory because `/api/courts` cannot prove an authoritative source. Source audit found `POST /api/courts` writes `pricePerHour`, `images`, `openTime`, and `closeTime`, while `models/Court.js` requires `price_per_hour` and uses a different shape. Registered booking creation sends user notifications while the booking is still pending/unpaid; guest booking creation sends no notifications; neither path provides the canonical user/business delivery log contract.
- **Baseline receipt:** upstream `main` = `a014a98f53e91b99de061c48f962350a006cf154` (PR #26 merge).
- **POC/FOC:** `FOC_FLAGGED` for transaction chain; World Cup archive remediation remains separately complete.
- **Known uncertainty:** Production database contents and provider credentials are not inferred from repository code. A post-merge live witness booking is required before POC_VALIDATED.

### Next admissible actions

1. Normalize `POST /api/courts` to the canonical `Court` schema and reject malformed input explicitly.
2. Add a source-contract validation receipt that does not require production credentials.
3. Open a reviewable PR against `Kopano-Labs/Bookit-5s-Arena:main`.
4. Follow with a separate booking-communications PR covering WhatsApp default, email receipts to user + business, optional SMS/email preference, idempotent delivery logs, guest parity, and authoritative confirmation sequencing.
5. Do not claim production POC until a real booking is visible to the business and delivery receipts are witnessed.

## HANDOFF FORMAT

After each material change record:

- Status: IN-PROGRESS | DONE | BLOCKED | PAUSED
- WHO
- WHAT
- WHERE
- WHY
- Evidence / receipts
- POC/FOC
- Known errors / uncertainty
- Next admissible action
