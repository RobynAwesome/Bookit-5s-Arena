# MASTER TODO Session 3

> [!summary]
> Live master tracker for the current work split. This file exists to stop cross-interference between `Codex Terminal`, `Codex App`, and the user.

## Color Key

- `GREEN` = complete
- `AMBER` = active / in progress
- `RED` = blocked / external dependency
- `BLUE` = handoff / needs owner confirmation

## Ownership Board

### `AMBER` Codex Terminal

- [x] audit `STRUCTURE` for stale handoff state
- [x] verify recent commit trail and active blockers
- [x] inspect reward-system implementation status
- [x] create Session 3 coordination notes in `STRUCTURE`
- [x] mirror Session 3 coordination notes into external `Schematics`
- [ ] keep ownership lanes current while parallel work is active
- [ ] update this board after each safe session checkpoint

Next:
- keep docs and handoff lane isolated
- wait for overlapping code lane to settle before touching reward/referral code
- verify reward-system completion after conflict risk is gone

### `AMBER` Codex App / Parallel Lane

- [ ] finish current overlapping edits already present in git status
- [ ] publish a short handoff note for changed files and intended next actions
- [x] confirm current lane is mainly site-url/env normalization and nav/search cleanup
- [ ] confirm whether any deeper reward/referral changes are intended beyond share URL normalization

Known active file set:
- `STRUCTURE/04-Updates/Project Status.md`
- `STRUCTURE/06-Reference/Open Issues.md`
- `app/api/referral/route.js`
- `app/api/rss/route.js`
- `app/layout.jsx`
- `app/robots.js`
- `app/sitemap.js`
- `components/BottomNavbar.jsx`
- `components/SearchModal.jsx`
- `lib/config/env.js`
- `lib/constants.js`
- `lib/integrations/stripe.js`
- `lib/notificationSender.js`
- `lib/sendBookingConfirmation.js`
- `package.json`

Next:
- complete feature/code lane safely
- verify centralized `SITE_URL` behavior across metadata, RSS, robots, sitemap, Stripe, email, and referral links
- verify search modal and bottom navbar route-change behavior after refactor
- avoid editing Session 3 coordination notes unless reconciling with this board

### `BLUE` User / Client

- [ ] decide when overlapping code lane is stable enough for merge/review
- [ ] provide or activate any blocked external access still needed
- [ ] approve reward-system completion scope if it expands beyond current UX/API

## Priority Work Still Open

### `RED` External / Access Blockers

- [ ] Atlas allowlist access for the current dev machine
- [ ] RapidAPI access/subscription for `whatsapp-osint`
- [ ] RapidAPI access/subscription for `google-search74`

### `AMBER` Reward System

- [x] reward page exists
- [x] rewards API exists
- [x] referral data model exists on `User`
- [x] referral API exists with `GET` and `POST` handlers
- [x] 5-level referral point ladder is implemented in code
- [ ] verify `/api/referral` end-to-end with real authenticated users after parallel lane stabilizes
- [ ] replace placeholder achievements with real tracked signals
- [ ] verify perk redemption logic and manager/admin visibility
- [ ] verify rewards copy, progression rules, and data truth against bookings/history
- [ ] review birthday reward interaction with `referralPoints` and confirm product intent
- [ ] review manager dashboard messaging where rewards/profile still says "coming soon"
- [ ] add reward-system QA checklist to admin/handoff docs once code lane is stable

### `AMBER` QA / Product Safety

- [ ] full authenticated manager mutation sweep
- [ ] full authenticated admin mutation sweep
- [ ] confirm popup preference toggle fix end-to-end
- [ ] confirm mobile dimensions and macOS menu fixes on real breakpoints
- [ ] confirm local fixtures redesign parity against live fixtures standard

### `BLUE` Documentation / Handoff

- [x] create Session 3 start-here note
- [x] create collaboration split note
- [x] create reward-system status note
- [x] mirror Session 3 notes to external `Schematics`
- [ ] reconcile Session 3 notes back into existing top-level status files after parallel lane ends

## Session 3 Checkpoints

- [x] Session 3 bootstrap started
- [x] `STRUCTURE` reviewed for current state
- [x] reward-system state audited at code level
- [x] master board created
- [ ] ownership board reconciled with Codex App output
- [ ] reward lane resumed safely
- [ ] merge/review checkpoint logged
