'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Language, TopicDialogueLine } from '@/lib/topics'

type Mode = 'idle' | 'loading' | 'playing' | 'pausing' | 'done' | 'error'

const PLAYBACK_RATES: { value: number; label: string }[] = [
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: '1×' },
]

const PAUSE_BUFFER_MS = 500

const BCP47: Record<Language, string> = {
  EN: 'en-US',
  ES: 'es-ES',
}

type Props = {
  dialogue: TopicDialogueLine[]
  language: Language
  onCompleted?: () => void
}

/**
 * Audio shadowing player: plays each dialogue line in order, then pauses
 * roughly as long as the line itself so the user can repeat it out loud.
 *
 * Audio is fetched from the cached /api/speak endpoint, so after the first
 * play-through every line is served from Supabase Storage with no extra
 * TTS cost.
 */
type PlayingWord = { lineIdx: number; wordIdx: number }

export function AudioShadowing({ dialogue, language, onCompleted }: Props) {
  const [mode, setMode] = useState<Mode>('idle')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1.0)
  const [error, setError] = useState<string | null>(null)
  const [playingWord, setPlayingWord] = useState<PlayingWord | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runIdRef = useRef(0)
  const onCompletedRef = useRef(onCompleted)
  useEffect(() => {
    onCompletedRef.current = onCompleted
  }, [onCompleted])

  const cleanup = useCallback(() => {
    runIdRef.current++
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Defined as a ref so the recursive call from inside playLine works without
  // re-creating the function each render.
  const playLineRef = useRef<(idx: number, runId: number) => void>(() => {})

  playLineRef.current = (idx: number, runId: number) => {
    if (idx >= dialogue.length) {
      setMode('done')
      onCompletedRef.current?.()
      return
    }

    setCurrentIdx(idx)
    setMode('loading')
    setError(null)

    fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: dialogue[idx].text }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('tts_failed')
        const data = (await r.json()) as { url?: string }
        if (!data.url) throw new Error('no_url')
        return data.url
      })
      .then((url) => {
        if (runIdRef.current !== runId) return
        const audio = new Audio(url)
        audio.playbackRate = playbackRate
        audioRef.current = audio
        setMode('playing')

        audio.onended = () => {
          if (runIdRef.current !== runId) return
          const lineDurationMs = (audio.duration || 1) * 1000
          // Adjust for slowed-down playback — duration reported is the
          // wall-clock time, but the pause should match the user's effort,
          // not the audio's natural length.
          const pauseMs = lineDurationMs / playbackRate + PAUSE_BUFFER_MS

          if (idx + 1 >= dialogue.length) {
            setMode('done')
            onCompletedRef.current?.()
            return
          }

          setMode('pausing')
          timeoutRef.current = setTimeout(() => {
            if (runIdRef.current !== runId) return
            playLineRef.current(idx + 1, runId)
          }, pauseMs)
        }

        audio.onerror = () => {
          if (runIdRef.current !== runId) return
          setError('No se pudo reproducir el audio')
          setMode('error')
        }

        audio.play().catch(() => {
          if (runIdRef.current !== runId) return
          setError('Bloqueado por el navegador. Toca de nuevo.')
          setMode('error')
        })
      })
      .catch((err) => {
        if (runIdRef.current !== runId) return
        setError(err instanceof Error ? err.message : 'TTS falló')
        setMode('error')
      })
  }

  function start() {
    cleanup()
    setPlayingWord(null)
    const runId = ++runIdRef.current
    playLineRef.current(0, runId)
  }

  function playWord(lineIdx: number, wordIdx: number, word: string) {
    // Word-level audio uses the browser's free SpeechSynthesis instead of
    // the cached OpenAI TTS: no network round-trip, no per-click cost,
    // and the quality gap on single words is small enough not to matter.
    if (
      typeof window === 'undefined' ||
      !('speechSynthesis' in window)
    ) {
      return
    }

    cleanup()
    window.speechSynthesis.cancel()
    setMode('idle')
    setError(null)
    setPlayingWord({ lineIdx, wordIdx })

    const clean = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    const text = clean || word

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = BCP47[language]
    utterance.rate = playbackRate
    utterance.onend = () => setPlayingWord(null)
    utterance.onerror = () => setPlayingWord(null)
    window.speechSynthesis.speak(utterance)
  }

  function stop() {
    cleanup()
    setMode('idle')
  }

  function restart() {
    cleanup()
    setMode('idle')
    setCurrentIdx(0)
    setError(null)
  }

  useEffect(() => {
    return () => {
      cleanup()
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [cleanup])

  if (dialogue.length === 0) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm font-bold text-amber-900">
        ⚠️ Este tema no tiene diálogo todavía. No se puede practicar
        shadowing.
      </div>
    )
  }

  const isActive =
    mode === 'loading' || mode === 'playing' || mode === 'pausing'

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="text-sm font-bold text-stone-700">
            🎧 Escucha y repite cada línea en voz alta.
          </div>
          <div className="flex items-center gap-1.5">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate.value}
                type="button"
                onClick={() => setPlaybackRate(rate.value)}
                disabled={isActive}
                className={cn(
                  'text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  playbackRate === rate.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-stone-200 text-stone-500 hover:border-emerald-300'
                )}
              >
                {rate.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          {dialogue.map((line, idx) => {
            const isCurrent = isActive && idx === currentIdx
            const isPlaying = isCurrent && mode === 'playing'
            const isPausing = isCurrent && mode === 'pausing'
            const words = line.text.split(/\s+/).filter(Boolean)
            return (
              <div
                key={idx}
                className={cn(
                  'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  isPlaying && 'bg-emerald-100',
                  isPausing && 'bg-amber-100',
                  !isCurrent && idx < currentIdx && isActive && 'opacity-50'
                )}
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 pt-1.5 min-w-[5rem]">
                  {line.speaker}
                </span>
                <p className="text-stone-800 font-semibold leading-relaxed flex-1">
                  {words.map((word, wordIdx) => {
                    const isWordActive =
                      playingWord?.lineIdx === idx &&
                      playingWord?.wordIdx === wordIdx
                    return (
                      <span key={wordIdx}>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => playWord(idx, wordIdx, word)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              playWord(idx, wordIdx, word)
                            }
                          }}
                          className={cn(
                            'cursor-pointer rounded transition-colors',
                            'underline decoration-dotted decoration-stone-300 underline-offset-4',
                            'hover:text-emerald-700 hover:decoration-emerald-500 hover:decoration-solid hover:decoration-2',
                            isWordActive &&
                              'text-emerald-700 font-black decoration-emerald-500 decoration-solid decoration-2'
                          )}
                          aria-label={`Escuchar ${word}`}
                        >
                          {word}
                        </span>
                        {wordIdx < words.length - 1 && ' '}
                      </span>
                    )
                  })}
                </p>
                {isPlaying && (
                  <span className="text-base shrink-0">🔉</span>
                )}
                {isPausing && (
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 shrink-0 self-center bg-white px-2 py-1 rounded-full">
                    Repite ahora
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] font-bold text-stone-400 mt-3">
          💡 Toca cualquier palabra para escucharla sola.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-sm font-bold text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-bold text-stone-400">
          {mode === 'done'
            ? `¡Hecho! Repasaste ${dialogue.length} líneas.`
            : isActive
              ? `Línea ${currentIdx + 1} de ${dialogue.length}`
              : 'Listo para empezar'}
        </div>
        <div className="flex gap-2">
          {mode === 'done' ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={restart}
            >
              ↺ Repetir
            </Button>
          ) : isActive ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={stop}
            >
              ⏹ Parar
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={start}
            >
              ▶ {mode === 'error' ? 'Reintentar' : 'Reproducir todo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
