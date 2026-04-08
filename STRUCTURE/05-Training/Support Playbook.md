# Support Playbook

## If Fixtures Look Empty

- check `KEY` or `ISPORTS_API_KEY`
- check `/api/football/league/premier-league/meta`
- check `/api/football/league/premier-league/matches`
- open `/admin/integrations` for provider status

## If News Looks Thin

- verify RSS sources are reachable
- verify YouTube RapidAPI configuration
- verify Google Search74 key if fallback discovery is expected

## If Admin Integrations Look Broken

- confirm auth role is `admin`
- confirm MongoDB session/auth is working
- verify env-backed providers in the active environment

## If Home Page Breaks In Dev

- clear `.next`
- restart `npm run dev`
- check the latest `.next-dev-phase*.log`
- watch for the intermittent Next manifest bug before assuming app logic is broken
