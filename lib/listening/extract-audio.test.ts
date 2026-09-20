import { describe, expect, it } from 'vitest'
import { extractAudioUrl, extractTitle, isBlockedHost } from './extract-audio'

const PAGE = 'https://elllo.org/english/1551/1558-Meg-Days-of-Week.htm'

describe('extractAudioUrl', () => {
  it('finds an <audio>/<source> src (resolving relative paths)', () => {
    const html = `<audio controls><source src="/audio/1500/1558.mp3" type="audio/mpeg"></audio>`
    expect(extractAudioUrl(html, PAGE)).toBe('https://elllo.org/audio/1500/1558.mp3')
  })

  it('finds an absolute mp3 url anywhere in the HTML', () => {
    const html = `<script>var a = "https://cdn.example.com/ep/1.mp3?t=9";</script>`
    expect(extractAudioUrl(html, PAGE)).toBe('https://cdn.example.com/ep/1.mp3?t=9')
  })

  it('reads og:audio meta', () => {
    const html = `<meta property="og:audio" content="https://x.com/a.m4a" />`
    expect(extractAudioUrl(html, PAGE)).toBe('https://x.com/a.m4a')
  })

  it('prefers the <audio> src over a stray link', () => {
    const html = `<a href="other.mp3">dl</a><audio><source src="https://good.com/real.mp3"></audio>`
    expect(extractAudioUrl(html, PAGE)).toBe('https://good.com/real.mp3')
  })

  it('returns null when there is no audio', () => {
    expect(extractAudioUrl('<p>no media here</p>', PAGE)).toBeNull()
  })

  it('ignores non-http(s) sources', () => {
    expect(extractAudioUrl('<audio src="blob:xyz">', PAGE)).toBeNull()
  })
})

describe('extractTitle', () => {
  it('prefers og:title, falls back to <title>, decodes entities', () => {
    expect(extractTitle('<meta property="og:title" content="Days &amp; Week">')).toBe('Days & Week')
    expect(extractTitle('<title>Fallback</title>')).toBe('Fallback')
    expect(extractTitle('<p>nothing</p>')).toBeNull()
  })
})

describe('isBlockedHost', () => {
  it('blocks localhost, private ranges and cloud metadata', () => {
    for (const h of ['localhost', '127.0.0.1', '10.0.0.5', '192.168.1.1', '172.16.0.1', '169.254.169.254', 'db.internal']) {
      expect(isBlockedHost(h)).toBe(true)
    }
  })
  it('allows public hosts', () => {
    for (const h of ['elllo.org', 'www.bbc.co.uk', 'cdn.example.com']) {
      expect(isBlockedHost(h)).toBe(false)
    }
  })
})
