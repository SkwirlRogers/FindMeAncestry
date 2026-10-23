// Service Worker for FindMeAncestry static site
const CACHE_NAME = 'findme-ancestry-v1';
const URLs_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/styles.css',
  '/assets/js/google-pay.js',
  '/assets/js/floating-chat.js',
  '/assets/logo.jpg',
  // Additional core assets can be added here
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
