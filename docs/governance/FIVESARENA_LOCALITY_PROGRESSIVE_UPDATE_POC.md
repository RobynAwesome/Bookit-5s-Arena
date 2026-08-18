# Five's Arena Locality Progressive Update POC

Status: **bounded downstream adapter POC**

Canonical contract: `RobynAwesome/Introduction-to-MCP@6eeb285d0775a7e74ceadc06e32b4068fcfbc595` → `governance/kpgs-vnext/progressive-updates/progressive-update.schema.json`.

## Claim

A user's province choice may be persisted immediately on that device and submitted as a **non-authoritative progressive update** without granting the browser, transport, SWFUS, or the chosen province any canonical business authority.

The user-visible preference already drives the merged living-organism PWA (province weather/editorial/adaptive rendering). This POC adds governed synchronization around that existing preference; it does not redesign the experience.

## Admitted surface

Only:

`fivesarena:locality:province:<device-client-id>`

Lane: `arena.public-state`  
Context route: `fivesarena.locality`  
Protocol: `FIVESARENA_LOCALITY_PREFERENCE_V1`  
State class: `non_authoritative`  
Authority effect: `none`  
Boundary marker: `#NB`

## Evidence for mutation admission

- merged province-aware living-organism implementation on `main`;
- explicit user selection through the existing province selector or device-nearest action;
- CI/mobile proof that province choice changes the bounded presentation state without entering booking/auth/payment mutation surfaces.

Therefore `poc_validated=true` means only: **this non-authoritative preference mutation path has a bounded implementation/test contract**. It does not mean the selected province is verified identity, location truth, account truth, or constitutional/canonical state.

## Offline boundary

The browser may save the presentation preference and queue the progressive update while offline. That local save is not a SWFUS receipt.

Only the canonical adapter/runtime may return `kpgs.swfus.receipt.v1` with `APPLIED | OBSERVED | HELD | REJECTED` and the eight canonical stage receipts.

## Excluded surfaces

Bookings, auth/session, payments, account/profile authority, team ownership, provider state, production promotion, and canonical estate governance are excluded.

`availability != authority`  
`synchronization != authority`  
`local preference != canonical truth`
