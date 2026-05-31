'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { comparePhrase, type DiffState } from '@/lib/practice/diff'
import { useSpeechRecognition } from '@/lib/practice/use-speech-recognition'
import { useSpeechSynthesis } from '@/lib/practice/use-speech-synthesis'
import { cn } from '@/lib/utils'
import type { Language } from '@/lib/topics'

const STATE_CLASS: Record<DiffState, string> = {
  match: 'text-emerald-700',
  mistake: 'text-red-600 underline decoration-red-600 decoration-2',
  missing:
    'text-red-400 italic underline decoration-dashed decoration-red-300',
  extra: 'text-stone-400 line-through',
}

const STATE_LEGEND: { state: DiffState; label: string }[] = [
  { state: 'match', label: 'Bien' },
  { state: 'mistake', label: 'Diferente' },
  { state: 'missing', label: 'Te faltó' },
  { state: 'extra', label: 'De más' },
]

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export type PracticeCardProps = {
  phrase: string
  language: Language
  topicSlug: string
  profileId: string
}

export function PracticeCard({
  phrase,
  language,
  topicSlug,
  profileId,
}: PracticeCardProps) {
  const recognition = useSpeechRecognition(language)
  const synthesis = useSpeechSynthesis()
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const diff = useMemo(
    () =>
      recognition.status === 'stopped' || recognition.status === 'recording'
        ? comparePhrase(phrase, recognition.transcript)
        : null,
    [phrase, recognition.status, recognition.transcript]
  )

  const supabase = useMemo(() => createClient(), [])

  // Auto-save the result once the user stops recording.
  useEffect(() => {
    if (recognition.status !== 'stopped' || !diff) return
    if (saveState !== 'idle') return
    let cancelled = false
    setSaveState('saving')
    supabase
      .from('recordings')
      .insert({
        profile_id: profileId,
        topic_slug: topicSlug,
        transcription: recognition.transcript,
        corrected_text: `score=${diff.score}; expected="${phrase}"`,
      })
      .then(({ error }) => {
        if (cancelled) return
        setSaveState(error ? 'error' : 'saved')
      })
    return () => {
      cancelled = true
    }
  }, [
    diff,
    phrase,
    profileId,
    recognition.status,
    recognition.transcript,
    saveState,
    supabase,
    topicSlug,
  ])

  const onRetry = () => {
    recognition.reset()
    setSaveState('idle')
  }

  if (!recognition.isSupported && !synthesis.isSupported) {
    return (
      <div className="border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
        Tu navegador no soporta reconocimiento ni síntesis de voz. Prueba en
        Chrome o Safari.
      </div>
    )
  }

  return (
    <div className="border border-stone-200 bg-white p-6">
      <p className="font-serif text-xl text-stone-900 leading-relaxed mb-5 border-l-2 border-emerald-700 pl-4">
        {phrase}
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        {synthesis.isSupported && (
          <button
            type="button"
            onClick={() => synthesis.speak(phrase, language)}
            disabled={synthesis.isSpeaking}
            className="text-sm border border-stone-300 px-4 py-2 hover:border-emerald-700 hover:text-emerald-800 transition-colors disabled:opacity-50"
          >
            🔊 {synthesis.isSpeaking ? 'Sonando…' : 'Escuchar'}
          </button>
        )}
        {recognition.isSupported && recognition.status !== 'recording' && (
          <button
            type="button"
            onClick={recognition.status === 'stopped' ? onRetry : recognition.start}
            className="text-sm bg-emerald-800 text-stone-50 px-4 py-2 hover:bg-emerald-900 transition-colors"
          >
            🎤 {recognition.status === 'stopped' ? 'Reintentar' : 'Grabar'}
          </button>
        )}
        {recognition.isSupported && recognition.status === 'recording' && (
          <button
            type="button"
            onClick={recognition.stop}
            className="text-sm bg-red-600 text-stone-50 px-4 py-2 hover:bg-red-700 transition-colors"
          >
            ⏹ Parar
          </button>
        )}
      </div>

      {!recognition.isSupported && (
        <p className="text-xs text-amber-700">
          Tu navegador no soporta el reconocimiento de voz — usa Chrome o
          Safari para grabarte.
        </p>
      )}

      {recognition.status === 'recording' && (
        <div className="text-sm text-stone-600 mt-2">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2 align-middle" />
          Grabando… {recognition.transcript && `«${recognition.transcript}»`}
        </div>
      )}

      {recognition.status === 'stopped' && diff && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Lo que dijiste
            </p>
            <p className="text-stone-700">
              {recognition.transcript || '(silencio)'}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Análisis
            </p>
            <p className="font-serif text-lg leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
              {diff.words.length === 0 ? (
                <span className="text-stone-400 italic">
                  No se detectó ninguna palabra
                </span>
              ) : (
                diff.words.map((w, i) => (
                  <span key={i} className={cn(STATE_CLASS[w.state])}>
                    {w.text}
                  </span>
                ))
              )}
            </p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-500">
                Aciertos
              </p>
              <p
                className={cn(
                  'font-serif text-2xl',
                  diff.score >= 80
                    ? 'text-emerald-700'
                    : diff.score >= 50
                      ? 'text-amber-700'
                      : 'text-red-600'
                )}
              >
                {diff.score}%
                <span className="text-sm text-stone-500 ml-2">
                  ({diff.matchCount}/{diff.totalExpected})
                </span>
              </p>
            </div>
            <div className="text-xs text-stone-500">
              {saveState === 'saving' && 'Guardando…'}
              {saveState === 'saved' && '✓ Guardado'}
              {saveState === 'error' && 'No se pudo guardar'}
            </div>
          </div>

          <div className="flex gap-3 text-[10px] uppercase tracking-widest text-stone-500 pt-2 border-t border-stone-100">
            {STATE_LEGEND.map(({ state, label }) => (
              <span key={state} className={cn(STATE_CLASS[state])}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {recognition.error && (
        <p className="text-sm text-red-700 mt-3">
          Error: {recognition.error}. Asegúrate de haber dado permiso al
          micrófono.
        </p>
      )}
    </div>
  )
}
