# Task Board

- [x] Phase 0 foundation and env normalization
- [x] Phase 1 matches hub and EPL meta/matches APIs
- [x] Phase 2 news tab, article enrichment, and YouTube media integration
- [x] Phase 3 standings views, reorder, and team analysis drawer
- [x] Phase 4 stats tab and player leaderboards
- [x] Phase 5 admin sandbox and integrations
- [x] Phase 6 hardening and regression pass
- [x] Phase 7 responsive/mobile menu and popup preference repairs
- [x] Phase 8 expanded fixtures, top-25 leagues, PSL spotlight, local fixtures redesign, homepage flag carousel controls
- [x] Phase 9 regenerate four non-infringing court images
- [x] Phase 10 security hardening and route protection
- [x] Phase 11 BotID anti-bot hardening
- [x] Phase 12 env-backed integrations, weather expansion, Google Search74 wiring
- [x] Phase 13 admin-only WhatsApp OSINT review tooling
- [x] Phase 14 Obsidian structure vault, 4-tier audit, route inventory, button inventory, and handoff pack

## Follow-up Queue

- [x] verify newsletter popup subscription write flow
- [x] harden newsletter subscriptions for local Mongo outages
- [x] harden MongoDB connection fallback from SRV to direct Atlas path
- [x] clean homepage hero/header/theme/CSP production polish issues
- [ ] add Atlas allowlist access for the current dev machine so authenticated local QA can run
- [ ] run a full authenticated manager/admin mutation QA pass with seeded data
- [ ] activate RapidAPI access/subscription for `whatsapp-osint`
- [ ] activate RapidAPI access/subscription for `google-search74`
- [ ] resolve the intermittent home-page dev manifest error on first compile

## Repository Hygiene

- [x] `.next-dev*.log` files are ignored by git
- [ ] keep repo root free of leftover local debug logs after each debugging session
