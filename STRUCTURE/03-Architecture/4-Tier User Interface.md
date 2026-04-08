# 4-Tier User Interface

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

Main improvements still worth doing:
- resolve the intermittent homepage dev bundler failure conclusively
- review guest booking success flow permissions because `/bookings/success` currently redirects for guests
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

Main improvements still worth doing:
- authenticated regression pass on newsletter compose/send
- verify every admin editor after a full data-seeded run
- expand audit logging parity for high-risk writes
