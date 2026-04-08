# Security Hardening Strategy

## What Was Added

- Route gating in `middleware.js` for user, manager, and admin surfaces
- normalized super-admin email checks
- stricter headers in `next.config.ts`
- image magic-byte validation on profile upload
- disabled fake OAuth upload flows when provider IDs are absent
- safer IP extraction for chat rate limiting
- BotID protection on registration, bookings, events, support, and chat
- admin-only sandbox
- admin-only WhatsApp OSINT lookup with rate limits and hashed telemetry

## Remaining Security Follow-up

- verify newsletter subscription route behavior end to end
- audit every admin mutation route for structured audit logging parity
- add stronger signed-action or CSRF review for the highest-impact admin write routes
- decide whether to move more abuse-prone writes behind server actions or signed nonces
