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
- `app/api/referral/route.js` already implements:
  - `GET` for current user referral state
  - `POST` to apply a referral code
  - 5-level referral point propagation
  - self-referral and duplicate-referral guards

## What Looks Real

- tier progression from confirmed bookings
- booking-derived points
- booking-derived achievements like first booking, booking count, hours, courts visited, spending
- referral display UI on the rewards page
- referral code application and upstream chain awarding logic

## What Is Still Partial Or Placeholder

- several achievements in the rewards API are still placeholders and always `false`
  - `shared_social`
  - `referred_teams`
  - `hosted_tournament`
  - `customized_profile`
  - `scavenger_hunt`
- perk redemption is still UX-heavy and needs data-truth verification
- manager-facing reward experience is inconsistent:
  - `/rewards` adapts copy for managers
  - `app/manager/dashboard/page.jsx` still says rewards/profile management is "coming soon"
- birthday claim currently increases `referralPoints`, which may be intentional or may be mixing loyalty and referral ledgers
- referral chain UI exists, but end-to-end validation still depends on authenticated flow testing and the parallel lane is touching the referral route right now

## Session 3 Reward Conclusion

Status: `AMBER`

Meaning:
- the system is not missing
- the system is not fully production-verified either
- reward completion work should continue only after the parallel lane releases `app/api/referral/route.js`

## Next Reward Tasks

- [ ] verify `/api/referral` payload and mutation path with real users
- [ ] confirm referral points are actually accumulated and persisted
- [ ] confirm referral registration flow from a new user path
- [ ] replace placeholder achievements with real tracked events or remove them
- [ ] verify manager/admin visibility into rewards and perk activity
- [ ] verify reward messaging and tier thresholds against product intent
- [ ] confirm whether birthday rewards should land in `referralPoints` or a separate rewards ledger
- [ ] reconcile manager dashboard wording with the existing rewards implementation

## Files To Revisit Once Safe

- `app/rewards/page.jsx`
- `app/api/rewards/route.js`
- `app/api/referral/route.js`
- `models/User.js`
