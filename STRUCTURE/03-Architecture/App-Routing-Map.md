---
title: Fives Arena App Routing Map
created: 2026-04-16
updated: 2026-04-16
author: Codex
tags:
  - architecture
  - NextJS
  - routing
priority: high
status: active
---

# Bookit 5s Arena - App Routing Map

> This document maps all the primary routes within the Next.js `app` directory for the **Bookit 5s Arena** platform. It aligns with the "Website Pages" and "Platform Implementation" tracks on Monday.com.

## Core Navigation
- **`/` (Home)**: The main landing page, marketing showcase, and court booking quick-access.
- **`/about`**: Our mission, team bios, and organizational history.
- **`/courts`**: The primary interface for booking 5-a-side pitches (`/book`).
- **`/events-and-services`**: Expanded offerings (birthdays, corporate, coaching).
- **`/rules-of-the-game`**: Official 5aSide rules and regulations.

## Auth & Profiling
- **`/login` & `/register`**: NextAuth protected routes for User, Manager, and Admin authentication.
- **`/role-select`**: Intermediary step assigning precise permissions based on verification.
- **`/profile`**: Player portal (avatar, stats).
- **`/rewards`**: Tier-based loyalty system and gamification surface for frequent players.
- **`/bookings`**: User-facing historical and upcoming court reservations.

## Tournament & Competitions
- **`/tournament`**: The central World Cup 5s registration and info hub.
- **`/fixtures`**: Live scores and upcoming match timelines (Public & Real-time via SSE).
- **`/leagues`**: Long-term league standings, divisions, and team tracking.
- **`/manager`**: Restricted zone.
  - `/manager/dashboard`: Manager headquarters.
  - `/manager/squad`: Team roster management.
  - `/manager/fixtures`: Immediate opponent views.

## Admin Command Center
- **`/admin`**: Role-gated (`admin`) root.
- **`/admin/dashboard`**: High-level statistical aggregates and system health.
- **`/admin/bookings`**: Complete financial and calendar block oversight.
- **`/admin/competitions`**: League generation, score pushing, and fixture locking.
- **`/admin/analytics`**: Page views and engagement metrics.
- **`/admin/newsletter`**: Broadcast orchestration and content publishing.
- **`/admin/rights`**: Role audits and elevation (Promoting players to Managers/Admins).

## Ecosystem & Legal
- **`/docs` & `/help`**: User manuals and AI support fallback.
- **`/privacy` & `/security`**: T&Cs and legal compliance.
- **`/blog` & `/case-studies`**: SEO growth vectors.
