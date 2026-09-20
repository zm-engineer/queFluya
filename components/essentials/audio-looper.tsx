'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'

type Result = { audioUrl: string; title?: string }
type Status = 'idle' | 'loading' | 'error' | 'notfound'

const today = () => new Date().toISOString().slice(0, 10)

// Cache the extracted audio for the day (no DB) so re-pasting the same link
// doesn't hit the server again.
function readCache(url: string): Result | null {
  try {
    const raw = localStorage.getItem(`escucha:${url}`)
    if (!raw) return null
    const c = JSON.parse(raw) as Result & { day: string }
    return c.day === today() ? { audioUrl: c.audioUrl, title: c.title } : null
  } catch {
    return null
  }
}

function writeCache(url: string, r: Result) {
  try {
    localStorage.setItem(`escucha:${url}`, JSON.stringify({ ...r, day: today() }))
  } catch {
    // storage unavailable — fine, just no caching.
  }
}

export function AudioLooper() {
  const t = useDict()
  const l = t.essentials.listening
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<Result | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = url.trim()
    if (!value) return

    setResult(null)
    const cached = readCache(value)
    if (cached) {
      setResult(cached)
      setStatus('idle')
      return
    }

    setStatus('loading')
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
        setStatus('notfound')
        return
      }
      const found = { audioUrl: data.audioUrl, title: data.title }
      writeCache(value, found)
      setResult(found)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="flex gap-3">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={l.placeholder}
          autoFocus
        />
        <Button type="submit" disabled={status === 'loading' || !url.trim()}>
          {l.load}
        </Button>
      </form>

      {status === 'loading' && (
        <p className="text-sm font-bold text-stone-400">{l.loading}</p>
      )}
      {status === 'error' && (
        <p className="text-sm font-bold text-red-600">{l.error}</p>
      )}
      {status === 'notfound' && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-sm font-bold text-amber-900">{l.notFound}</p>
        </div>
      )}

      {result && (
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-base font-black text-stone-900 leading-snug">
              {result.title || l.audio}
            </p>
            <span className="shrink-0 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              {l.loopBadge}
            </span>
          </div>
          {/* Native controls + loop: one tap to play, repeats until paused; the
              OS/lock-screen media controls let you pause hands-free. */}
          <audio
            key={result.audioUrl}
            src={result.audioUrl}
            controls
            loop
            className="w-full"
          />
          <p className="text-[13px] font-bold text-stone-400 mt-4">💡 {l.hint}</p>
        </div>
      )}
    </div>
  )
}
