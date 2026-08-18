import { expect, test, type Page } from '@playwright/test';

function organismPayload(province = 'western-cape') {
  const labels: Record<string, string> = {
    'western-cape': 'Western Cape',
    gauteng: 'Gauteng',
  };
  return {
    schema: 'fivesarena.organism.feed.v1',
    canonicalSurface: 'https://fivesarena.com',
    locality: {
      country: 'South Africa',
      province: labels[province] || 'Western Cape',
      provinceSlug: province,
      weatherLabel: province === 'gauteng' ? 'Johannesburg' : 'Cape Town',
      source: 'user-governed-context',
    },
    weather: {
      temperature: 20,
      feelsLike: 20,
      weatherCode: 1,
      condition: 'Mainly Clear',
      emoji: '🌤️',
      wind: 10,
      humidity: 50,
      footballReady: true,
      fetchedAt: '2026-08-18T08:00:00.000Z',
    },
    editorial: { status: 'fallback', articles: [] },
    governance: {
      adapter: {
        configured: false,
        status: 'contract-only',
        origin: null,
        health: null,
        version: null,
        checkedAt: '2026-08-18T08:00:00.000Z',
      },
      executionPolicy: 'domain-runtime-direct-with-canonical-adapter-not-promoted',
    },
    organs: {
      blog: 'https://blog.fivesarena.com',
      news: 'https://news.fivesarena.com',
      policy: 'render-inside-fivesarena-shell',
    },
    fetchedAt: '2026-08-18T08:00:00.000Z',
  };
}

async function mockFeed(page: Page) {
  await page.route('**/api/organism/feed?province=*', async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(organismPayload(url.searchParams.get('province') || 'western-cape')),
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockFeed(page);
});

test('pending local witness is visible and survives reload when canonical sync is unavailable', async ({ page }) => {
  await page.route('**/api/organism/progressive-updates', async (route) => {
    const body = route.request().postDataJSON() as { localReceipt: unknown };
    await route.fulfill({
      status: 202,
      contentType: 'application/json',
      body: JSON.stringify({
        schema: 'fivesarena.progressive-update-sync.v1',
        state: 'pending_sync',
        receipt: body.localReceipt,
      }),
    });
  });

  await page.goto('/news');
  await page.locator('[data-province-selector="gauteng"]').click();

  const status = page.getByTestId('progressive-update-state');
  await expect(status).toHaveAttribute('data-sync-state', 'pending_sync');
  await expect(status).toContainText('Saved on this device');

  await page.reload();
  await expect(page.getByTestId('progressive-update-state')).toHaveAttribute(
    'data-sync-state',
    'pending_sync',
  );
});

test('canonical severed receipt is shown as rejection rather than transport pending', async ({ page }) => {
  await page.route('**/api/organism/progressive-updates', async (route) => {
    const body = route.request().postDataJSON() as {
      update: {
        nodeId: string;
        action: 'CREATE' | 'UPDATE';
        correlationId: string | null;
        capabilityLeaseId: string | null;
      };
    };
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({
        schema: 'fivesarena.progressive-update-sync.v1',
        state: 'severed',
        receipt: {
          schema: 'kpgs.swfus.receipt.v1',
          nodeId: body.update.nodeId,
          requestedAction: body.update.action,
          resolvedAction: body.update.action,
          accepted: false,
          stage: 'fluid_vectoring',
          syncState: 'severed',
          revision: 7,
          correlationId: body.update.correlationId,
          capabilityLeaseId: body.update.capabilityLeaseId,
          evidenceHash: 'a'.repeat(64),
          reason: 'revision conflict: canonical witness is newer',
          observedAt: '2026-08-18T08:00:00.000Z',
        },
      }),
    });
  });

  await page.goto('/news');
  await page.locator('[data-province-selector="gauteng"]').click();

  const status = page.getByTestId('progressive-update-state');
  await expect(status).toHaveAttribute('data-sync-state', 'severed');
  await expect(status).toContainText('Could not save');
  await expect(status).toHaveAttribute('title', /revision conflict/i);
});
