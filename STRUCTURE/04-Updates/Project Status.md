# Project Status

## Overall

Status: `handoff-ready with active post-phase follow-ups recorded`

The product is materially ahead of the starting point:

- the football hub is implemented
- local fixtures were upgraded
- integrations are visible and operable from admin
- security posture is stronger
- the repository handoff structure now exists
- post-handoff resilience and homepage polish work has also been integrated

## What Is Stable

- `npm run build` now runs with lint enabled again and completed successfully on April 8, 2026
- `npm run lint` now passes with 73 warnings on April 8, 2026, down from the previous 109-warning baseline
- current lint blockers in shared navigation/theme hygiene were removed
- public football routes load
- admin sandbox exists
- provider health aggregation exists
- BotID is active on abuse-prone endpoints
- newsletter popup subscribe path now has a local fallback when Mongo is unavailable
- homepage and `/api/courts` stay usable with seeded fallback court data during local Mongo outages
- homepage hero/header/CSP and local Leaflet asset loading were cleaned up after the first handoff pass
- site URL consumers now sanitize malformed `NEXTAUTH_URL` values before emitting links into metadata, feeds, emails, and redirects
- `/bookings/success` is now intentionally guest-accessible and routes each signed-in role back to the correct tier-owned surface

## What Still Needs Follow-up

- intermittent `/` local dev manifest glitch
- authenticated local manager/admin QA still depends on Atlas allowing this machine IP
- guest `/bookings/success` still needs a live end-to-end payment confirmation pass once Stripe verify/webhook flows are fully available locally
- WhatsApp OSINT now resolves env aliases correctly, but current RapidAPI access still returns `403`
- Google Search74 now resolves env aliases correctly, but current RapidAPI access still returns `403`
- root-level local debug log files should be deleted after investigation runs so the workspace stays clean
