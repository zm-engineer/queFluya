// Service worker — makes the app installable AND paints instantly on open.
//
// We cache ONLY things that are safe to reuse across users:
//   * build assets under /_next/static/ and the icons  → cache-first (they're
//     content-hashed / static, so a cached copy is never wrong).
//   * the PUBLIC landing document '/'                   → stale-while-revalidate,
//     so opening the PWA paints the shell from cache immediately (killing the
//     white screen during a cold-start network wait) and refreshes in the
//     background.
// Everything else — auth pages, the dashboard, APIs — is NEVER cached, so we can
// never serve a stale or wrong-user page. That was the original concern; this
// keeps it while still fixing the blank-on-open.

const CACHE = 'quefluya-shell-v1'
const PRECACHE = ['/', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from older versions so a new shell fully replaces the old.
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => cached) // offline → fall back to whatever we have
  // Serve the cached shell immediately if we have it; otherwise wait for network.
  return cached || network
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Immutable build assets & icons → cache-first.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icon') ||
    url.pathname === '/apple-touch-icon.png'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // The public landing shell → stale-while-revalidate for an instant open.
  if (request.mode === 'navigate' && url.pathname === '/') {
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  // Everything else: default network handling (no caching).
})
