# Open Issues

## Confirmed Or Likely Follow-up Items

- homepage `/` can intermittently hit a Next dev client-manifest error on first compile
- local MongoDB now auto-falls back from Atlas SRV to a derived direct connection path; `MONGODB_DIRECT_URI` remains optional if you want to pin a manual direct URI
- MongoDB local access is now past SRV resolution, but Atlas is rejecting this machine at the network layer; add the current IP to the Atlas allowlist before running authenticated local QA
- home page and `/api/courts` now fall back to seeded court data when MongoDB is unavailable, but the connection warning will still appear in local logs
- newsletter popup subscribe now succeeds with a local JSON fallback when MongoDB is unavailable; admin newsletter campaigns still require DB-backed auth and newsletter records
- `/bookings/success` no longer redirects guests, but it still needs an end-to-end live payment verification pass so guest, user, manager, and admin handoff states are validated against real checkout completion
- WhatsApp OSINT env lookup is wired, but the current RapidAPI account returns `403` and is not subscribed to the WhatsApp OSINT API
- Google Search74 env lookup is wired, but the current RapidAPI account returns `403` for Google Search74 and needs an active subscription/key with access

## Operational Gaps

- no full authenticated manager QA pass was completed in this cycle because local sign-in is still blocked by Atlas IP allowlisting for this machine
- no full authenticated admin mutation sweep was completed in this cycle because local sign-in is still blocked by Atlas IP allowlisting for this machine
- no full cross-tier checkout success QA pass was completed in this cycle because local auth and Stripe verification are not both available end to end on this machine
- some dynamic routes requiring seeded IDs were not smoke-tested end to end

## Resolved In Follow-up

- newsletter popup now writes guest subscriptions through `POST /api/newsletter` even during local MongoDB outages
- admin subscriber views and newsletter sends now merge DB subscribers with local fallback guest subscribers
- failed MongoDB connection attempts no longer poison the cached connection promise for the rest of the process
- seeded court data now keeps the homepage and public court API usable during local MongoDB outages
- malformed `NEXTAUTH_URL` values with embedded newline characters are now sanitized before being used in sitemap, robots, RSS, email, Stripe, and referral links
- `/bookings/success` is now guest-accessible and role-aware so Guest, User, Manager, and Admin users are returned to the correct interface after confirmation
