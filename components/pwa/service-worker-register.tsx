'use client'

import { useEffect } from 'react'

// Registers the service worker on the client so the app is installable. Renders
// nothing; lives in the root layout so it runs on every page.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registration failures are non-fatal — the site still works as a normal
      // web app, it just won't be installable.
    })
  }, [])

  return null
}
