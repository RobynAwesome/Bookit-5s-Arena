import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectArenaReality } from '../lib/arena/reality.js';

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const page = read('app/page.jsx');
const chronicle = read('components/experience/ArenaChronicle.jsx');
const world = read('components/experience/ArenaWorld.jsx');
const realitySource = read('lib/arena/reality.js');

assert.match(page, /ArenaChronicle/);
for (const retiredHomeImport of [
  'HeroSection',
  'HomeLiveFixtures',
  'FixturesPromo',
  'StatsBar',
  'WeatherWidget',
  'TournamentSection',
  'CourtsSection',
  'CourtAvailabilityNotice',
]) {
  assert.doesNotMatch(page, new RegExp(`import\\s+${retiredHomeImport}\\b`));
}
assert.match(page, /source:\s*'database-empty'/);
assert.match(page, /courtSource=\{courtResult\.source\}/);

const chapterNames = ['ARRIVE', 'REALITY', 'RESERVE', 'PLAY', 'LEGACY'];
for (const chapter of chapterNames) {
  assert.ok(
    chronicle.includes(`short: "${chapter}"`),
    `Arena Chronicle is missing chapter ${chapter}`,
  );
}
assert.match(chronicle, /IntersectionObserver/);
assert.match(chronicle, /useReducedMotion/);
assert.match(chronicle, /navigator\.connection\?\.saveData/);
assert.match(chronicle, /aria-label="Arena chapters"/);
assert.match(chronicle, /aria-label="Arena chapter shortcuts"/);
assert.match(chronicle, /data-kpgs-proof/);
assert.match(chronicle, /data-slot-proof="resolve-at-court"/);
assert.match(chronicle, /Court record verified/);
assert.match(chronicle, /Resolve slots/);
assert.doesNotMatch(chronicle, />\s*Available\s*</);

assert.equal((world.match(/<Canvas\b/g) || []).length, 1, 'ArenaWorld must have one persistent Canvas');
assert.match(world, /CAMERA_SHOTS/);
assert.match(world, /function ArenaStructure/);
assert.match(world, /function Goal/);
assert.match(world, /function Floodlight/);
assert.match(world, /function RealityBeacon/);
assert.match(world, /quality === "full" \? \[1, 1\.55\] : 1/);
assert.doesNotMatch(world, /Sparkles/);
assert.doesNotMatch(world, /MeshDistortMaterial/);

assert.match(realitySource, /slotAvailabilityVerified:\s*false/);
assert.doesNotMatch(realitySource, /availability\s*:\s*['"]available['"]/i);

const verified = projectArenaReality({
  courtSource: 'database',
  courts: [{ _id: 'court-1', name: 'Pitch 1' }],
  minPrice: 400,
});
assert.equal(verified.evidenceClass, 'verified-source');
assert.equal(verified.inventoryVerified, true);
assert.equal(verified.slotAvailabilityVerified, false);
assert.equal(verified.minPrice, 400);

const empty = projectArenaReality({ courtSource: 'database-empty', courts: [] });
assert.equal(empty.evidenceClass, 'database-empty');
assert.equal(empty.inventoryVerified, false);
assert.equal(empty.slotAvailabilityVerified, false);

const unavailable = projectArenaReality({ courtSource: 'unavailable', courts: [] });
assert.equal(unavailable.evidenceClass, 'unavailable');
assert.equal(unavailable.bookingMode, 'manual-verification');

for (const source of [chronicle, world]) {
  assert.doesNotMatch(source, /KageLandingPage/);
  assert.doesNotMatch(source, /TempleNightScene/);
  assert.doesNotMatch(source, /kage\.html/i);
  assert.doesNotMatch(source, /secret-pathways-assets/i);
}

console.log(JSON.stringify({
  contract: 'fivesarena-arena-chronicle',
  status: 'PASS',
  chapters: chapterNames,
  persistentCanvas: true,
  ownReactThreeImplementation: true,
  reducedMotion: true,
  saveDataFallback: true,
  courtInventoryDoesNotClaimSlotAvailability: true,
  truthStates: ['verified-source', 'database-empty', 'unavailable'],
}, null, 2));