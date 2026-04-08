# Owner Handoff

## What To Watch First

- open `/admin/integrations` and confirm provider health
- open `/fixtures` and `/fixtures/arena`
- verify `/profile` popup controls after logging in
- verify `/admin/sandbox` if Vercel credentials are present

## What Needs Credentials To Show Full Value

- Google Search74
- WhatsApp OSINT
- YouTube RapidAPI if not present in the active environment
- MongoDB if local network access to Atlas is restricted

## What The Next Engineer Should Not Remove

- `lib/sports/*` adapters
- `lib/media/*` enrichment layer
- `lib/integrations/*` health modules
- `middleware.js` route protection
- `lib/security/botid.js` and `instrumentation-client.ts`
- the `STRUCTURE/` vault itself
