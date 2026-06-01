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
}

/**
 * Records audio from the microphone into a Blob using MediaRecorder. The
 * blob is the input to the /api/transcribe Whisper endpoint. Unlike the
 * old Web Speech recogniser, this hook does NOT transcribe — that lives
 * server-side now.
 */
export function useAudioRecorder(): UseAudioRecorder {
  const [status, setStatus] = useState<Status>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setIsSupported(
      typeof navigator !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== 'undefined'
    )
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setAudioBlob(null)
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
      setStatus('recording')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo iniciar la grabación'
      setError(message)
      setStatus('error')
    }
  }, [])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
    setStatus('stopped')
  }, [])

  const reset = useCallback(() => {
    setAudioBlob(null)
    setError(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return { start, stop, reset, audioBlob, status, error, isSupported }
}
