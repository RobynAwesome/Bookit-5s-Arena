# NOW.md — FivesArena Governed Arena Chronicle

> **Current-state authority:** repository-root `NOW.md`
> **Updated:** 2026-08-31 (SAST)
> **Constraint:** `I_AM_STATELESS_RENTER_NOT_LANDLORD`
> **Execution:** CRUD → SWFUS → BP → BMP → POCvsFOC → KPCB+
> **Branch:** `forge/kage-arena-chronicle`
> **Stacked base:** `forge/fivesarena-transaction-integration` @ `427f2a2648c1f17141edb68ff76b3a6990717eda`
> **Upstream production lineage:** `Kopano-Labs/Bookit-5s-Arena/main` @ `a014a98f53e91b99de061c48f962350a006cf154`

## PURPOSE

Evolve FivesArena without replacing its identity or weakening its booking truth.

The visual target is not a generic 3D landing page. The public experience should feel like **one football arena moving through time** while KPGS keeps commercial claims tied to evidence.

The branch is intentionally stacked on the already-proven FivesArena transaction integration so aesthetics cannot outrun the MERN booking system.

## AUDITED DESIGN LINEAGE

The following user-owned repositories were treated as first-class design evidence:

- `RobynAwesome/kage`
- `RobynAwesome/towers`
- `RobynAwesome/threeui`
- `RobynAwesome/NIGHTPASS`
- `RobynAwesome/three.js`

### Kage pattern adopted

Kage's strongest transferable grammar is:

1. one persistent full-viewport world;
2. chapters as camera/state transitions rather than unrelated page modules;
3. editorial typography and deliberate negative space;
4. fixed chapter navigation;
5. foreground/UI state that changes with the journey;
6. reduced-motion parity;
7. mobile rearrangement rather than desktop shrinking;
8. motion that carries narrative meaning rather than decorative noise.

FivesArena recreates that grammar with its own React / React Three Fiber / Three.js implementation and football geometry.

### Towers pattern adopted

- one world changes state over time;
- environment remains continuous while viewpoint and meaning change;
- mobile controls belong in thumb reach;
- the responsive experience rearranges instead of merely scaling down.

### NIGHTPASS / KPGS pattern adopted

- one authoritative dataset;
- different public projections by evidence state;
- disclosure/experience does not upgrade evidence;
- a visually successful UI is not permission to claim a transaction or live state that is unproven.

### ThreeUI / three.js role

ThreeUI and the Three.js estate were audited for component/rendering vocabulary. FivesArena does not depend on a Kage iframe or a foreign landing-page runtime. It uses its existing stack:

- `three`
- `@react-three/fiber`
- `@react-three/drei`
- React / Next.js
- MongoDB / Mongoose booking truth

## BREAKING POINTS FOUND

### BP-1 — decorative 3D without venue meaning

The previous homepage hero centered a holographic football, particle field, sparkles, rings and tech-grid effects. It demonstrated rendering capability, but the scene did not become the venue, carry booking state, or evolve with the user's task.

**BMP result:** the persistent 3D world must represent FivesArena itself: pitch, goals, stands, floodlights, touchline, ball and governed source state.

### BP-2 — homepage module accumulation

The former home composition stacked many independent animated modules: hero, fixtures, stats, weather, tournament, courts, events, about, social, media and more.

**BMP result:** the primary user journey becomes one narrative spine. Secondary surfaces may follow it, but they do not compete for first-screen authority.

### BP-3 — Court record incorrectly implied slot availability

The old court card rendered a pulsing `Available` badge for every Court document. A Court record proves inventory existence and persisted pricing; it does **not** prove that a requested time slot is open.

**BMP result:** public state now explicitly distinguishes:

- court inventory verified;
- database connected but inventory empty;
- source unavailable;
- slot availability unresolved until the court transactional boundary.

### BP-4 — competing mobile control systems

The shell rendered both `SoccerBallMenu` and `BottomNavbar`, while the Chronicle introduces its own chapter navigation.

**BMP result:** homepage has one floating navigation authority. Non-home routes retain the role-aware global controls.

### BP-5 — timed marketing interrupts the main journey

`NewsletterPopup` could cover the screen after 20 seconds.

**BMP result:** timed newsletter modal is suppressed on `/`; it remains available on other routes.

## IMPLEMENTED EXPERIENCE

### `components/experience/ArenaWorld.jsx`

One persistent React Three Fiber `Canvas` containing a procedural FivesArena world:

