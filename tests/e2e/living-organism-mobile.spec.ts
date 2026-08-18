import { expect, test, type Page } from '@playwright/test';

function organismPayload(province = 'western-cape') {
  const labels: Record<string, string> = {
    'western-cape': 'Western Cape',
    gauteng: 'Gauteng',
    limpopo: 'Limpopo',
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
      temperature: province === 'gauteng' ? 22 : 17,
      feelsLike: province === 'gauteng' ? 22 : 16,
      weatherCode: 1,
      condition: 'Mainly Clear',
      emoji: '🌤️',
      wind: 12,
      humidity: 58,
      footballReady: true,
      fetchedAt: '2026-08-18T05:20:00.000Z',
    },
    editorial: {
      status: 'fallback',
      articles: [
        {
          title: `${labels[province] || 'Western Cape'} football pulse`,
          summary: 'Locality-bound South African football intelligence.',
          publisher: 'South Africa football feed',
          localityScore: 2,
        },
      ],
    },
    governance: {
      adapter: {
        configured: false,
        status: 'contract-only',
        origin: null,
        health: null,
        version: null,
        checkedAt: '2026-08-18T05:20:00.000Z',
      },
      executionPolicy: 'domain-runtime-direct-with-canonical-adapter-not-promoted',
    },
    organs: {
      blog: 'https://blog.fivesarena.com',
      news: 'https://news.fivesarena.com',
      policy: 'render-inside-fivesarena-shell',
    },
    fetchedAt: '2026-08-18T05:20:00.000Z',
  };
}

async function mockOrganismFeed(page: Page) {
  await page.route('**/api/organism/feed?province=*', async (route) => {
    const url = new URL(route.request().url());
    const province = url.searchParams.get('province') || 'western-cape';
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(organismPayload(province)),
    });
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    body: document.body.scrollWidth,
    document: document.documentElement.scrollWidth,
  }));

  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.document).toBeLessThanOrEqual(overflow.viewport + 1);
}

test.beforeEach(async ({ page }) => {
  await mockOrganismFeed(page);
});

test('province state drives weather and editorial surface without leaving the shell', async ({ page }) => {
  await page.goto('/news');

  const organism = page.getByTestId('living-organism');
  await expect(organism).toBeVisible();
  await expect(organism).toHaveAttribute('data-province', 'western-cape');
  await expect(page.getByTestId('current-province')).toHaveText('Western Cape');
  await expect(page.getByText('Western Cape football pulse')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('kpgs-adapter-state')).toHaveAttribute(
    'data-adapter-status',
    'contract-only',
  );

  const gautengResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/organism/feed?province=gauteng') &&
      response.status() === 200,
  );
  await page.locator('[data-province-selector="gauteng"]').click();
  await gautengResponse;

  await expect(organism).toHaveAttribute('data-province', 'gauteng');
  await expect(page.getByTestId('current-province')).toHaveText('Gauteng');
  await expect(page.getByText('Gauteng football pulse')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/\/news$/);
  await expectNoHorizontalOverflow(page);
});

test('province choice becomes a revisioned SWFUS local witness and survives reload', async ({ page }) => {
  await page.goto('/news');

  await page.locator('[data-province-selector="gauteng"]').click();

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const witnesses = JSON.parse(
          window.localStorage.getItem('fivesarena.swfus.witnesses.v1') || '{}',
        ) as Record<string, { revision?: number; data?: { provinceSlug?: string } }>;
        const receipts = JSON.parse(
          window.localStorage.getItem('fivesarena.swfus.receipts.v1') || '[]',
        ) as Array<{ nodeId?: string; accepted?: boolean; syncState?: string; revision?: number }>;
        const witness = witnesses['fivesarena:locality:province'];
        const receipt = [...receipts]
          .reverse()
          .find((item) => item.nodeId === 'fivesarena:locality:province');
        return {
          province: witness?.data?.provinceSlug,
          witnessRevision: witness?.revision,
          receiptRevision: receipt?.revision,
          accepted: receipt?.accepted,
          syncState: receipt?.syncState,
        };
      }),
    )
    .toEqual({
      province: 'gauteng',
      witnessRevision: 1,
      receiptRevision: 1,
      accepted: true,
      syncState: 'pending_sync',
    });

  await page.reload();
  await expect(page.getByTestId('current-province')).toHaveText('Gauteng');

  await page.locator('[data-province-selector="limpopo"]').click();
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const witnesses = JSON.parse(
          window.localStorage.getItem('fivesarena.swfus.witnesses.v1') || '{}',
        ) as Record<string, { revision?: number; data?: { provinceSlug?: string } }>;
        const witness = witnesses['fivesarena:locality:province'];
        return {
          province: witness?.data?.provinceSlug,
          revision: witness?.revision,
        };
      }),
    )
    .toEqual({ province: 'limpopo', revision: 2 });
});

test('province controls retain mobile touch targets and horizontal scroll stays bounded', async ({ page }) => {
  await page.goto('/news');

  const selectors = page.locator('[data-province-selector]');
  await expect(selectors).toHaveCount(9);

  const count = await selectors.count();
  for (let index = 0; index < count; index += 1) {
    const box = await selectors.nth(index).boundingBox();
    expect(box, `province selector ${index} should have a bounding box`).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }

  await expectNoHorizontalOverflow(page);
});

test('reduced-motion users receive the static organism lane instead of forced Three.js motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/news');

  const staticLane = page.locator('[data-experience-tier="static"]');
  await expect(staticLane).toBeVisible();
  await expect(staticLane).toContainText('static lane');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('World Cup 2026 is an archive on mobile, never a registration funnel', async ({ page }) => {
  await page.goto('/tournament');

  await expect(page.getByText(/Archived · concluded 31 May 2026/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: /5s Arena World Cup/i })).toBeVisible();
  await expect(page.getByText(/Register Your Team/i)).toHaveCount(0);
  await expect(page.getByText(/Proof of Payment/i)).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
