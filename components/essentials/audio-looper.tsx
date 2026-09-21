'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'

type Tab = 'page' | 'file' | 'podcast'
type Status = 'idle' | 'loading' | 'error' | 'notfound'
type Episode = { title: string; audioUrl: string }

const today = () => new Date().toISOString().slice(0, 10)

function readCache(url: string): { audioUrl: string; title?: string } | null {
  try {
    const raw = localStorage.getItem(`escucha:${url}`)
    if (!raw) return null
    const c = JSON.parse(raw) as { audioUrl: string; title?: string; day: string }
    return c.day === today() ? { audioUrl: c.audioUrl, title: c.title } : null
  } catch {
    return null
  }
}

function writeCache(url: string, r: { audioUrl: string; title?: string }) {
  try {
    localStorage.setItem(`escucha:${url}`, JSON.stringify({ ...r, day: today() }))
  } catch {
    // storage unavailable — fine.
  }
}

// Saved podcast feeds persist across sessions (until deleted) so the user never
// re-pastes the RSS.
type SavedFeed = { url: string; title: string }
const FEEDS_KEY = 'escucha:feeds'

function readFeeds(): SavedFeed[] {
  try {
    const raw = localStorage.getItem(FEEDS_KEY)
    return raw ? (JSON.parse(raw) as SavedFeed[]) : []
  } catch {
    return []
  }
}

function writeFeeds(feeds: SavedFeed[]) {
  try {
    localStorage.setItem(FEEDS_KEY, JSON.stringify(feeds))
  } catch {
    // storage unavailable — fine.
  }
}

