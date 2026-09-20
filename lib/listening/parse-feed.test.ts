import { describe, expect, it } from 'vitest'
import { parseFeed } from './parse-feed'

const FEED = `<?xml version="1.0"?>
<rss><channel>
  <title>6 Minute English</title>
  <item>
    <title><![CDATA[The joy of missing out]]></title>
    <enclosure url="https://downloads.bbc.co.uk/ep1.mp3" length="1" type="audio/mpeg"/>
  </item>
  <item>
    <title>Are you a foodie? &amp; more</title>
    <enclosure url="https://downloads.bbc.co.uk/ep2.mp3" type="audio/mpeg"/>
  </item>
  <item>
    <title>No audio here</title>
  </item>
</channel></rss>`

describe('parseFeed', () => {
  it('reads the channel title', () => {
    expect(parseFeed(FEED).title).toBe('6 Minute English')
  })

  it('lists episodes with their enclosure audio url', () => {
    const eps = parseFeed(FEED).episodes
    expect(eps).toHaveLength(2)
    expect(eps[0]).toEqual({
      title: 'The joy of missing out',
      audioUrl: 'https://downloads.bbc.co.uk/ep1.mp3',
    })
  })

  it('decodes entities and CDATA in titles', () => {
    expect(parseFeed(FEED).episodes[1].title).toBe('Are you a foodie? & more')
  })

  it('skips items without an audio enclosure', () => {
    expect(parseFeed(FEED).episodes.some((e) => e.title === 'No audio here')).toBe(false)
  })

  it('respects the limit', () => {
    expect(parseFeed(FEED, 1).episodes).toHaveLength(1)
  })

  it('supports media:content as a fallback', () => {
    const xml = `<rss><channel><item><title>x</title><media:content url="https://x.com/a.mp3" type="audio/mpeg"/></item></channel></rss>`
    expect(parseFeed(xml).episodes[0].audioUrl).toBe('https://x.com/a.mp3')
  })
})
