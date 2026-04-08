# Open Issues

## Confirmed Or Likely Follow-up Items

- homepage `/` can intermittently hit a Next dev client-manifest error on first compile
- home page court data still logs MongoDB SRV lookup failures when Atlas/network access is unavailable
- newsletter popup subscribe flow needs a dedicated end-to-end verification pass
- `/bookings/success` redirects guests and should be reviewed against the intended product behavior
- WhatsApp OSINT route is implemented but inactive until a dedicated RapidAPI key is configured
- Google Search74 wiring exists but remains inactive until its key is configured in the active env

## Operational Gaps

- no full authenticated manager QA pass was completed in this cycle
- no full authenticated admin mutation sweep was completed in this cycle
- some dynamic routes requiring seeded IDs were not smoke-tested end to end
