# Route Inventory

## Public Routes Verified `200` In Local Dev

- `/about`
- `/blog`
- `/blog/how-we-built-this`
- `/case-studies`
- `/creator`
- `/docs/api`
- `/events`
- `/events/add`
- `/events/book`
- `/events-and-services`
- `/fixtures`
- `/fixtures/arena`
- `/help`
- `/jobs`
- `/leagues`
- `/leagues/add`
- `/login`
- `/partners`
- `/privacy`
- `/register`
- `/register/manager`
- `/roadmap`
- `/role-select`
- `/rules-of-the-game`
- `/security`
- `/tournament`
- `/tournament/bracket`
- `/tournament/polls`
- `/tournament/standings`
- `/tournament/stats`

## Protected Routes Redirecting Guests As Expected

- `/bookings`
- `/bookings/success`
- `/manager/dashboard`
- `/manager/fixtures`
- `/manager/squad`
- `/my-courts`
- `/profile`
- `/rewards`
- `/rules`
- `/tournament/manager`
- `/admin/dashboard`
- `/admin/integrations`
- `/admin/sandbox`
- `/admin/bookings`

## Special Notes

- `/` was seen as `500` once during the audit because of a Next dev client-manifest issue, then returned `200` on a direct follow-up request.
- Dynamic parameter routes such as `/bookings/[id]`, `/courts/[id]`, and `/admin/competitions/league/[leagueId]` were not mass-smoked because they require seeded IDs.
