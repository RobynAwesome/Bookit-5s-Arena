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
- **WHY:** Production currently withholds court inventory because `/api/courts` cannot prove an authoritative source. Source audit found `POST /api/courts` wrote a payload shape that disagreed with both the existing Add Court form and `models/Court.js`. Registered booking creation sends user notifications while the booking is still pending/unpaid; guest booking creation sends no notifications; neither path provides the canonical user/business delivery log contract.
- **Baseline receipt:** upstream `main` = `a014a98f53e91b99de061c48f962350a006cf154` (PR #26 merge).
- **POC/FOC:** `FOC_FLAGGED` for the end-to-end transaction chain; `POC_VALIDATED` only for the bounded court payload normalization contract described below.
- **Known uncertainty:** Production database contents and provider credentials are not inferred from repository code. A post-merge live witness booking is required before the transaction chain can become `POC_VALIDATED`.

### 2026-08-30 — Court source contract receipt

- Added `lib/courts/normalizeCourtPayload.js` as the single normalization boundary.
- `POST /api/courts` now persists canonical `Court` schema names (`price_per_hour`, `image`, etc.) and accepts the old `pricePerHour` / `images` names only as migration aliases.
- Added `scripts/validate-court-contract.mjs` and `npm run validate:court-contract`.
- Local zero-credential execution receipt:
  - `court-contract: PASS`
  - canonical persisted price field: `price_per_hour`
  - legacy aliases accepted only at normalization boundary: `pricePerHour`, `images`
- Execution environment could not resolve `github.com`, so full remote clone/build was not fabricated as passing. GitHub/Vercel checks remain required on the PR.

### Next admissible actions

1. Open a reviewable PR against `Kopano-Labs/Bookit-5s-Arena:main` for the bounded Court CRUD/source contract fix.
2. On review/merge, populate or confirm real court records only from authoritative venue/admin data; do not promote the archived fallback court list into transactional state.
3. Follow with the separate `forge/booking-communications-contract` branch covering WhatsApp default, email receipts to user + business, optional SMS/email preference, idempotent delivery logs, guest parity, and authoritative confirmation sequencing.
4. Do not claim production POC until a real booking is visible to the business and delivery receipts are witnessed.

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
