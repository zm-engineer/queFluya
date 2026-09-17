'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Language, TopicDialogueLine } from '@/lib/topics'

type Mode = 'idle' | 'loading' | 'playing' | 'pausing' | 'done' | 'error'

const PLAYBACK_RATES: { value: number; label: string }[] = [
  { value: 0.75, label: '0.75×' },
  { value: 1.0, label: '1×' },
]

const PAUSE_BUFFER_MS = 500

// A tiny valid silent WAV. Played inside the user's tap to "unlock" the reused
// audio element for the mobile autoplay policy (see start()).
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAAB9AAACABAAZGF0YQAAAAA='

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
  const t = useDict()
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

  // A SINGLE reused audio element. Mobile browsers "bless" an element once it
  // plays inside a user gesture, after which it can be replayed programmatically.
  // Creating a fresh `new Audio()` per line (as before) meant lines 2+ — which
  // start from a timer, not a tap — were blocked by the autoplay policy.
  function ensureAudio(): HTMLAudioElement {
    if (!audioRef.current) audioRef.current = new Audio()
    return audioRef.current
  }

  const cleanup = useCallback(() => {
    runIdRef.current++
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.onended = null
      audio.onerror = null
      // Keep the element itself alive so it stays unlocked for the next line.
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Defined as a ref so the recursive call from inside playLine works without
  // re-creating the function each render. It intentionally reads the latest
  // dialogue/playbackRate/t on every render, hence the render-phase assignment.
  const playLineRef = useRef<(idx: number, runId: number) => void>(() => {})

  // eslint-disable-next-line react-hooks/refs -- intentional latest-closure ref
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
        const audio = ensureAudio()
        audio.src = url
        audio.playbackRate = playbackRate
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
          setError(t.practice.playbackErrorAudio)
          setMode('error')
        }

        audio.play().catch(() => {
          if (runIdRef.current !== runId) return
          setError(t.practice.playbackBlocked)
          setMode('error')
        })
      })
      .catch((err) => {
        if (runIdRef.current !== runId) return
        setError(err instanceof Error ? err.message : t.practice.ttsFailed)
        setMode('error')
      })
  }

  function start() {
    cleanup()
    setPlayingWord(null)
    // Unlock the reused element inside this tap by playing a near-empty silent
    // clip. That blesses the element for the browser's autoplay policy, so the
    // timer-driven lines that follow the first one aren't blocked. It's silent
    // and gets superseded the moment line 0's real audio sets a new src.
    const audio = ensureAudio()
    audio.src = SILENT_WAV
    audio.play().catch(() => {})
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
        ⚠️ {t.practice.shadowNoDialogue}
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
            🎧 {t.practice.shadowHint}
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
                          aria-label={t.practice.listenWordAria(word)}
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
                    {t.practice.repeatNow}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] font-bold text-stone-400 mt-3">
          💡 {t.practice.tapWordHint}
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
            ? t.practice.shadowDone(dialogue.length)
            : isActive
              ? t.practice.lineOf(currentIdx + 1, dialogue.length)
              : t.practice.readyToStart}
        </div>
        <div className="flex gap-2">
          {mode === 'done' ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={restart}
            >
              ↺ {t.practice.repeat}
            </Button>
          ) : isActive ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={stop}
            >
              ⏹ {t.practice.stop}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={start}
            >
              ▶ {mode === 'error' ? t.practice.retry : t.practice.playAll}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
