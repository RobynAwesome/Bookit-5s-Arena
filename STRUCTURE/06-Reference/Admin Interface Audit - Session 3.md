---
title: Admin Interface Audit - Session 3
tier: admin
status: active
owner: Codex Terminal
---

# Admin Interface Audit - Session 3

## Mission

The admin interface is the operational control layer for the whole platform. It must remain the only place for high-risk writes, audits, global configuration, and platform support tooling.

## Primary Routes

- `/admin/dashboard`
- `/admin/bookings`
- `/admin/competitions`
- `/admin/competitions/league`
- `/admin/competitions/tournament`
- `/admin/newsletter`
- `/admin/rights`
- `/admin/integrations`
- `/admin/sandbox`

## Current Working State

- `GREEN` guest access is blocked correctly.
- `GREEN` admin integrations and sandbox surfaces exist.
- `GREEN` provider health and tool-management surfaces were added in earlier phases.
- `AMBER` high-density mutation screens still need seeded walkthroughs.
- `AMBER` newsletter compose/send remains a key manual-QA target.
- `AMBER` security posture is materially stronger, but admin write audit parity can still improve.

## Known Risks

- admin screens concentrate many destructive or high-impact actions
- some integrations depend on external subscriptions or target-environment access
- seeded data is required to meaningfully verify editors and moderation tools

## Critical Buttons and Mutations

- booking moderation
- competition fixture generation
- standings and score editors
- rights/feature toggles
- newsletter compose/duplicate/delete/send
- integrations refresh/add/toggle/delete
- sandbox create/run/stop
- WhatsApp OSINT review submit

## TODO

- [ ] run full seeded admin walkthrough
- [ ] verify all competition editors with real sample data
- [ ] verify newsletter flow end-to-end
- [ ] verify sandbox lifecycle in target env
- [ ] expand audit logging parity for high-risk writes

## QA Walkthrough

1. Log in as admin.
2. Open dashboard, bookings, competitions, rights, newsletter, integrations, and sandbox.
3. Exercise one mutation path per page.
4. Confirm auditability, validation, and UI confirmation states.
5. Confirm blocked external integrations fail cleanly.

## Ownership

Current next owner: authenticated QA lane with admin fixtures/newsletter/test data.
