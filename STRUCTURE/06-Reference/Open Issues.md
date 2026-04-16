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

- **Booking System API Crash**: The `/bookings` page is failing to load correctly due to an API error stating *"Could not load bookings"*. This prevents users from interacting with the core reservation flow.
- **Data Binding Zero-State**: The Homepage hero/stats and the Bookings page are incorrectly displaying **0 Courts** and **R 0/hr** instead of fetching the live venue metrics from the database.

## Product Path Gaps

- **Payment System Limitations**: Currently restricted to **cash-only** payments at the venue. Online checkout workflows (Stripe Integration) need completion and testing.
- **Tournament UX Polish**: Placeholder data exists in the World Cup 5s tournament standings. Needs true data mapping to the `TournamentTeam` models (handled partially by recent UI fixes).
- **View Modes Clutter**: Clarification needed for the various view modes (TikTok, Instagram, WhatsApp UI skins) on the booking page.

## Action Plan
- The API loading crash (`Could not load bookings`) is priority #1. Without court data, the primary business function fails.
- Once fixed, bind the correct `Court` count to the homepage layout variables.
- Integrate the missing Webhooks/API logic to convert the application from cash-only to fully operational online payments.
