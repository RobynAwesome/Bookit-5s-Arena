# Open Issues

## Confirmed Or Likely Follow-up Items

- homepage `/` can intermittently hit a Next dev client-manifest error on first compile
- local MongoDB Atlas SRV DNS can still fail on some networks; set `MONGODB_DIRECT_URI` locally when `MONGODB_URI` uses `mongodb+srv`
- home page and `/api/courts` now fall back to seeded court data when MongoDB is unavailable, but the connection warning will still appear in local logs
- newsletter popup subscribe now succeeds with a local JSON fallback when MongoDB is unavailable; admin newsletter campaigns still require DB-backed auth and newsletter records
- `/bookings/success` redirects guests and should be reviewed against the intended product behavior
- WhatsApp OSINT route is implemented but inactive until a dedicated RapidAPI key is configured
- Google Search74 wiring exists but remains inactive until its key is configured in the active env

## Operational Gaps

- no full authenticated manager QA pass was completed in this cycle because local sign-in still depends on a working MongoDB connection
- no full authenticated admin mutation sweep was completed in this cycle because local sign-in still depends on a working MongoDB connection
- some dynamic routes requiring seeded IDs were not smoke-tested end to end

## Resolved In Follow-up

- newsletter popup now writes guest subscriptions through `POST /api/newsletter` even during local MongoDB outages
- admin subscriber views and newsletter sends now merge DB subscribers with local fallback guest subscribers
- failed MongoDB connection attempts no longer poison the cached connection promise for the rest of the process
- seeded court data now keeps the homepage and public court API usable during local MongoDB outages
