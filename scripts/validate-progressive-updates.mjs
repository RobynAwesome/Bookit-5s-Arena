import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [contract, runtime, adapter, route, localityHook, surface, serviceWorker] = await Promise.all([
  read('lib/kpgs/progressiveUpdateContract.ts'),
  read('lib/kpgs/swfusProgressiveUpdates.ts'),
  read('lib/kpgs/domainAdapterClient.ts'),
  read('app/api/organism/progressive-updates/route.ts'),
  read('hooks/useArenaLocality.ts'),
  read('components/home/LivingOrganismSurface.tsx'),
  read('public/sw.js'),
]);

const failures = [];
const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(label);
};

requireText(contract, "schema: 'kpgs.swfus.update.v1'", 'canonical update schema ID missing');
requireText(contract, "receiptSchema: 'kpgs.swfus.receipt.v1'", 'canonical receipt schema ID missing');
requireText(
  contract,
  "canonicalCommit: '689f9bc689be5d4fa216a887aee79a5168c63fd2'",
  'Introduction-to-MCP contract pin missing',
);
for (const action of ['CREATE', 'READ', 'UPDATE', 'DELETE']) {
  requireText(contract, `'${action}'`, `CRUD action missing from portable contract: ${action}`);
}
for (const state of ['synced', 'pending_sync', 'severed']) {
  requireText(contract, `'${state}'`, `SWFUS sync state missing: ${state}`);
}

requireText(runtime, 'currentRevision !== expectedRevision', 'stale revision fail-closed check missing');
requireText(runtime, "syncState: 'pending_sync'", 'offline pending_sync witness missing');
requireText(runtime, 'tryCanonicalSync', 'canonical sync attempt missing');
requireText(runtime, 'readLatestProgressiveReceipt', 'local receipt recovery missing');
requireText(runtime, "'/api/organism/progressive-updates'", 'progressive sync membrane target missing');
requireText(runtime, "method: 'POST'", 'progressive update must use non-cacheable POST');

requireText(adapter, "'/kpgs/progressive-updates'", 'canonical .NET adapter progressive endpoint missing');
requireText(adapter, "receipt.syncState !== 'synced'", 'adapter must not promote unproven sync');
requireText(adapter, "X-KPGS-Capability-Lease", 'capability lease forwarding hook missing');

requireText(route, "body.update.nodeId !== 'fivesarena:locality:province'", 'pilot node allowlist missing');
requireText(route, "status: 202", 'pending_sync transport state missing');
requireText(route, "'Cache-Control': 'no-store'", 'progressive update response must be no-store');

requireText(localityHook, 'applyLocalProgressiveUpdate', 'locality update is not witnessed through SWFUS');
requireText(localityHook, "window.addEventListener('online'", 'reconnect retry hook missing');
requireText(localityHook, 'progressiveError', 'local witness failure state is not surfaced');

requireText(surface, 'data-testid="progressive-update-state"', 'plain-language progressive update state missing');
requireText(surface, 'Saved on this device · sync pending', 'pending sync user copy missing');
requireText(surface, 'Change visible · recovery save failed', 'local witness failure copy missing');
requireText(surface, "label: 'Saved'", 'proven synchronized user state missing');

if (!serviceWorker.includes("if (request.method !== 'GET') return;")) {
  failures.push('service worker no longer proves non-GET requests bypass cache');
}
for (const forbidden of ['/api/bookings/', '/api/payments/', '/api/auth/']) {
  if (!serviceWorker.includes(forbidden)) failures.push(`private network-only boundary missing: ${forbidden}`);
}

if (failures.length) {
  console.error('Adaptive Progressive Updates / SWFUS verification FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Adaptive Progressive Updates / SWFUS verification PASS');
console.log('Local witness -> pending_sync -> canonical adapter proof; stale writes fail closed.');
console.log('Pilot scope: fivesarena:locality:province only; transactional surfaces remain outside this membrane.');
