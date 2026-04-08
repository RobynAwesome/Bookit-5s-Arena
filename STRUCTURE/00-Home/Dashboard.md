# Bookit 5s Arena Dashboard

## What This Vault Is

This `STRUCTURE/` folder is the project handoff vault for Bookit 5s Arena. It mirrors the Schematics pattern and is tailored for this repo so the next engineer can open it in Obsidian and immediately understand:

- what has been built
- what is stable
- what is protected by auth
- what still needs work
- which phase commits introduced which systems

## Current Rollout State

- Core rollout phases `0` through `13` are complete.
- The public Premier League hub is live in the codebase under `/fixtures`.
- Admin-only sandbox and integrations surfaces are implemented.
- Security hardening and BotID protections are in place.
- The final remaining deliverable is this audit and handoff structure itself.

## Start Here

1. Read [Project Status](../04-Updates/Project%20Status.md).
2. Review [task-board](../04-Updates/task-board.md).
3. Open [4-Tier User Interface](../03-Architecture/4-Tier%20User%20Interface.md).
4. Check [Open Issues](../06-Reference/Open%20Issues.md).
5. Use [Page Inventory](../06-Reference/Page%20Inventory.md) when tracing routes.

## Completed Phase Commits

- `2ef7a3a` `phase-0-sports-foundation`
- `c62ddb0` `phase-1-matches`
- `2cf76e1` `phase-2-news-media`
- `0085edc` `phase-3-standings`
- `994eed6` `phase-4-stats`
- `5ce02b7` `phase-5-sandbox-integrations`
- `0c9c444` `phase-6-hardening`
- `85ad333` `phase-7-responsive-popup-repairs`
- `22659bb` `phase-8-expanded-fixtures-home-polish`
- `72c0bb8` `phase-9-regenerate-court-images`
- `d13807e` `phase-10-security-hardening`
- `8ef6b3d` `phase-11-botid-anti-bot-hardening`
- `a50416d` `phase-12-env-integrations-weather-search`
- `245907a` `phase-13-whatsapp-osint-admin-review`

## High-Signal Current Notes

- Local dev on `/` can intermittently hit a Next dev client-manifest bundler bug on first compile, then recover on refresh.
- The home page court query still depends on MongoDB availability; when Atlas DNS or network access fails, the server logs the error and court data falls back to empty.
- `api/newsletter` still needs a follow-up audit because the popup subscription flow and admin newsletter flows were not the focus of the final phases.
