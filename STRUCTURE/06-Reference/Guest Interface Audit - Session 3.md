---
title: Guest Interface Audit - Session 3
tier: guest
status: active
owner: Codex Terminal
---

# Guest Interface Audit - Session 3

## Mission

The guest interface must sell the venue, allow safe discovery, and funnel users into booking, registration, fixtures, events, and support without exposing private booking or account data.

## Primary Routes

- `/`
- `/about`
- `/blog`
- `/blog/how-we-built-this`
- `/case-studies`
- `/docs/api`
- `/partners`
- `/roadmap`
- `/security`
- `/jobs`
- `/fixtures`
- `/fixtures/arena`
- `/tournament`
- `/tournament/bracket`
- `/tournament/polls`
- `/tournament/standings`
- `/tournament/stats`
- `/events`
- `/events/book`
- `/events-and-services`
- `/login`
- `/register`
- `/register/manager`
- `/bookings/success`

## Current Working State

- `GREEN` core marketing and discovery routes render.
- `GREEN` guest access is blocked correctly from user, manager, and admin pages.
- `GREEN` `/bookings/success` is intentionally guest-safe.
- `AMBER` homepage still depends on resilient court fallback when Mongo is unreachable.
- `AMBER` local dev still has an intermittent first-compile homepage issue.
- `AMBER` guest discovery pages vary in polish and action density.

## Known Risks

- stale cached court imagery on devices if service worker versions are not bumped with media changes
- guest-facing CTAs can be visually strong but still unverified end-to-end when they hand into auth or event flows
- fixtures/news/video experiences depend on external provider depth and key health

## Critical Buttons and Mutations

- home hero CTAs
- header search and menu controls
- stoppable homepage flag carousel controls
- fixtures tab rail and card interactions
- support chatbot open/send
- login and registration submits
- guest reserve path in court booking flow
- event package booking submit

## TODO

- [ ] conclusively close the intermittent homepage dev manifest issue
- [ ] QA guest reserve court flow on mobile and desktop
- [ ] QA event booking submit with real confirmation states
- [ ] tighten route-to-route consistency in guest CTAs
- [ ] keep guest pages fast on mobile after media refreshes

## QA Walkthrough

1. Land on `/` and verify hero, courts, fixtures promo, tournament, weather, footer, and popup controls.
2. Open search and mobile navigation.
3. Visit `/fixtures` and `/fixtures/arena`.
4. Visit one court detail page and attempt guest reservation.
5. Visit `/events` and `/events/book`.
6. Visit `/login`, `/register`, and `/register/manager`.

## Ownership

Current next owner: `Codex Terminal` for audit/handoff, then product lane for guest-flow QA fixes.
