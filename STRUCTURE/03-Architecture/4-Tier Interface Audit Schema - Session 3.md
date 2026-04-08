---
title: 4-Tier Interface Audit Schema - Session 3
status: active
owner: Codex Terminal
audience:
  - owner
  - devs
  - QA
tags:
  - audit
  - interface
  - guest
  - user
  - manager
  - admin
---

# 4-Tier Interface Audit Schema - Session 3

Use this schema for every interface note so the vault stays consistent in Obsidian.

## Required Sections

1. `Mission`
2. `Primary Routes`
3. `Current Working State`
4. `Known Risks`
5. `Critical Buttons and Mutations`
6. `TODO`
7. `QA Walkthrough`
8. `Ownership`

## Status Markers

- `GREEN` = verified working
- `AMBER` = working but incomplete / needs QA
- `RED` = blocked / broken / external dependency
- `BLUE` = documentation / ownership / handoff item

## Required Thinking Rules

- Each note must distinguish `public rendering`, `auth boundary`, `mutation safety`, and `operator usability`.
- Each note must separate `implemented in code` from `fully QA-verified`.
- Every mutation surface must name its route or API.
- Every note must end with a next-owner statement.

## Session 3 Interface Notes

- [Guest Interface Audit - Session 3](../06-Reference/Guest%20Interface%20Audit%20-%20Session%203.md)
- [User Interface Audit - Session 3](../06-Reference/User%20Interface%20Audit%20-%20Session%203.md)
- [Manager Interface Audit - Session 3](../06-Reference/Manager%20Interface%20Audit%20-%20Session%203.md)
- [Admin Interface Audit - Session 3](../06-Reference/Admin%20Interface%20Audit%20-%20Session%203.md)