export function AudioLooper() {
  const t = useDict()
  const l = t.essentials.listening

  const [tab, setTab] = useState<Tab>('page')
  const [src, setSrc] = useState<string | null>(null)
  const [title, setTitle] = useState<string | null>(null)

  // Page tab
  const [pageUrl, setPageUrl] = useState('')
  const [pageStatus, setPageStatus] = useState<Status>('idle')

  // Podcast tab
  const [feedUrl, setFeedUrl] = useState('')
  const [feedStatus, setFeedStatus] = useState<Status>('idle')
  const [episodes, setEpisodes] = useState<Episode[] | null>(null)
  const [savedFeeds, setSavedFeeds] = useState<SavedFeed[]>([])

  // Load saved feeds from localStorage (client only; deferred a frame so it's
  // not a synchronous setState in the effect).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSavedFeeds(readFeeds()))
    return () => cancelAnimationFrame(raf)
  }, [])

  // Object URL from an uploaded file — revoke the old one when replaced/unmounted.
  const objectUrlRef = useRef<string | null>(null)
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  function play(audioUrl: string, audioTitle: string | null) {
    setSrc(audioUrl)
    setTitle(audioTitle)
  }

  async function onPageSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = pageUrl.trim()
    if (!value) return
    const cached = readCache(value)
    if (cached) {
      play(cached.audioUrl, cached.title ?? null)
      setPageStatus('idle')
      return
    }
    setPageStatus('loading')
    try {
      const r = await fetch('/api/extract-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      })
      const data = (await r.json()) as {
        found?: boolean
        audioUrl?: string
        title?: string
      }
      if (!r.ok || !data.found || !data.audioUrl) {
        setPageStatus('notfound')
        return
      }
      writeCache(value, { audioUrl: data.audioUrl, title: data.title })
      play(data.audioUrl, data.title ?? null)
      setPageStatus('idle')
    } catch {
      setPageStatus('error')
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    play(url, file.name)
  }

  async function loadFeed(value: string) {
    if (!value) return
    setFeedUrl(value)
    setFeedStatus('loading')
    setEpisodes(null)
    try {
      const r = await fetch('/api/podcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      })
      const data = (await r.json()) as {
        found?: boolean
        title?: string
        episodes?: Episode[]
      }
      if (!r.ok || !data.found || !data.episodes?.length) {
        setFeedStatus('notfound')
        return
      }
      setEpisodes(data.episodes)
      setFeedStatus('idle')
      // Remember this feed (dedupe by url, most recent first) so it's one tap
      // next time — no re-pasting the RSS.
      setSavedFeeds((prev) => {
        const next = [
          { url: value, title: data.title || value },
          ...prev.filter((f) => f.url !== value),
        ]
        writeFeeds(next)
        return next
      })
    } catch {
      setFeedStatus('error')
    }
  }

  function deleteFeed(url: string) {
    setSavedFeeds((prev) => {
      const next = prev.filter((f) => f.url !== url)
      writeFeeds(next)
      return next
    })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'page', label: l.tabPage },
    { id: 'file', label: l.tabFile },
    { id: 'podcast', label: l.tabPodcast },
  ]

  return (
    <div className="space-y-6">
      {/* Source tabs */}
      <div className="flex gap-2">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={cn(
              'flex-1 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-2xl border-2 transition-colors',
              tb.id === tab
                ? 'bg-emerald-500 text-white border-emerald-500'
                : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-300'
            )}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'page' && (
        <div className="space-y-3">
          <form onSubmit={onPageSubmit} className="flex gap-3">
            <Input
              type="url"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              placeholder={l.placeholder}
            />
            <Button type="submit" disabled={pageStatus === 'loading' || !pageUrl.trim()}>
              {l.load}
            </Button>
          </form>
          {pageStatus === 'loading' && (
            <p className="text-sm font-bold text-stone-400">{l.loading}</p>
          )}
          {pageStatus === 'error' && (
            <p className="text-sm font-bold text-red-600">{l.error}</p>
          )}
          {pageStatus === 'notfound' && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <p className="text-sm font-bold text-amber-900">{l.notFound}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'file' && (
        <label className="block bg-white border-2 border-dashed border-stone-300 rounded-3xl p-8 text-center cursor-pointer hover:border-emerald-400 transition-colors">
          <div className="text-3xl mb-2">📁</div>
          <span className="text-sm font-black text-stone-700">{l.fileLabel}</span>
          <input
            type="file"
            // Explicit extensions alongside audio/* — some phone pickers hide
            // mp3s when only "audio/*" is set.
            accept="audio/*,.mp3,.m4a,.aac,.ogg,.oga,.wav,.opus,.flac"
            onChange={onFile}
            className="hidden"
          />
        </label>
      )}

      {tab === 'podcast' && (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              loadFeed(feedUrl.trim())
            }}
            className="flex gap-3"
          >
            <Input
              type="url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder={l.feedPlaceholder}
            />
            <Button type="submit" disabled={feedStatus === 'loading' || !feedUrl.trim()}>
              {l.load}
            </Button>
          </form>

          {savedFeeds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {savedFeeds.map((f) => (
                <div
                  key={f.url}
                  className="inline-flex items-center gap-1 bg-white border-2 border-stone-200 rounded-full pl-3 pr-1 py-1"
                >
                  <button
                    type="button"
                    onClick={() => loadFeed(f.url)}
                    className="text-xs font-black text-stone-700 hover:text-emerald-600 transition-colors max-w-[11rem] truncate"
                  >
                    🎙️ {f.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFeed(f.url)}
                    aria-label={l.delete}
                    className="shrink-0 w-5 h-5 flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {feedStatus === 'loading' && (
            <p className="text-sm font-bold text-stone-400">{l.loading}</p>
          )}
          {feedStatus === 'error' && (
            <p className="text-sm font-bold text-red-600">{l.error}</p>
          )}
          {feedStatus === 'notfound' && (
            <p className="text-sm font-bold text-amber-900">{l.feedNotFound}</p>
          )}
          {episodes && episodes.length > 0 && (
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
                {l.episodesTitle}
              </h3>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {episodes.map((ep, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => play(ep.audioUrl, ep.title)}
                      className={cn(
                        'w-full text-left bg-white border-2 rounded-2xl px-4 py-3 text-sm font-bold transition-colors',
                        src === ep.audioUrl
                          ? 'border-emerald-400 text-emerald-800'
                          : 'border-stone-200 text-stone-700 hover:border-emerald-300'
                      )}
                    >
                      ▶ {ep.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Shared player */}
      {src && (
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-base font-black text-stone-900 leading-snug break-words">
              {title || l.audio}
            </p>
            <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {l.loopBadge}
            </span>
          </div>
          <audio key={src} src={src} controls loop className="w-full" />
          <p className="text-[13px] font-bold text-stone-400 mt-4">💡 {l.hint}</p>
        </div>
      )}
    </div>
  )
}
