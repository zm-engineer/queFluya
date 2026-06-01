'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { comparePhrase, type DiffState } from '@/lib/practice/diff'
import { useSpeechRecognition } from '@/lib/practice/use-speech-recognition'
import { useSpeechSynthesis } from '@/lib/practice/use-speech-synthesis'
import { Button } from '@/components/ui/button'
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
  const saveTriggeredRef = useRef(false)

  const diff = useMemo(
    () =>
      recognition.status === 'stopped' || recognition.status === 'recording'
        ? comparePhrase(phrase, recognition.transcript)
        : null,
    [phrase, recognition.status, recognition.transcript]
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (recognition.status !== 'stopped' || !diff) return
    if (saveTriggeredRef.current) return
    saveTriggeredRef.current = true
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
        setSaveState(error ? 'error' : 'saved')
      })
  }, [
    diff,
    phrase,
    profileId,
    recognition.status,
    recognition.transcript,
    supabase,
    topicSlug,
  ])

  const onRetry = () => {
    recognition.reset()
    setSaveState('idle')
    saveTriggeredRef.current = false
  }

  if (!recognition.isSupported && !synthesis.isSupported) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm font-bold text-amber-900">
        ⚠️ Tu navegador no soporta reconocimiento ni síntesis de voz. Prueba en
        Chrome o Safari.
      </div>
    )
  }

  return (
    <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5">
      <p className="text-xl sm:text-2xl font-black text-stone-900 leading-snug mb-5">
        {phrase}
      </p>

      <div className="flex flex-wrap gap-3 mb-2">
        {synthesis.isSupported && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => synthesis.speak(phrase, language)}
            disabled={synthesis.isSpeaking}
          >
            🔊 {synthesis.isSpeaking ? 'Sonando…' : 'Escuchar'}
          </Button>
        )}
        {recognition.isSupported && recognition.status !== 'recording' && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={
              recognition.status === 'stopped' ? onRetry : recognition.start
            }
          >
            🎤 {recognition.status === 'stopped' ? 'Reintentar' : 'Grabar'}
          </Button>
        )}
        {recognition.isSupported && recognition.status === 'recording' && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={recognition.stop}
          >
            ⏹ Parar
          </Button>
        )}
      </div>

      {!recognition.isSupported && (
        <p className="text-xs font-bold text-amber-700 mt-3">
          ⚠️ Tu navegador no soporta el reconocimiento de voz — usa Chrome o
          Safari para grabarte.
        </p>
      )}

      {recognition.status === 'recording' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse mr-2 align-middle" />
          Grabando…{' '}
          {recognition.transcript && (
            <span className="text-stone-600 font-semibold">
              «{recognition.transcript}»
            </span>
          )}
        </div>
      )}

      {recognition.status === 'stopped' && diff && (
        <div className="mt-5 space-y-4">
          <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Lo que dijiste
            </p>
            <p className="text-stone-700 font-semibold">
              {recognition.transcript || '(silencio)'}
            </p>
          </div>

          <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Análisis
            </p>
            <p className="text-lg font-bold leading-relaxed flex flex-wrap gap-x-2 gap-y-1">
              {diff.words.length === 0 ? (
                <span className="text-stone-400 italic font-semibold">
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

          <div className="flex items-center justify-between gap-4 bg-white border-2 border-stone-100 rounded-2xl p-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
                Aciertos
              </p>
              <p
                className={cn(
                  'text-3xl font-black',
                  diff.score >= 80
                    ? 'text-emerald-600'
                    : diff.score >= 50
                      ? 'text-amber-600'
                      : 'text-red-500'
                )}
              >
                {diff.score}%
                <span className="text-sm font-bold text-stone-400 ml-2">
                  ({diff.matchCount}/{diff.totalExpected})
                </span>
              </p>
            </div>
            <div className="text-xs font-bold text-stone-400 text-right">
              {saveState === 'saving' && 'Guardando…'}
              {saveState === 'saved' && (
                <span className="text-emerald-600">✓ Guardado</span>
              )}
              {saveState === 'error' && (
                <span className="text-red-500">No se pudo guardar</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-wider pt-1">
            {STATE_LEGEND.map(({ state, label }) => (
              <span key={state} className={cn(STATE_CLASS[state])}>
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {recognition.error && (
        <p className="text-sm font-bold text-red-700 mt-3">
          Error: {recognition.error}. Asegúrate de haber dado permiso al
          micrófono.
        </p>
      )}
    </div>
  )
}
