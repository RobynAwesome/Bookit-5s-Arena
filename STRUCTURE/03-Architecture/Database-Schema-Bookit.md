---
title: Fives Arena Database Schema
created: 2026-04-16
updated: 2026-04-16
author: Codex
tags:
  - architecture
  - database
  - models
  - mongodb
priority: high
status: active
---

# Bookit 5s Arena - Database Schema

> Mongoose ODM models tracking everything from user profiles to active fixtures and court availability. This schema is the absolute source of truth for the backend.

## 1. Users, Access & Audiences
- **`User.js`**: Core identity model. Handles OAuth profiles, local passwords, role-based access (`player`, `manager`, `admin`), loyalty points, and profile progression.
- **`FeatureAccess.js`**: Feature flagging system connecting logic gates for experimental rollouts to specific accounts.
- **`Newsletter.js` & `NewsletterSubscriber.js`**: Marketing broadcast models managing active subscribers and the lifecycle of outbound content campaigns.

## 2. Venues & Availability
- **`Court.js`**: Physical pitch metadata (e.g., location, lighting status, hourly rates).
- **`Booking.js`**: Transactional records for court time. Binds a `User` identity to a `Court` for a specific start and end time. Handles payment statusing (`paid`, `pending_cash`, `cancelled`).
- **`EventBooking.js`**: Specialized bookings (corporate days, birthday parties, coaching camps) that require additional operational overhead beyond standard pitch rentals.

## 3. Competitive Architecture (World Cup 5s & Leagues)
- **`TournamentTeam.js`**: World Cup 5s registration. Holds manager contact details, assigned nation, player rosters, payment validation (ZAR 3,000 POP), and real-time Group Phase standings (`mp`, `w`, `d`, `l`, `gf`, `ga`, `gd`, `pts`).
- **`Fixture.js`**: The connective tissue of the calendar. Links two teams together along with live scores (`homeScore`, `awayScore`), match status (`scheduled`, `live`, `completed`), and match day sequence logic.
- **`League.js` & `LeagueTeam.js`**: Long-running seasonal competition tracking (outside of the isolated World Cup event). Connects squads into divisions with promotion/relegation mechanics.

## 4. Analytics & Webhooks
- **`PageView.js`**: Custom real-time analytics table capturing page hits, referrer data, and session time without relying purely on Google Analytics.
- **`GoogleApiConfig.js`**: Configuration injection map for managing tight coupling constraints with external Google APIs dynamically without redeploying ENV vars.
- **`ReactorChannel.js`**: SSE (Server-Sent Events) abstraction definitions that push live match scores to the frontend.
