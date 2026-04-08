# Dev Tracker

## Recent Commits

- `d85da42` `record-session-3-build-checkpoint`
- `9249309` `clarify-session-3-parallel-ownership`
- `7be1c95` `refine-session-3-reward-handoff`
- `0f1d03f` `add-session-3-reward-qa-checklist`
- `29bd592` `wire-session-3-vault-index`
- `ed13710` `session-3-coordination-layer`
- `3bdc468` `homepage-csp-hero-polish`
- `1fdba7a` `followup-external-access-blockers`
- `7781658` `followup-newsletter-mongo-resilience`
- `2b0eb74` `phase-14-obsidian-structure-and-ui-audit`
- `245907a` `phase-13-whatsapp-osint-admin-review`
- `a50416d` `phase-12-env-integrations-weather-search`
- `8ef6b3d` `phase-11-botid-anti-bot-hardening`
- `d13807e` `phase-10-security-hardening`

## Verification Pattern Used

- targeted eslint on touched files
- `npm run build`
- clean dev restart when phase risk touched route/build state
- smoke checks on changed public routes

## Session 3 Verification

- current combined working tree completed `npm run build` successfully on `2026-04-08`
- `next build` is linting again because the parallel lane restored the normal build script
- build currently passes with a sizable warning backlog, not hard lint errors
- data access during build still surfaces the known Atlas allowlist blocker, but the site falls back instead of failing the build
- parallel Codex report confirms `npm run lint` passes with `73 warnings` and `0 errors`
- parallel Codex report confirms `npm run build` passes and did not touch untracked Session 3 docs or `lib/bookingSlots.js`
- booking/court lane targeted eslint now passes with `0` warnings and `0` errors
- court media files were regenerated at `2026-04-08 18:41` and service-worker cache version was bumped
- hourly booking selection is now enforced in UI and booking APIs for create, guest reserve, and edit flows

## Local Dev Notes

- port `3002` is the normal dev port
- `.next` should be cleared if Next dev starts surfacing manifest or stale build artifacts
- `.next-dev-phase*.log` files were only temporary local debugging artifacts and should not remain in the repo root once the debugging pass is complete
- local Mongo auth is no longer blocked by SRV resolution, but it is still blocked if Atlas has not allowlisted the current machine IP
- Google Search74 and WhatsApp OSINT provider wiring is in place, but live verification currently fails with `403` until the RapidAPI account has access to those APIs
