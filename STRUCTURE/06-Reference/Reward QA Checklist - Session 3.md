# Reward QA Checklist - Session 3

## Scope

This checklist is for validating the live reward system after the overlapping referral lane is safe to touch.

## Guest

- [ ] visit `/rewards` while logged out
- [ ] confirm teaser page renders without runtime error
- [ ] confirm register/login CTAs route correctly
- [ ] confirm no reward data leaks to unauthenticated users

## User

- [ ] sign in as a standard user
- [ ] load `/api/rewards` successfully
- [ ] confirm points match confirmed bookings and hours
- [ ] confirm tier matches booking thresholds
- [ ] confirm recent bookings list is accurate
- [ ] confirm achievements unlocked from real booking history appear correctly
- [ ] confirm placeholder achievements are either implemented or intentionally hidden
- [ ] open `referrals` tab and confirm `/api/referral` returns valid data
- [ ] copy referral code and share link actions work
- [ ] register a new user using a referral path
- [ ] confirm referral points persist on the original user
- [ ] confirm referral chain depth and points are correct

## Manager

- [ ] sign in as a manager
- [ ] confirm manager-specific reward copy is accurate
- [ ] confirm manager views do not expose broken or placeholder-only perks
- [ ] confirm manager actions that should affect rewards actually do so

## Admin

- [ ] verify admin can inspect or support reward issues without manual DB surgery
- [ ] verify no admin-only reward surfaces are broken
- [ ] verify perk or reward support actions are logged/auditable where expected

## Data Truth

- [ ] compare `Booking` records against reward totals
- [ ] compare `User.referralPoints` and `User.referralChain` against displayed referral data
- [ ] confirm no negative or duplicate reward accumulation occurs

## Closeout

- [ ] document what is truly implemented
- [ ] remove or implement placeholders
- [ ] update `STRUCTURE/04-Updates/Reward System Status - Session 3.md`
