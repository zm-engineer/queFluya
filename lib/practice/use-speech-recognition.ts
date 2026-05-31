'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BCP47 } from './types'
import type { Language } from '@/lib/topics'

type Status = 'idle' | 'recording' | 'stopped' | 'error'

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionEvent = {
  resultIndex: number
  results: {
    isFinal: boolean
    0: { transcript: string }
    length: number
  }[]
}

type SpeechRecognitionErrorEvent = { error: string }

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
}

export type UseSpeechRecognition = {
  start: () => void
  stop: () => void
  reset: () => void
  transcript: string
  status: Status
  error: string | null
  isSupported: boolean
}

/**
 * React wrapper around the browser SpeechRecognition API. Returns the running
 * transcript while the user speaks. No-op (and `isSupported = false`) in
 * Firefox or any environment without the API.
 */
export function useSpeechRecognition(
  language: Language
): UseSpeechRecognition {
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const Ctor =
    typeof window !== 'undefined'
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined
  const isSupported = Boolean(Ctor)

  const start = useCallback(() => {
    if (!Ctor) return
    setTranscript('')
    setError(null)

    const recognition = new Ctor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = BCP47[language]

    recognition.onresult = (event) => {
      let chunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          chunk += event.results[i][0].transcript + ' '
        }
      }
      if (chunk) setTranscript((prev) => (prev + chunk).trim())
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setStatus('error')
    }

    recognition.onend = () => {
      setStatus((current) => (current === 'recording' ? 'stopped' : current))
    }

    recognition.start()
    recognitionRef.current = recognition
    setStatus('recording')
  }, [Ctor, language])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setStatus('stopped')
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  return { start, stop, reset, transcript, status, error, isSupported }
}
