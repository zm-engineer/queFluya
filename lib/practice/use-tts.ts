'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Language } from '@/lib/topics'

export type UseTTS = {
  speak: (text: string, language: Language) => void
  /** Warm the cache for a phrase so the first click plays instantly. */
  prefetch: (text: string) => void
  cancel: () => void
  isSpeaking: boolean
  isSupported: boolean
}

// Session-wide cache: same text → same audio URL. Keyed by the trimmed text and
// stores the in-flight promise, so repeat plays AND prefetches of the same
// phrase skip the /api/speak round-trip entirely (the main source of the delay).
const urlCache = new Map<string, Promise<string | null>>()

function resolveUrl(text: string): Promise<string | null> {
  const key = text.trim()
  if (!key) return Promise.resolve(null)

  const cached = urlCache.get(key)
  if (cached) return cached

  const pending = fetch('/api/speak', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: key }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error('tts_failed')
      const data = (await response.json()) as { url?: string }
      return data.url ?? null
    })
    .catch(() => {
      urlCache.delete(key) // let a later attempt retry instead of caching the failure
      return null
    })

  urlCache.set(key, pending)
  return pending
}

/**
 * Speak text using OpenAI TTS (served from a Supabase cache). The first time a
 * phrase is generated it costs ~1-2s; after that the URL is cached client-side,
 * so replays are instant. Call `prefetch` for visible phrases so even the first
 * click is fast. `isSpeaking` covers both the request and the playback.
 */
export function useTTS(): UseTTS {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const requestIdRef = useRef(0)

  const cancel = useCallback(() => {
    requestIdRef.current++
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  const speak = useCallback((text: string, _language: Language) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    const requestId = ++requestIdRef.current
    setIsSpeaking(true)

    resolveUrl(text).then((url) => {
      if (requestIdRef.current !== requestId) return
      if (!url) {
        setIsSpeaking(false)
        return
      }
      const audio = new Audio(url)
      audioRef.current = audio

      const cleanup = () => {
        if (audioRef.current === audio) {
          audioRef.current = null
          setIsSpeaking(false)
        }
      }
      audio.onended = cleanup
      audio.onerror = cleanup
      audio.play().catch(() => cleanup())
    })
  }, [])

  const prefetch = useCallback((text: string) => {
    // Resolve (and cache) the URL, then warm the browser's HTTP cache for the
    // mp3 so playback starts with no network wait on the first click.
    resolveUrl(text).then((url) => {
      if (url) fetch(url).catch(() => {})
    })
  }, [])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return { speak, prefetch, cancel, isSpeaking, isSupported: true }
}
