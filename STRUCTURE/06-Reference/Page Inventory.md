# Page Inventory

## Guest-Facing Marketing and Discovery

| Route | Purpose | Current Status | Improvement Note |
| --- | --- | --- | --- |
| `/` | landing page | intermittent local dev issue, otherwise live | isolate the Next dev manifest failure and keep court data resilient |
| `/about` | venue/about narrative | verified `200` | minor content polish only |
| `/blog` | content hub | verified `200` | add more editorial depth later |
| `/blog/how-we-built-this` | build story | verified `200` | none urgent |
| `/case-studies` | trust/content page | verified `200` | CTA can be expanded |
| `/docs/api` | docs page | verified `200` | keep synced with real APIs |
| `/partners` | partnerships | verified `200` | disabled buttons suggest pending partner onboarding |
| `/roadmap` | roadmap page | verified `200` | should be updated to reflect shipped fixtures hub work |
| `/security` | trust/security page | verified `200` | add newer BotID and sandbox notes |
| `/jobs` | roles/careers | verified `200` | real application flow still worth expanding |

## Fixtures and Competition

| Route | Purpose | Current Status | Improvement Note |
| --- | --- | --- | --- |
| `/fixtures` | Premier League hub | verified `200` | production keys determine depth of news/search enrichment |
| `/fixtures/arena` | local fixtures and global live board | verified `200` | continue visual polish and data QA |
| `/tournament` | tournament landing | verified `200` | auth-path cross-links should be reviewed with seeded data |
| `/tournament/bracket` | bracket page | verified `200` | seed-data QA recommended |
| `/tournament/polls` | polls | verified `200` | content cadence review |
| `/tournament/standings` | standings page | verified `200` | keep aligned with admin edits |
| `/tournament/stats` | tournament stats | verified `200` | deeper data QA needed |
| `/tournament/manager` | manager tournament tools | guest redirect `307` | authenticated regression pass still needed |

## Booking and User Surfaces

| Route | Purpose | Current Status | Improvement Note |
| --- | --- | --- | --- |
| `/login` | auth entry | verified `200` | Google provider depends on active env configuration |
| `/register` | user registration | verified `200` | smoke with fresh account still worthwhile |
| `/register/manager` | manager registration | verified `200` | form QA with real submissions |
| `/profile` | user profile | guest redirect `307` | authenticated avatar/provider QA still needed |
| `/bookings` | booking flow | guest redirect `307` | auth/user QA required |
| `/bookings/success` | booking success | guest redirect `307` | confirm intended guest behavior |
| `/my-courts` | court ownership view | guest redirect `307` | authenticated role coverage needed |
| `/rewards` | rewards view | guest redirect `307` | reward earn/redeem QA needed |

## Events and Leagues

| Route | Purpose | Current Status | Improvement Note |
| --- | --- | --- | --- |
| `/events` | events catalogue | verified `200` | package selection QA with real submissions |
| `/events/add` | add event | verified `200` | confirm whether this should stay public |
| `/events/book` | event booking | verified `200` | full submit flow QA needed |
| `/events-and-services` | services page | verified `200` | copy/design polish only |
| `/leagues` | leagues landing | verified `200` | data source polish and seeded content |
| `/leagues/add` | create league | verified `200` | confirm intended permission model |

## Manager and Admin

| Route | Purpose | Current Status | Improvement Note |
| --- | --- | --- | --- |
| `/manager/dashboard` | manager home | guest redirect `307` | authenticated smoke needed |
| `/manager/fixtures` | manager fixture tools | guest redirect `307` | authenticated smoke needed |
| `/manager/squad` | manager squad tools | guest redirect `307` | authenticated smoke needed |
| `/admin/dashboard` | admin overview | guest redirect `307` | seeded-data QA needed |
| `/admin/bookings` | booking operations | guest redirect `307` | mutation QA needed |
| `/admin/integrations` | provider health and reactors | guest redirect `307` | now a key ops page |
| `/admin/sandbox` | sandbox console | guest redirect `307` | verify with live Vercel auth in target env |
