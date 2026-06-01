'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { comparePhrase, type DiffState } from '@/lib/practice/diff'
import { useAudioRecorder } from '@/lib/practice/use-audio-recorder'
import { useTTS } from '@/lib/practice/use-tts'
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
  onPracticed?: () => void
}

export function PracticeCard({
  phrase,
  language,
  topicSlug,
  profileId,
  onPracticed,
}: PracticeCardProps) {
  const recorder = useAudioRecorder()
  const synthesis = useTTS()
  const [transcript, setTranscript] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const saveTriggeredRef = useRef(false)
  const onPracticedRef = useRef(onPracticed)
  useEffect(() => {
    onPracticedRef.current = onPracticed
  }, [onPracticed])

  const diff = useMemo(
    () => (transcript ? comparePhrase(phrase, transcript) : null),
    [phrase, transcript]
  )

  const supabase = useMemo(() => createClient(), [])

  // When the audio blob is ready, send it to /api/transcribe.
  useEffect(() => {
    if (!recorder.audioBlob) return
    if (transcript || transcribing) return

    setTranscribing(true)
    setTranscribeError(null)

    const formData = new FormData()
    formData.append('audio', recorder.audioBlob, 'recording.webm')
    formData.append('language', language)
    // Strip [placeholders] so Whisper isn't biased to repeat the literal
    // bracket text; it just gets context about the surrounding vocabulary.
    formData.append(
      'prompt',
      phrase.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim()
    )

    fetch('/api/transcribe', { method: 'POST', body: formData })
      .then(async (r) => {
        const data = await r.json()
        if (!r.ok || data.error) {
          throw new Error(data.message || data.error || 'transcription_failed')
        }
        setTranscript(data.transcript ?? '')
      })
      .catch((err) => {
        setTranscribeError(
          err instanceof Error ? err.message : 'No se pudo transcribir'
        )
      })
      .finally(() => {
        setTranscribing(false)
      })
  }, [recorder.audioBlob, language, transcript, transcribing])

  // Auto-save the result once we have a transcript + diff.
  useEffect(() => {
    if (!transcript || !diff) return
    if (saveTriggeredRef.current) return
    saveTriggeredRef.current = true
    onPracticedRef.current?.()
    setSaveState('saving')
    supabase
      .from('recordings')
      .insert({
        profile_id: profileId,
        topic_slug: topicSlug,
        transcription: transcript,
        corrected_text: `score=${diff.score}; expected="${phrase}"`,
      })
      .then(({ error }) => {
        setSaveState(error ? 'error' : 'saved')
      })
  }, [diff, phrase, profileId, supabase, topicSlug, transcript])

  const onRetry = () => {
    recorder.reset()
    setTranscript('')
    setTranscribeError(null)
    setSaveState('idle')
    saveTriggeredRef.current = false
  }

  if (!recorder.isSupported && !synthesis.isSupported) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-sm font-bold text-amber-900">
        ⚠️ Tu navegador no soporta grabación ni síntesis de voz. Prueba en
        Chrome o Safari.
      </div>
    )
  }

  const isRecording = recorder.status === 'recording'
  const showRetry = transcript !== '' || transcribeError !== null

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
        {recorder.isSupported && !isRecording && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={showRetry ? onRetry : recorder.start}
            disabled={transcribing}
          >
            🎤 {showRetry ? 'Reintentar' : 'Grabar'}
          </Button>
        )}
        {recorder.isSupported && isRecording && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={recorder.stop}
          >
            ⏹ Parar
          </Button>
        )}
      </div>

      {!recorder.isSupported && (
        <p className="text-xs font-bold text-amber-700 mt-3">
          ⚠️ Tu navegador no soporta la grabación de audio — usa Chrome o
          Safari para grabarte.
        </p>
      )}

      {isRecording && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse mr-2 align-middle" />
          Grabando… habla con claridad.
        </div>
      )}

      {transcribing && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-emerald-700">
          <span className="inline-block animate-pulse mr-2">🤖</span>
          Transcribiendo con Whisper…
        </div>
      )}

      {transcribeError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700">
          ⚠️ {transcribeError}
        </div>
      )}

      {transcript !== '' && diff && (
        <div className="mt-5 space-y-4">
          <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
              Lo que dijiste
            </p>
            <p className="text-stone-700 font-semibold">
              {transcript || '(silencio)'}
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

      {recorder.error && (
        <p className="text-sm font-bold text-red-700 mt-3">
          Error: {recorder.error}. Asegúrate de haber dado permiso al
          micrófono.
        </p>
      )}
    </div>
  )
}
