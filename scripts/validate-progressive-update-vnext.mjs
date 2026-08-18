import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [contract, queue, adapter, route, hook, surface, poc, sw] = await Promise.all([
  read('lib/kpgs/progressiveUpdateContract.ts'),
  read('lib/kpgs/localityProgressiveQueue.ts'),
  read('lib/kpgs/domainAdapterClient.ts'),
  read('app/api/organism/progressive-updates/route.ts'),
  read('hooks/useArenaLocality.ts'),
  read('components/home/LivingOrganismSurface.tsx'),
  read('docs/governance/FIVESARENA_LOCALITY_PROGRESSIVE_UPDATE_POC.md'),
  read('public/sw.js'),
]);

const failures = [];
const requireText = (source, text, label) => {
  if (!source.includes(text)) failures.push(label);
};

requireText(contract, "canonicalCommit: '6eeb285d0775a7e74ceadc06e32b4068fcfbc595'", 'canonical Introduction-to-MCP pin missing');
requireText(contract, "schema: 'kpgs.progressive-update.v1'", 'canonical progressive update schema missing');
requireText(contract, "receiptSchema: 'kpgs.swfus.receipt.v1'", 'canonical receipt schema missing');
requireText(contract, "boundaryMarker: '#NB'", '#NB boundary missing');
for (const stage of ['TELEMETRY', 'CLASSIFICATION', 'ROUTING', 'PROTOCOL_SELECTION', 'INVARIANT_AUDIT', 'POC_FOC_CHECK', 'STATE_UPDATE', 'DISTRIBUTION']) {
  requireText(contract, `'${stage}'`, `canonical SWFUS stage missing: ${stage}`);
}
requireText(contract, 'canonical_authority_changed !== false', 'receipt authority containment validation missing');

requireText(queue, "apu_status: 'UNSPECIFIED'", 'APU status must not fabricate GREEN proof');
requireText(queue, 'poc_validated: true', 'bounded locality POC admission missing');
requireText(queue, 'foc_detected: false', 'FOC mutation guard missing');
requireText(queue, "authority_effect: 'none'", 'authority effect widening detected');
requireText(queue, "state_class: 'non_authoritative'", 'locality must remain non-authoritative');
requireText(queue, "boundary_marker: KPGS_PROGRESSIVE_UPDATE.boundaryMarker", 'queued update missing #NB');
requireText(queue, 'idempotency_key: updateId', 'stable retry idempotency missing');
requireText(queue, "if (receipt.disposition === 'APPLIED' && receipt.synchronized)", 'queue must only clear on canonical applied+synchronized receipt');
if (queue.includes('schema: KPGS_PROGRESSIVE_UPDATE.receiptSchema')) {
  failures.push('browser must not manufacture canonical SWFUS receipts');
}

requireText(adapter, "'/kpgs/progressive-updates'", '.NET progressive update endpoint missing');
requireText(adapter, 'isKpgsSwfusReceipt', 'adapter must validate canonical receipt');
requireText(route, "update.node_id.startsWith('fivesarena:locality:province:')", 'locality node membrane missing');
requireText(route, "update.protocol === 'FIVESARENA_LOCALITY_PREFERENCE_V1'", 'protocol membrane missing');
requireText(route, "update.state_class === 'non_authoritative'", 'state-class membrane missing');
requireText(route, "['CREATE', 'UPDATE'].includes(update.operation)", 'public pilot CRUD scope widened');
requireText(route, 'status: 202', 'adapter-unavailable queued state missing');
requireText(route, "'Cache-Control': 'no-store'", 'mutation membrane must be no-store');

requireText(hook, 'enqueueLocalityProgressiveUpdate', 'province changes are not queued');
requireText(hook, "window.addEventListener('online'", 'reconnect flush missing');
requireText(surface, 'data-testid="progressive-update-state"', 'plain-language progressive status missing');
requireText(surface, 'Saved on this device · sync pending', 'offline pending copy missing');
requireText(surface, 'Saved · governed sync applied', 'applied receipt copy missing');
requireText(surface, 'Saved locally · sync held for review', 'held receipt copy missing');

requireText(poc, 'local preference != canonical truth', 'POC authority boundary missing');
if (!sw.includes("if (request.method !== 'GET') return;")) failures.push('service worker may intercept mutation requests');
for (const path of ['/api/bookings/', '/api/payments/', '/api/auth/']) {
  if (!sw.includes(path)) failures.push(`private network-only boundary missing: ${path}`);
}

if (failures.length) {
  console.error('KPGS vNext Progressive Update adapter FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('KPGS vNext Progressive Update adapter PASS');
console.log('Browser persists preference/queue only; canonical runtime owns SWFUS receipts.');
console.log('Pinned: Introduction-to-MCP@6eeb285d0775a7e74ceadc06e32b4068fcfbc595');
