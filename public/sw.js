const CACHE_NAME = '5s-arena-v3';
const STATIC_ASSETS = [
  '/',
  '/images/logo.png',
  '/images/Hellenic-Football-Club-logo.png',
  '/images/courts/court-1.jpg',
  '/images/courts/court-2.jpg',
  '/images/courts/court-3.jpg',
  '/images/courts/court-4.jpg',
  '/images/admin-photos/kholofelo-robyn-rababalela-footer-picture.png',
  '/images/admin-photos/mashoto-rababalela-footer-picture.png',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
