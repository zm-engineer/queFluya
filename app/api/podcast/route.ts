import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { isBlockedHost } from '@/lib/listening/extract-audio'
import { parseFeed } from '@/lib/listening/parse-feed'

// Fetches a podcast RSS feed and returns its episodes (title + direct audio URL).
// Podcasts are the clean source — episodes are meant to be downloaded/streamed.
export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const raw = typeof body?.url === 'string' ? body.url.trim() : ''

  let feedUrl: URL
  try {
    feedUrl = new URL(raw)
  } catch {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 })
  }
  if (feedUrl.protocol !== 'http:' && feedUrl.protocol !== 'https:') {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 })
  }
  if (isBlockedHost(feedUrl.hostname)) {
    return NextResponse.json({ error: 'blocked_host' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(feedUrl.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; queFluya/1.0; +https://quefluya.vercel.app)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })
    if (!res.ok) {
      return NextResponse.json({ found: false, status: res.status })
    }
    const xml = (await res.text()).slice(0, 5_000_000)
    const feed = parseFeed(xml)
    if (feed.episodes.length === 0) {
      return NextResponse.json({ found: false })
    }
    return NextResponse.json({ found: true, ...feed })
  } catch {
    return NextResponse.json({ found: false })
  } finally {
    clearTimeout(timeout)
  }
}
