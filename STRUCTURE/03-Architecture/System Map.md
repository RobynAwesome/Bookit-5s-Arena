# System Map

## Main Code Areas

- `app/`: App Router pages and API routes
- `components/`: public UI, manager UI, admin UI, fixtures, tournament, home sections
- `lib/`: adapters, runtime cache, integrations, roles, security, media, sports
- `models/`: MongoDB/Mongoose models
- `public/`: static assets, including regenerated court images
- `STRUCTURE/`: this handoff vault

## High-Value Runtime Layers

- `lib/sports/*`: football data normalization and league hub support
- `lib/media/*`: RSS, OG enrichment, YouTube reactors
- `lib/integrations/*`: sandbox, provider health, AI Gateway, Braintrust, Mux, BallDontLie, WhatsApp OSINT
- `lib/security/*`: BotID routing and verification helpers
- `lib/runtimeCache.js`: lightweight in-memory adapter cache by namespace

## Public Experience Entry Points

- `/`: venue landing page
- `/fixtures`: Premier League hub
- `/fixtures/arena`: local arena fixtures experience
- `/tournament/*`: tournament public surfaces
- `/bookings`, `/events`, `/leagues`: venue conversion flows
