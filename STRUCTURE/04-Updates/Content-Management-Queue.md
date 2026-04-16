---
title: Content Management Queue
created: 2026-04-16
updated: 2026-04-16
author: Codex
tags:
  - content
  - updates
  - monday.com
priority: high
status: active
---

# Content Management Queue

> Source of Truth: Monday.com `Content Updates` Board
> Link: `https://rkholofelos-team.monday.com/workspaces/6105163/content-management`

This document reflects the immediate content needs for the Bookit 5s Arena platform to keep the codebase perfectly aligned with the live business operations tracks.

## Immediate Pipeline

| Group | Item Name | Status | Due Date | Target Page | Notes / Requirements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Competitions & Tournament** | Write Tournament Registration Guide | To Do | Apr 15 | `/tournament` | Clear step-by-step instructions: how to register a team, payment methods (ZAR 3,000 POP), cutoff deadlines. |
| **About Page** | Expand Team Bios | To Do | Apr 20 | `/about` | Add 2-3 sentences to round out the back-office and referee profiles for trust acquisition. |

## Strategy Protocol
- Code implementation for the **Tournament Registration Guide** should leverage existing modern UI components (e.g., `Framer Motion` lists) directly inside `app/tournament/page.jsx` or as an imported component.
- The **Team Bios** component should be mapped statically (or eventually via a mini-CMS dashboard feature) inside `app/about/page.jsx`.

## Execution Alignment
Before transitioning these items from `To Do` to `In Progress` within the Monday board (or marking the commit as `Closes Content-Updates`), the Lead Dev must ensure mobile responsiveness is strictly tested—no text clamping or overflowing containers allowed on the `sm` breakpoint.
