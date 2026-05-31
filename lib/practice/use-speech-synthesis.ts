'use client'

import { useCallback, useEffect, useState } from 'react'
import { BCP47 } from './types'
import type { Language } from '@/lib/topics'

export type UseSpeechSynthesis = {
  speak: (text: string, language: Language) => void
  cancel: () => void
  isSpeaking: boolean
  isSupported: boolean
}

/**
 * React wrapper around window.speechSynthesis. Uses the platform voices so
 * quality varies by OS. Cancels any current utterance before starting a new
 * one so rapid clicks don't queue up.
 */
export function useSpeechSynthesis(): UseSpeechSynthesis {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    setIsSupported('speechSynthesis' in window)
  }, [])

  const speak = useCallback((text: string, language: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = BCP47[language]
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { speak, cancel, isSpeaking, isSupported }
}
