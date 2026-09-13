## 2026-06-05 — Ecosystem route alignment

- Added a Kopano-Phu ecosystem section to the Five's Arena home page and footer so the venue now routes visibly to KRRababalela, Kopano Labs, KasiLink, the 5s Arena Blog, Starfall Salvage, and reserved Kopano Context.
- This pass kept the football product identity intact while correcting the wider public graph.
- Verification state: `npm run build` PASS after clearing generated build artifacts that had filled drive `C:`.

## 2026-09-05 — Fixtures System Modernization & Architectural Hardening

- **Scope:** Full repository and UI/UX modernization of the Bookit 5s Arena fixtures system (`/fixtures`, `/fixtures/arena`, and home live widgets).
- **Theme Harmonization:** Refactored `PremierLeagueFixturesHub.jsx` into the unified dark sports-glassmorphic design system (`bg-zinc-950/80`, neon emerald/gold accents, translucent cards), eliminating contrast clashes across leagues.
- **Mobile Responsiveness & Accessibility:** Fixed `StandingsTable` horizontal clipping on mobile with `overflow-x-auto`, made `TabBar` horizontally scrollable, bumped muted text contrast to pass WCAG AA (>7:1), added accessible `<abbr>` tooltips, added Escape handlers, and made `LeagueOnboardingModal` skippable.
- **Data Layer & Caching:** Eliminated N+1 event query loop in `football.js` (from 20 parallel calls to active-live only), added Edge CDN `Cache-Control` headers (`s-maxage=30, stale-while-revalidate=120`), and integrated Kopano IndexedDB Vault hydration and `VaultFreshnessRibbon` into the Premier League hub.
- **Client Polling & Dynamic Bundling:** Optimized `HomeLiveFixtures.jsx` with Page Visibility API guards, and dynamically code-split fixture hubs with `next/dynamic` in `app/fixtures/page.jsx`.
- **Verification:** `npm run validate:fixtures-vault` (PASS), `npm run fixtures:health-check` (PASS, 6/6 checks OK).

