// Minimal service worker — its only job right now is to make the app
// installable as a PWA. We deliberately do NOT cache responses: the app is
// server-rendered and auth-gated, so caching HTML would risk serving stale or
// wrong-user pages. Offline/precaching can be layered on later, carefully.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
// Having a fetch handler is what satisfies the install criteria; it just lets
// the network handle every request (no respondWith = default browser fetch).
self.addEventListener('fetch', () => {})
