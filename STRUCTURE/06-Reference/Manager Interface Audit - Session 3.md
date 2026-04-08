---
title: Manager Interface Audit - Session 3
tier: manager
status: active
owner: Codex Terminal
---

# Manager Interface Audit - Session 3

## Mission

The manager interface must stay focused on squad, fixtures, competition, and team-ops workflows without inheriting admin-level control or confusing user-only pathways.

## Primary Routes

- `/manager/dashboard`
- `/manager/fixtures`
- `/manager/squad`
- `/tournament/manager`

## Current Working State

- `GREEN` guest access is blocked.
- `GREEN` manager routes still exist after the fixtures hub rollout.
- `AMBER` manager mutation paths remain under-tested with real seeded data.
- `AMBER` manager reward messaging is inconsistent because `/rewards` adapts copy while manager dashboard still advertises rewards/profile as coming soon.

## Known Risks

- seeded-data gaps can hide manager-only mutation bugs
- competition flows combine multiple surfaces and need route-to-API walkthroughs
- manager dashboards can drift from the actual capabilities exposed elsewhere

## Critical Buttons and Mutations

- squad management save/remove actions
- fixture management controls
- lineup / tournament tools
- rewards/challenges actions in tournament manager
- dashboard quick links

## TODO

- [ ] run seeded manager QA for each route
- [ ] reconcile dashboard messaging with actual rewards availability
- [ ] verify squad, lineup, and fixtures mutations against live API behavior
- [ ] confirm role-aware redirects always send managers back to manager-owned pages

## QA Walkthrough

1. Log in as a manager.
2. Visit dashboard and verify summary cards and quick links.
3. Visit `/manager/squad` and test mutations.
4. Visit `/manager/fixtures` and test fixture operations.
5. Visit `/tournament/manager` and step through every tab.
6. Cross-check whether manager-facing rewards surfaces are truthful and usable.

## Ownership

Current next owner: authenticated QA lane with seeded manager data.
