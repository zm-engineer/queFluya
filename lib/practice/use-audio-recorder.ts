'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'recording' | 'stopped' | 'error'

export type UseAudioRecorder = {
  start: () => Promise<void>
  stop: () => void
  reset: () => void
  audioBlob: Blob | null
  status: Status
  error: string | null
  isSupported: boolean
  /** ms elapsed since the current recording started, updated ~10×/s. */
  elapsedMs: number
  /** Hard cap that auto-stops the recorder; matches the constructor option. */
  maxDurationMs: number
}

const DEFAULT_MAX_DURATION_MS = 15_000

/**
 * Records audio from the microphone into a Blob using MediaRecorder. The
 * blob is the input to the /api/transcribe Whisper endpoint.
 *
 * `maxDurationMs` is a hard cap that auto-stops recording — it exists to
 * protect against runaway Whisper bills if a user (or a bug) holds the
 * recorder open. Defaults to 15s, which comfortably covers any single
 * practice phrase.
 */
export function useAudioRecorder(
  maxDurationMs: number = DEFAULT_MAX_DURATION_MS
): UseAudioRecorder {
  const [status, setStatus] = useState<Status>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const [elapsedMs, setElapsedMs] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)

  useEffect(() => {
    setIsSupported(
      typeof navigator !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== 'undefined'
    )
  }, [])

  const clearTimers = useCallback(() => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current)
      autoStopRef.current = null
    }
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    setStatus('stopped')
  }, [clearTimers])

  const start = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
    setElapsedMs(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      recorder.start()
      startedAtRef.current = Date.now()
      setStatus('recording')

      // Live elapsed counter for the UI.
      tickRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current)
      }, 100)

      // Hard cap — protects against accidental long recordings billing
      // Whisper at $0.006/min. Auto-stops cleanly.
      autoStopRef.current = setTimeout(() => {
        stop()
      }, maxDurationMs)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo iniciar la grabación'
      setError(message)
      setStatus('error')
    }
  }, [maxDurationMs, stop])

  const reset = useCallback(() => {
    clearTimers()
    setAudioBlob(null)
    setError(null)
    setStatus('idle')
    setElapsedMs(0)
  }, [clearTimers])

  useEffect(() => {
    return () => {
      clearTimers()
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [clearTimers])

  return {
    start,
    stop,
    reset,
    audioBlob,
    status,
    error,
    isSupported,
    elapsedMs,
    maxDurationMs,
  }
}
