const CACHE_NAME = '5s-arena-v6-apwa';
const STATIC_ASSETS = ['/', '/manifest.json'];
const FOOTBALL_API_PREFIX = '/api/football/';
const PRIVATE_PREFIXES = [
  '/api/auth/',
  '/api/admin/',
  '/api/bookings/',
  '/api/booking/',
  '/api/payments/',
  '/api/payment/',
  '/api/checkout/',
  '/api/account/',
  '/api/profile/',
  '/admin',
  '/bookings',
  '/account',
  '/profile',
  '/checkout',
];

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

function isPrivateOrTransactional(url) {
  return PRIVATE_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(prefix));
}

function mayCacheStatic(request, url, response) {
  if (!isSameOrigin(url) || isPrivateOrTransactional(url)) return false;
  if (request.method !== 'GET' || !response || !response.ok) return false;
  if (request.headers.has('Authorization')) return false;
  const cacheControl = response.headers.get('Cache-Control') || '';
  if (/private|no-store/i.test(cacheControl)) return false;
  return ['document', 'script', 'style', 'image', 'font', 'manifest'].includes(request.destination);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((url) => cache.add(url).catch(() => undefined)),
      );
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

async function staleWhileRevalidateFootball(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      const cacheControl = response.headers.get('Cache-Control') || '';
      if (response.ok && !/private|no-store/i.test(cacheControl)) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => undefined);
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) return networkResponse;

  return new Response(JSON.stringify({ error: 'Offline — no cached public fixtures response.', truthState: 'unavailable' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Authentication, bookings, payments, admin and personalized surfaces are always network-only.
  if (isPrivateOrTransactional(url) || request.headers.has('Authorization')) {
    return;
  }

  // Only explicitly public football reads get stale-while-revalidate semantics.
  if (isSameOrigin(url) && url.pathname.startsWith(FOOTBALL_API_PREFIX)) {
    event.respondWith(staleWhileRevalidateFootball(request));
    return;
  }

  // Navigation/static resources may fall back to cache. Arbitrary API/data responses may not.
  if (!isSameOrigin(url) || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (mayCacheStatic(request, url, response)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || Response.error()),
  );
});
