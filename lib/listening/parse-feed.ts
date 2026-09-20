// Pure parser for a podcast RSS feed → the channel title and a list of episodes
// with their direct audio URL (the <enclosure>). Podcast feeds are the clean,
// legal source (episodes are meant to be downloaded/streamed).

export type FeedEpisode = { title: string; audioUrl: string }
export type ParsedFeed = { title: string | null; episodes: FeedEpisode[] }

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function firstTitle(xml: string): string | null {
  const m = xml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)
  return m ? decodeEntities(m[1]) : null
}

function audioFromItem(item: string): string | null {
  // <enclosure url="…" type="audio/…">
  const enc = item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["']/i)
  if (enc && /^https?:/i.test(enc[1])) return enc[1]
  // <media:content url="…" type="audio/…">
  const media = item.match(/<media:content\b[^>]*\burl=["']([^"']+\.(?:mp3|m4a|ogg|aac)[^"']*)["']/i)
  if (media && /^https?:/i.test(media[1])) return media[1]
  return null
}

export function parseFeed(xml: string, limit = 30): ParsedFeed {
  const items = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((m) => m[0])
  const episodes: FeedEpisode[] = []
  for (const item of items) {
    const audioUrl = audioFromItem(item)
    if (!audioUrl) continue
    episodes.push({ title: firstTitle(item) ?? 'Episode', audioUrl })
    if (episodes.length >= limit) break
  }
  // Channel title is the first <title> before the first <item>.
  const head = xml.split(/<item\b/i)[0]
  return { title: firstTitle(head), episodes }
}
