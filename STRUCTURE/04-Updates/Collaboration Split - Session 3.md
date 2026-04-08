# Collaboration Split - Session 3

> [!warning]
> Two active coding surfaces exist right now. This note defines the safe split so work does not collide.

## Agent Labels

- `Codex Terminal` = this terminal-driven agent session
- `Codex App` = the other Codex/editor session mentioned by the user

## Codex Terminal Lane

Safe write scope for this session:
- new coordination notes
- vault handoff improvements
- external `Schematics` sync
- audits, inventories, checklists, and non-overlapping docs

Do not touch without reconciliation:
- reward/referral runtime code
- env/runtime config files already modified in the parallel lane
- shared status files currently showing live edits

## Codex App Lane

Files currently showing live edits and therefore treated as owned by the parallel lane until reconciled:
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

Observed functional scope from current diff:
- centralizing `SITE_URL` and env-driven canonical origin handling
- routing metadata hardening for `layout`, `robots`, `sitemap`, `rss`, and referral links
- checkout/email/notification links moving to shared site constants
- `SearchModal` and `BottomNavbar` state handling being refactored around route changes and interaction resets
- `package.json` build script switching back to linted builds

## Merge Protocol

1. Finish work inside the owned lane only.
2. Record intent and next action in the master board.
3. Reconcile overlapping files only after the active lane pauses.
4. Do not revert or overwrite unreviewed parallel edits.

## Session 3 Difference Summary

### Codex Terminal

- focused on structure, handoff, reward audit, ownership map, and next-engineer clarity
- avoids collision with live feature/config work

### Codex App

- appears to be inside active product/config/runtime changes
- current lane is primarily origin/env normalization plus search/nav interaction cleanup
- reward work is only adjacent in this lane through referral share URL normalization, not a full reward-system rewrite
- still needs to publish final intent before reward/referral code can be safely continued

## Immediate Next Move

- `Codex Terminal`: maintain docs lane and prepare reward-system continuation plan.
- `Codex App`: complete or pause the overlapping file set, then hand off.
