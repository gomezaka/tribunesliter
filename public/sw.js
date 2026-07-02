const CACHE_NAME = 'tribunesliter-runtime-v0.2.12-gladrompe-all';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest?v=20260702-gladrompe-all',
  '/favicon.png?v=20260702-gladrompe-all',
  '/apple-touch-icon.png?v=20260702-gladrompe-all',
  '/icon-192.png?v=20260702-gladrompe-all',
  '/icon-512.png?v=20260702-gladrompe-all',
  '/icon-maskable-512.png?v=20260702-gladrompe-all',
  '/assets/glad-rumpe-icon.png?v=20260702-gladrompe-all',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

async function cacheResponse(request, response) {
  if (!response || !response.ok) return response;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return response;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    return (await caches.match(request)) || caches.match('/');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return cacheResponse(request, await fetch(request));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
