---
title: User Interface Audit - Session 3
tier: user
status: active
owner: Codex Terminal
---

# User Interface Audit - Session 3

## Mission

The user interface must give authenticated players reliable self-service for profile management, bookings, rewards, courts, and support while keeping every view scoped to the current account.

## Primary Routes

- `/profile`
- `/bookings`
- `/bookings/[id]`
- `/bookings/[id]/edit`
- `/rewards`
- `/my-courts`

## Current Working State

- `GREEN` auth gates and redirects are in place.
- `GREEN` booking CRUD APIs exist.
- `GREEN` profile popup-preference controls exist.
- `GREEN` rewards page and rewards API exist.
- `AMBER` reward/referral system is implemented but not fully QA-verified.
- `AMBER` booking edit and resend flows still need authenticated walkthroughs.
- `AMBER` avatar/provider integrations still need live-provider testing.

## Known Risks

- reward placeholders still exist in the achievement set
- referral truth is implemented but not yet fully proven with real user chaining
- locally, authenticated QA still depends on Atlas allowlisting

## Critical Buttons and Mutations

- profile save
- popup reset / newsletter / communication preference toggles
- birthday reward claim
- booking create
- booking edit
- booking cancel
- booking resend
- rewards referral copy/share actions
- referral code apply

## TODO

- [ ] run full authenticated user booking sweep
- [ ] run rewards/referral end-to-end QA
- [ ] confirm birthday reward behavior is product-correct
- [ ] verify all profile toggles persist and reload correctly
- [ ] verify upload/provider paths with live envs

## QA Walkthrough

1. Log in as a normal user.
2. Visit `/profile` and save edits.
3. Toggle popup preferences and reload.
4. Create a booking.
5. Open booking detail and edit it.
6. Cancel or resend a booking.
7. Visit `/rewards` and validate overview, history, perks, and referrals.

## Ownership

Current next owner: `Codex Terminal` for reward truth/handoff docs, then authenticated QA lane once Atlas access is available.
