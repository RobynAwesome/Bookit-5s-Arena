# Dev Tracker

## Recent Commits

- `245907a` `phase-13-whatsapp-osint-admin-review`
- `a50416d` `phase-12-env-integrations-weather-search`
- `8ef6b3d` `phase-11-botid-anti-bot-hardening`
- `d13807e` `phase-10-security-hardening`
- `72c0bb8` `phase-9-regenerate-court-images`
- `22659bb` `phase-8-expanded-fixtures-home-polish`
- `85ad333` `phase-7-responsive-popup-repairs`

## Verification Pattern Used

- targeted eslint on touched files
- `npm run build`
- clean dev restart when phase risk touched route/build state
- smoke checks on changed public routes

## Local Dev Notes

- port `3002` is the normal dev port
- `.next` should be cleared if Next dev starts surfacing manifest or stale build artifacts
- `.next-dev-phase*.log` files document prior debugging runs
