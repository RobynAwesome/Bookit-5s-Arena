import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classifyDataTruth } from '../lib/apwa/dataTruth';
import { getExperienceProfile } from '../lib/apwa/runtime';
import { simulateBall } from '../lib/apwa/physics';

const sw = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
for (const forbidden of ['/api/auth/', '/api/admin/', '/api/bookings/', '/api/payments/', '/api/checkout/']) {
  assert(sw.includes(forbidden), `service worker must explicitly exclude ${forbidden}`);
}
assert(sw.includes("url.pathname.startsWith('/api/')"), 'arbitrary API responses must bypass cache');
assert(sw.includes('truthState: \'unavailable\''), 'offline football miss must disclose unavailable truth state');

const observedAt = new Date('2026-08-16T20:00:00.000Z');
assert.equal(classifyDataTruth({ data: { ok: true }, observedAt, sourceTimestamp: '2026-08-16T19:59:00Z', source: 'test' }).state, 'live');
assert.equal(classifyDataTruth({ data: { ok: true }, observedAt, sourceTimestamp: '2026-08-16T19:50:00Z', source: 'test' }).state, 'delayed');
assert.equal(classifyDataTruth({ data: { ok: true }, observedAt, sourceTimestamp: '2026-08-16T19:00:00Z', source: 'test' }).state, 'stale');
assert.equal(classifyDataTruth({ data: null, observedAt, sourceTimestamp: null, source: 'test' }).state, 'unavailable');

const staticProfile = getExperienceProfile({
  reducedMotion: true,
  saveData: false,
  effectiveType: '4g',
  deviceMemoryGb: 8,
  hardwareConcurrency: 8,
  webgl: true,
  visible: true,
});
assert.equal(staticProfile.tier, 'static');
assert.equal(staticProfile.runThreeJs, false);
assert.equal(staticProfile.runPhysics, false);

const fullProfile = getExperienceProfile({
  reducedMotion: false,
  saveData: false,
  effectiveType: '4g',
  deviceMemoryGb: 8,
  hardwareConcurrency: 8,
  webgl: true,
  visible: true,
});
assert.equal(fullProfile.tier, 'full');
assert.equal(fullProfile.runPhysics, true);

const initial = { x: 0, y: 0, vx: 2.4, vy: 1.3 };
const witnessA = simulateBall(initial, 600);
const witnessB = simulateBall(initial, 600);
assert.deepEqual(witnessA, witnessB, 'fixed-step simulation must be deterministic');
assert(Number.isFinite(witnessA.x) && Number.isFinite(witnessA.y), 'physics witness must remain finite');

const route = await readFile(new URL('../app/labs/apwa-proof/page.tsx', import.meta.url), 'utf8');
assert(route.includes('AdaptiveMatchWorld'), 'public APWA proof route must render the isolated adaptive world');

console.log(JSON.stringify({
  apwa: 'PASS',
  serviceWorkerPrivacy: 'PASS',
  dataTruth: 'PASS',
  adaptiveFallback: 'PASS',
  deterministicPhysics: 'PASS',
  witness: witnessA,
}, null, 2));
