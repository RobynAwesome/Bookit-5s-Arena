import { expect, test, type Page } from '@playwright/test';

const STAGES = [
  'TELEMETRY', 'CLASSIFICATION', 'ROUTING', 'PROTOCOL_SELECTION',
  'INVARIANT_AUDIT', 'POC_FOC_CHECK', 'STATE_UPDATE', 'DISTRIBUTION',
] as const;

function organismPayload(province = 'western-cape') {
  const labels: Record<string, string> = { 'western-cape': 'Western Cape', gauteng: 'Gauteng' };
  return {
    schema: 'fivesarena.organism.feed.v1',
    canonicalSurface: 'https://fivesarena.com',
    locality: { country: 'South Africa', province: labels[province] || 'Western Cape', provinceSlug: province, weatherLabel: 'Cape Town', source: 'user-governed-context' },
    weather: { temperature: 20, feelsLike: 20, weatherCode: 1, condition: 'Mainly Clear', emoji: '🌤️', wind: 10, humidity: 50, footballReady: true, fetchedAt: '2026-08-18T08:00:00.000Z' },
    editorial: { status: 'fallback', articles: [] },
    governance: { adapter: { configured: false, status: 'contract-only', origin: null, health: null, version: null, checkedAt: '2026-08-18T08:00:00.000Z' }, executionPolicy: 'domain-runtime-direct-with-canonical-adapter-not-promoted' },
    organs: { blog: 'https://blog.fivesarena.com', news: 'https://news.fivesarena.com', policy: 'render-inside-fivesarena-shell' },
    fetchedAt: '2026-08-18T08:00:00.000Z',
  };
}

async function mockFeed(page: Page) {
  await page.route('**/api/organism/feed?province=*', async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(organismPayload(url.searchParams.get('province') || 'western-cape')) });
  });
}

function receipt(update: Record<string, any>, disposition: 'APPLIED' | 'HELD' | 'REJECTED') {
  const decisive = disposition === 'APPLIED' ? 'PASS' : disposition === 'HELD' ? 'HOLD' : 'REJECT';
  const decisiveStage = disposition === 'APPLIED' ? 'DISTRIBUTION' : 'POC_FOC_CHECK';
  return {
    schema: 'kpgs.swfus.receipt.v1',
    receipt_id: `swfus_${'a'.repeat(24)}`,
    update_id: update.update_id,
    node_id: update.node_id,
    operation: update.operation,
    disposition,
    stages: STAGES.map((stage) => ({
      stage,
      status: stage === decisiveStage ? decisive : disposition === 'APPLIED' ? 'PASS' : STAGES.indexOf(stage) < STAGES.indexOf(decisiveStage) ? 'PASS' : 'NOT_REACHED',
      reason: stage === decisiveStage && disposition !== 'APPLIED' ? 'bounded test hold/reject' : 'test receipt',
    })),
    synchronized: disposition === 'APPLIED',
    canonical_authority_changed: false,
    state_digest: disposition === 'APPLIED' ? 'b'.repeat(64) : null,
    evidence_refs: update.evidence_refs,
    correlation_id: update.correlation_id || '',
    boundary_marker: '#NB',
    replayed: false,
    created_at: '2026-08-18T08:00:00.000Z',
  };
}

test.beforeEach(async ({ page }) => { await mockFeed(page); });

test('offline-style adapter pending keeps local preference and canonical update queued', async ({ page }) => {
  await page.route('**/api/organism/progressive-updates', (route) => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ state: 'pending', receipt: null }) }));
  await page.goto('/news');
  await page.locator('[data-province-selector="gauteng"]').click();

  await expect(page.getByTestId('progressive-update-state')).toHaveAttribute('data-progressive-state', 'pending');
  await expect(page.getByTestId('progressive-update-state')).toContainText('Saved on this device');

  const queued = await page.evaluate(() => JSON.parse(localStorage.getItem('fivesarena.progressive.locality-queue.v1') || '[]'));
  expect(queued).toHaveLength(1);
  expect(queued[0].update.schema).toBe('kpgs.progressive-update.v1');
  expect(queued[0].update.boundary_marker).toBe('#NB');
  expect(queued[0].update.authority_effect).toBe('none');
  expect(queued[0].update.state_class).toBe('non_authoritative');
  expect(queued[0].update.apu_status).toBe('UNSPECIFIED');

  await page.reload();
  await expect(page.getByTestId('current-province')).toHaveText('Gauteng');
  await expect(page.getByTestId('progressive-update-state')).toHaveAttribute('data-progressive-state', 'pending');
});

test('canonical APPLIED receipt clears queue and shows governed synchronization', async ({ page }) => {
  await page.route('**/api/organism/progressive-updates', async (route) => {
    const update = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ receipt: receipt(update, 'APPLIED') }) });
  });
  await page.goto('/news');
  await page.locator('[data-province-selector="gauteng"]').click();

  await expect(page.getByTestId('progressive-update-state')).toHaveAttribute('data-progressive-state', 'applied');
  await expect(page.getByTestId('progressive-update-state')).toContainText('governed sync applied');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('fivesarena.progressive.locality-queue.v1') || '[]').length)).toBe(0);
});

test('canonical HELD receipt remains visible and does not masquerade as transport pending', async ({ page }) => {
  await page.route('**/api/organism/progressive-updates', async (route) => {
    const update = route.request().postDataJSON();
    await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ receipt: receipt(update, 'HELD') }) });
  });
  await page.goto('/news');
  await page.locator('[data-province-selector="gauteng"]').click();

  await expect(page.getByTestId('progressive-update-state')).toHaveAttribute('data-progressive-state', 'held');
  await expect(page.getByTestId('progressive-update-state')).toContainText('held for review');
});
