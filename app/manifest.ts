import type { MetadataRoute } from 'next'

// Web App Manifest. Next serves this at /manifest.webmanifest and auto-injects
// the <link rel="manifest"> into <head>. Makes the app installable on mobile.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'queFluya',
    short_name: 'queFluya',
    description: 'Practica idiomas hablando — inglés ↔ español. ¡Que fluya!',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf9', // stone-50
    theme_color: '#10b981', // emerald-500
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
