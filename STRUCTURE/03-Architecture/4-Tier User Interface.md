# 4-Tier User Interface

The 4-tier interface is not just a navigation map. It is the platform's core product and security boundary.

Every route, CTA, success state, mutation flow, and QA pass must be evaluated against these four tiers:
- Guest
- User
- Manager
- Admin

Non-negotiable rules:
- guest pages must stay discoverable without accidentally exposing member, manager, or admin data
- user pages must assume ownership-scoped data and booking self-service
- manager pages must stay limited to squad and competition operations for that team context
- admin pages must remain the only place for high-risk operational control, audits, and global mutations
- cross-tier pages such as `/bookings/success` must degrade safely and then hand each role back to the correct interface

If a change does not describe its effect on Guest, User, Manager, and Admin, the change is incomplete.

Session 3 audit notes:
- [4-Tier Interface Audit Schema - Session 3](4-Tier%20Interface%20Audit%20Schema%20-%20Session%203.md)
- [Guest Interface Audit - Session 3](../06-Reference/Guest%20Interface%20Audit%20-%20Session%203.md)
- [User Interface Audit - Session 3](../06-Reference/User%20Interface%20Audit%20-%20Session%203.md)
- [Manager Interface Audit - Session 3](../06-Reference/Manager%20Interface%20Audit%20-%20Session%203.md)
- [Admin Interface Audit - Session 3](../06-Reference/Admin%20Interface%20Audit%20-%20Session%203.md)

## Guest

Primary surfaces:
- landing page
- fixtures hub
- arena fixtures
- tournaments, blog, docs, case studies, jobs, partners, rules, security
- login and registration

Current state:
- most public pages respond `200` in local dev
- `/fixtures` and `/fixtures/arena` are stable
- `/` can intermittently fail on first compile in dev, then recover on refresh
- `/bookings/success` is now intentionally guest-accessible so direct payment and legacy confirmation links do not dead-end at auth

Main improvements still worth doing:
- resolve the intermittent homepage dev bundler failure conclusively
- keep guest booking confirmation rendering safe without widening access to private booking detail APIs
- tighten newsletter popup subscribe flow verification

## User

Primary surfaces:
- profile
- bookings
- rewards
- my courts
- booking detail and edit flows

Current state:
- these pages are auth-gated and correctly redirect guests
- popup preference re-enable controls were added to profile
- booking and profile route protection is active in middleware
- authenticated users coming from `/bookings/success` can route back into `/bookings` for self-service follow-up

Main improvements still worth doing:
- deeper authenticated smoke tests for booking edit and resend flows
- verify third-party avatar upload flows with real provider credentials

## Manager

Primary surfaces:
- `/manager/dashboard`
- `/manager/fixtures`
- `/manager/squad`
- `/tournament/manager`

Current state:
- guest access is blocked correctly
- tournament and fixtures tooling remain present after the EPL hub rollout
- standings, lineups, and squad-related flows were not removed by the recent work
- role-aware follow-up from shared confirmation surfaces should continue sending managers back to manager-owned tools instead of user-only views

Main improvements still worth doing:
- authenticated smoke for every manager mutation flow
- verify AI co-coach and lineup flows against live tournament data

## Admin

Primary surfaces:
- dashboard
- bookings
- competitions
- rights
- newsletter
- integrations
- sandbox

Current state:
- guest access is blocked correctly
- admin integrations now covers provider health, runtime cache, weather, search, AI Gateway, Braintrust, Mux, BallDontLie, and WhatsApp OSINT
- sandbox is restricted and based on whitelisted presets
- admin handoff pages must keep steering operators back into admin-owned control surfaces for auditability

Main improvements still worth doing:
- authenticated regression pass on newsletter compose/send
- verify every admin editor after a full data-seeded run
- expand audit logging parity for high-risk writes
