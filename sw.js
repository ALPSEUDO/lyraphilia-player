/* ============================================================
   LYRAPHILIA DREAMS – COVERS
   Service Worker — PWA offline support
   Caches the player shell; audio streams from R2
   ============================================================ */

const CACHE_NAME = 'lyraphilia-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

/* Install — cache the app shell */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

/* Activate — clean up old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Fetch — serve shell from cache, audio from network */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Always fetch audio from network (R2) */
  if (url.hostname.includes('r2.dev') || url.pathname.match(/\.(wav|mp3|ogg)$/)) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* Serve shell assets from cache, fallback to network */
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
