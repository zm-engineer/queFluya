import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import {
  extractAudioUrl,
  extractTitle,
  isBlockedHost,
} from '@/lib/listening/extract-audio'

// Fetches an (open) page server-side and returns the first direct audio URL it
// finds, so the client can loop it. Only works for pages that expose a plain
// media file and don't block automated requests — protected sites (403) or
// DRM/streaming pages return found:false; for those the user pastes a direct mp3.
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const raw = typeof body?.url === 'string' ? body.url.trim() : ''

  let pageUrl: URL
  try {
    pageUrl = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 })
  }
  if (pageUrl.protocol !== 'http:' && pageUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 })
  }
  if (isBlockedHost(pageUrl.hostname)) {
    return NextResponse.json({ error: 'blocked_host' }, { status: 400 })
  }

  // If the user pasted a direct media file, use it as-is (no fetch needed).
  if (/\.(mp3|m4a|ogg|wav|aac)(\?.*)?$/i.test(pageUrl.pathname + pageUrl.search)) {
    return NextResponse.json({ found: true, audioUrl: pageUrl.toString() })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(pageUrl.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Present as a normal browser so open pages return their real HTML.
        'User-Agent':
          'Mozilla/5.0 (compatible; queFluya/1.0; +https://quefluya.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    })
    if (!res.ok) {
      // 403/blocked, 404, etc. — the page won't give us its HTML.
      return NextResponse.json({ found: false, status: res.status })
    }
    const html = (await res.text()).slice(0, 2_000_000) // cap at ~2MB
    const audioUrl = extractAudioUrl(html, pageUrl.toString())
    if (!audioUrl) {
      return NextResponse.json({ found: false })
    }
    return NextResponse.json({
      found: true,
      audioUrl,
      title: extractTitle(html) ?? undefined,
    })
  } catch {
    return NextResponse.json({ found: false })
  } finally {
    clearTimeout(timeout)
  }
}
