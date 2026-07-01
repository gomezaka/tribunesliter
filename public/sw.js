const CACHE_NAME = 'tribunesliter-app-shell-v2.12';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest?v=20260701-gladrompe',
  '/favicon.png?v=20260701-gladrompe',
  '/apple-touch-icon.png?v=20260701-gladrompe',
  '/icon-192.png?v=20260701-gladrompe',
  '/icon-512.png?v=20260701-gladrompe',
  '/icon-maskable-512.png?v=20260701-gladrompe',
  '/assets/glad-rumpe-icon.png?v=20260701-gladrompe',
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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});