- five camera compositions;
- 5-a-side pitch and markings;
- goals and nets;
- stands;
- four floodlight structures;
- grounded moving match ball;
- reality beacon driven by public source state;
- FivesArena palette: black / turf green / warm floodlight amber / bone white;
- no particle cloud, Sparkles or distortion material as visual filler;
- static fallback for reduced motion / save-data;
- lighter mobile quality mode;
- camera-loop vectors are reused rather than allocated every frame;
- canvas does not intercept UI pointer input.

### `components/experience/ArenaChronicle.jsx`

Five chapters:

1. `ARRIVE` — enter FivesArena;
2. `REALITY` — state what the source actually proves;
3. `RESERVE` — choose a persisted court, then resolve slot availability;
4. `PLAY` — fixtures, tactics and venue use as adjacent football surfaces;
5. `LEGACY` — World Cup 5s 2026 remains archive/history, not current registration.

The same world persists while camera and content state change.

Desktop uses a chapter rail. Mobile uses a thumb-reachable bottom chapter control. Reduced-motion users receive the same information and navigation without forced WebGL movement.

### `lib/arena/reality.js`

Public projection state:

- `database` → `verified-source`
- `database-empty` → `database-empty`
- failed source → `unavailable`

Even for `verified-source` inventory:

`slotAvailabilityVerified = false`

That state can only graduate at the slot/booking boundary.

### Homepage composition

`app/page.jsx` now uses `ArenaChronicle` as the primary experience. Old first-class homepage imports such as the holographic hero, duplicate live-fixture/stat/weather blocks and old court section no longer orchestrate the landing flow.

Secondary venue surfaces remain after the Chronicle:

- amenities;
- events;
- about;
- social;
- media;
- contact.

### Shell continuity

`ContextualFloatingNavigation`:

- suppresses legacy floating menus on `/`;
- keeps them on all other applicable routes;
- preserves long-lived `/#courts` links by translating them to `#arena-reserve`.

`NewsletterPopup` does not open on the Chronicle homepage.

## PROOF SURFACES

### Arena contract

`npm run validate:arena-chronicle`

Proves:

- five-chapter structure;
- one persistent Canvas;
- procedural FivesArena world primitives;
- no Kage/ThreeUI landing iframe/runtime dependency;
- reduced-motion support;
- save-data fallback;
- mobile + desktop chapter navigation;
- one homepage floating-navigation authority;
- legacy `/#courts` continuity;
- no timed newsletter interruption on home;
- no homepage `Available` claim from Court inventory;
- KPGS public reality states.

### Transaction inheritance

The Chronicle workflow also re-runs:

- `validate:court-contract`
- `validate:booking-communications`
- `validate:booking-occupancy`
- real MongoDB occupancy witness
- full transaction integration witness
- production Next build

A visual change therefore cannot graduate while the booking engine is red.

## EVIDENCE RECEIPTS

### Transaction baseline

The stacked transaction branch previously proved:

`canonical court -> atomic reservation -> business visibility -> communication receipts -> later staff payment state`

with real MongoDB transaction witnesses and zero simulated-provider false `sent` receipts.

### Arena Chronicle run `33339372996`

The first corrected Chronicle code head completed successfully:

- Arena Chronicle contract: PASS
- Court source contract: PASS
- booking communications: PASS
- atomic occupancy: PASS
- locked dependency install: PASS
- MongoDB replica set: PASS
- real occupancy witness: PASS
- composed transaction witness: PASS
- production Next build: PASS

Subsequent shell/performance hardening must also pass the same workflow on its newest head before review promotion.

## POC / FOC

### Design/interaction model

`POC_IMPLEMENTED_AND_GATED`

The model has already passed one full CI/runtime proof cycle. The newest head remains subject to the same exact gate after shell/performance hardening.

### Production FOC

`NOT_YET_PRODUCTION_VALIDATED`

FOC requires evidence beyond repository/build success:

1. browser preview witness on desktop;
2. mobile witness around 390×844;
3. reduced-motion / save-data witness;
4. visual inspection that text remains readable over all five camera compositions;
5. current-source court inventory visible without false slot state;
6. real production-lineage booking witness from court selection through business visibility and communication receipts.

A green build is POC evidence. It is not a claim that the production website has already changed.

## NEXT ADMISSIBLE ACTION

1. Require latest-head Arena Chronicle CI to pass.
2. Open a stacked review against `forge/fivesarena-transaction-integration`.
3. Use preview/browser/mobile evidence to refine camera framing and typography without reintroducing module bloat.
4. After visual acceptance, retire unused legacy homepage-only hero/court components in a separate cleanup commit rather than deleting rollback/reference surfaces prematurely.
5. Keep dependency-security remediation separate from this design lane so breaking package upgrades cannot contaminate visual/transaction proof.
