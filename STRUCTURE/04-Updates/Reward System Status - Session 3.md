# Reward System Status - Session 3

> [!summary]
> The reward system is present, but it is not fully verified end-to-end.

## Confirmed In Code

- `app/rewards/page.jsx` exists and renders a full rewards experience.
- `app/api/rewards/route.js` exists and derives:
  - tier
  - points
  - total bookings
  - total hours
  - total spent
  - achievements
  - recent bookings
- `models/User.js` contains reward/referral fields:
  - `referralCode`
  - `referredBy`
  - `referralPoints`
  - `referralChain`

## What Looks Real

- tier progression from confirmed bookings
- booking-derived points
- booking-derived achievements like first booking, booking count, hours, courts visited, spending
- referral display UI on the rewards page

## What Is Still Partial Or Placeholder

- several achievements in the rewards API are still placeholders and always `false`
  - `shared_social`
  - `referred_teams`
  - `hosted_tournament`
  - `customized_profile`
  - `scavenger_hunt`
- perk redemption is still UX-heavy and needs data-truth verification
- referral chain UI exists, but end-to-end validation depends on `/api/referral`, which is currently in the parallel lane

## Session 3 Reward Conclusion

Status: `AMBER`

Meaning:
- the system is not missing
- the system is not fully production-verified either
- reward completion work should continue only after the parallel lane releases `app/api/referral/route.js`

## Next Reward Tasks

- [ ] verify `/api/referral` payload and mutation path
- [ ] confirm referral points are actually accumulated and persisted
- [ ] confirm referral registration flow from a new user path
- [ ] replace placeholder achievements with real tracked events or remove them
- [ ] verify manager/admin visibility into rewards and perk activity
- [ ] verify reward messaging and tier thresholds against product intent

## Files To Revisit Once Safe

- `app/rewards/page.jsx`
- `app/api/rewards/route.js`
- `app/api/referral/route.js`
- `models/User.js`
