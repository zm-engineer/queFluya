// Pure helpers for the listening extractor: find a direct audio file URL inside
// a page's HTML, and block server-side requests to private/internal hosts (SSRF).

function resolve(candidate: string, pageUrl: string): string | null {
  try {
    const u = new URL(candidate, pageUrl)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}

/**
 * The first direct audio URL found in `html`, resolved against `pageUrl`.
 * Tries, in order: <audio>/<source> src, og:audio meta, any absolute media URL,
 * then relative media paths. Returns null if none found.
 */
export function extractAudioUrl(html: string, pageUrl: string): string | null {
  const passes: RegExp[] = [
    /<(?:audio|source)\b[^>]*\ssrc=["']([^"']+)["']/gi,
    /property=["']og:audio(?::secure_url)?["'][^>]*content=["']([^"']+)["']/gi,
    /content=["']([^"']+)["'][^>]*property=["']og:audio(?::secure_url)?["']/gi,
    /["'](https?:\/\/[^"'\s]+\.(?:mp3|m4a|ogg|wav|aac)(?:\?[^"'\s]*)?)["']/gi,
    /["']([^"'\s]+\.(?:mp3|m4a)(?:\?[^"'\s]*)?)["']/gi,
  ]
  for (const re of passes) {
    for (const match of html.matchAll(re)) {
      const resolved = resolve(match[1], pageUrl)
      if (resolved) return resolved
    }
  }
  return null
}

/** The page's <title> or og:title, if present. */
export function extractTitle(html: string): string | null {
  const og = html.match(
    /<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
  )
  if (og) return decodeEntities(og[1].trim())
  const title = html.match(/<title\b[^>]*>([^<]+)<\/title>/i)
  return title ? decodeEntities(title[1].trim()) : null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

/**
 * Block obviously-private hosts to reduce SSRF risk before fetching a
 * user-supplied URL server-side. Not bulletproof (DNS rebinding), but stops the
 * common localhost / private-range / cloud-metadata targets.
 */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/\.$/, '')
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true
  if (h === '0.0.0.0' || h === '::1' || h === '[::1]') return true
  if (/^127\./.test(h)) return true
  if (/^10\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (/^169\.254\./.test(h)) return true // link-local + cloud metadata
  return false
}
