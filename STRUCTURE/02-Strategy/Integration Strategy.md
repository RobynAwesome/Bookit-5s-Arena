# Integration Strategy

## Sports and Media

- `iSports` is the main football data source.
- `YouTube RapidAPI` enriches reactor and topical football content.
- `Google Search74` is wired as a fallback discovery layer for article enrichment.
- `Open-Meteo` powers featured weather locations.

## Admin and Ops

- `Vercel Sandbox` is admin-only.
- `Vercel AI Gateway` is integrated as a monitored provider surface.
- `Braintrust` is integrated for lightweight operational event logging.
- `Mux` is integrated as a monitored media surface.
- `BallDontLie` is integrated as an optional multi-sport expansion signal.
- `WhatsApp OSINT` is restricted to manual admin review only.

## Core System

- `MongoDB` and `NextAuth` are treated as first-class health surfaces in the admin integrations view.
- Route protection is enforced in middleware for privileged areas.
- BotID protects key form and abuse-prone routes.
