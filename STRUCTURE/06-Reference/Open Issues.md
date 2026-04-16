---
title: Open Issues
created: 2026-04-16
updated: 2026-04-16
author: Codex
tags:
  - reference
  - blockers
  - issues
  - bugs
priority: critical
status: active
---

# Open Issues & Bugs

> Consolidated blocker ledger sourced directly from the Monday.com `Issues & Bugs` board.
> These items represent true friction in the Bookit 5s Arena stack.

## Critical Technical Blockers

| Ticket ID | Issue Title | Priority | Status | Page Affected | Fix Date |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Booking System API Crash | Critical | Resolved | `/bookings` | Apr 16 |
| **BUG-002** | Data Binding Zero-State ("0 Courts") | Critical | Resolved | `/` | Apr 16 |
| **BUG-003** | FAQ Component Accordion Loop | High | Resolved | `/help` | Apr 16 |
| **PAGE-001** | Missing Contact Us Surface | High | Resolved | `/contact` | Apr 16 |
| **PAGE-002** | Missing Pricing Surface | High | Resolved | `/pricing` | Apr 16 |
| **PAGE-003** | Missing Privacy/Security Surface | High | Resolved | `/privacy` | Apr 16 |

## Product Path Gaps

- **Payment System Limitations**: Currently restricted to **cash-only** payments at the venue. Online checkout workflows (Stripe Integration) need completion and testing.
- **Tournament UX Polish**: Placeholder data exists in the World Cup 5s tournament standings. Needs true data mapping to the `TournamentTeam` models (handled partially by recent UI fixes).
- **View Modes Clutter**: Clarification needed for the various view modes (TikTok, Instagram, WhatsApp UI skins) on the booking page.

## Action Plan
- Integrate the missing Webhooks/API logic to convert the application from cash-only to fully operational online payments.
