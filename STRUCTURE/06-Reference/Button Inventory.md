# Button Inventory

## Home

- Header mobile menu open/close: repaired in Phase 7, now viewport-safe
- Welcome popup choices: social competitions, World Cup, dismiss, do-not-show-again
- Weather location pills: new in Phase 12
- Tournament flag carousel: interactive, stoppable, prev/next controls added in Phase 8
- Support chatbot open/send/quick prompts: working, public

## Fixtures Hub

- top tab rail: `Matches`, `News`, `Standings`, `Stats`
- season switching
- match-card expansion for richer live detail
- standings re-order controls
- team analysis drawer open actions
- stats category segment controls
- news YouTube/video interaction rails

## User and Booking Flow

- login submit and Google OAuth
- registration submit
- manager registration submit
- booking slot selection and submit
- booking resend/edit actions
- profile popup reset toggles
- avatar upload and provider buttons

## Manager Flow

- squad save actions
- fixture and lineup management buttons
- tournament manager controls

## Admin Flow

- dashboard quick links
- bookings moderation actions
- competition draw generation and score updates
- rights and feature toggles
- newsletter compose, preview, schedule, duplicate, delete, send
- integrations refresh, add reactor, toggle reactor, delete reactor
- sandbox run/stop
- WhatsApp OSINT manual review submit

## Current Button Risk Areas

- newsletter action density is high and still deserves dedicated manual QA
- admin competition editors have many mutation buttons and should get a seeded walkthrough
- some legacy pages still mix action density with limited inline confirmation states
