'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Language } from '@/lib/topics'

export type UseTTS = {
  speak: (text: string, language: Language) => void
  cancel: () => void
  isSpeaking: boolean
  isSupported: boolean
}

/**
 * Speak text using OpenAI TTS. Replaces the old `useSpeechSynthesis` which
 * relied on the browser's robotic OS voices. Tradeoff: ~1-2s of network
 * latency before audio starts, but much higher quality. `isSpeaking` covers
 * both the request and the playback so the UI can stay in a single state.
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

  const speak = useCallback(
    (text: string, _language: Language) => {
      // Cancel any in-flight or playing audio first.
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
        audioRef.current = null
      }
      const requestId = ++requestIdRef.current
      setIsSpeaking(true)

      fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error('tts_failed')
          return response.blob()
        })
        .then((blob) => {
          if (requestIdRef.current !== requestId) return
          const url = URL.createObjectURL(blob)
          const audio = new Audio(url)
          audioRef.current = audio

          const cleanup = () => {
            if (audioRef.current === audio) {
              audioRef.current = null
              setIsSpeaking(false)
            }
            URL.revokeObjectURL(url)
          }

          audio.onended = cleanup
          audio.onerror = cleanup

          audio.play().catch(() => cleanup())
        })
        .catch(() => {
          if (requestIdRef.current === requestId) {
            setIsSpeaking(false)
          }
        })
    },
    []
  )

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return { speak, cancel, isSpeaking, isSupported: true }
}
