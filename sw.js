
// IzaEasy Lodge Manager — Simple Offline Service Worker
const CACHE_NAME = 'izaeasy-lodge-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  // icons
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).then(self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle same-origin GET requests
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // Try cache first, then network, then offline fallback to cached root
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        // Cache a copy of successful basic responses
        const copy = res.clone();
        if (copy && copy.status === 200 && copy.type === 'basic') {
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./'));
    })
  );
});
