'use client'

import { useEffect, useRef, useState } from 'react'
import { useAudioRecorder } from '@/lib/practice/use-audio-recorder'
import { Button } from '@/components/ui/button'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Correction } from '@/lib/correction/types'
import type { Language, TopicVocab } from '@/lib/topics'

const FREE_RECORDING_CAP_MS = 60_000

export type FreeRecordingPracticeProps = {
  language: Language
  topicTitle: string
  topicDescription: string
  vocabulary: TopicVocab[]
  practicePhrases: string[]
  freePrompt: string
  onCorrected?: () => void
}

export function FreeRecordingPractice({
  language,
  topicTitle,
  topicDescription,
  vocabulary,
  practicePhrases,
  freePrompt,
  onCorrected,
}: FreeRecordingPracticeProps) {
  const recorder = useAudioRecorder(FREE_RECORDING_CAP_MS)
  const t = useDict()
  const [transcript, setTranscript] = useState('')
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [correcting, setCorrecting] = useState(false)
  const [correctionError, setCorrectionError] = useState<string | null>(null)
  const onCorrectedRef = useRef(onCorrected)
  useEffect(() => {
    onCorrectedRef.current = onCorrected
  }, [onCorrected])

  // Step 1: when audio is ready, transcribe the recording.
  useEffect(() => {
    if (!recorder.audioBlob) return
    if (transcript || transcribing) return
    const blob = recorder.audioBlob

    ;(async () => {
      setTranscribing(true)
      setTranscribeError(null)

      // Bias the transcription toward the topic vocabulary (already in the
      // target language). The free prompt is in the native language, so passing
      // it would push the model toward that language's output — exactly what we
      // don't want when the user is practicing the target language.
      const transcribeHint = vocabulary.map((v) => v.term).join('. ')

      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('language', language)
      if (transcribeHint) formData.append('prompt', transcribeHint)

      try {
        const r = await fetch('/api/transcribe', { method: 'POST', body: formData })
        const data = await r.json()
        if (!r.ok || data.error) {
          throw new Error(data.message || data.error || 'transcription_failed')
        }
        setTranscript(data.transcript ?? '')
      } catch (err) {
        setTranscribeError(
          err instanceof Error ? err.message : t.practice.transcribeFail
        )
      } finally {
        setTranscribing(false)
      }
    })()
  }, [recorder.audioBlob, language, transcript, transcribing, vocabulary, t])

  // Step 2: when transcription is ready, ask Claude for feedback.
  useEffect(() => {
    if (!transcript || correction || correcting) return

    ;(async () => {
      setCorrecting(true)
      setCorrectionError(null)

      try {
        const r = await fetch('/api/correct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            topicTitle,
            topicDescription,
            vocabulary,
            practicePhrases,
            freePrompt,
            transcription: transcript,
          }),
        })
        const data = await r.json()
        if (!r.ok || data.error) {
          throw new Error(data.message || data.error || 'correction_failed')
        }
        setCorrection(data as Correction)
        onCorrectedRef.current?.()
      } catch (err) {
        setCorrectionError(
          err instanceof Error ? err.message : t.practice.correctFail
        )
      } finally {
        setCorrecting(false)
      }
    })()
  }, [
    transcript,
    correction,
    correcting,
    language,
    topicTitle,
    topicDescription,
    vocabulary,
    practicePhrases,
    freePrompt,
    t,
  ])

  function onRetry() {
    recorder.reset()
    setTranscript('')
    setTranscribing(false)
    setTranscribeError(null)
    setCorrection(null)
    setCorrecting(false)
    setCorrectionError(null)
  }

  const isRecording = recorder.status === 'recording'
  const hasResult = correction !== null

  return (
    <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-5">
      <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-2">
        🎙️ {t.practice.freeTitle}
      </p>
      <p className="text-lg sm:text-xl font-black text-stone-900 leading-snug mb-2">
        {freePrompt}
      </p>
      <p className="text-sm font-semibold text-stone-500 mb-5">
        {t.practice.freeHint(FREE_RECORDING_CAP_MS / 1000)}
      </p>

      <div className="flex flex-wrap gap-3">
        {recorder.isSupported && !isRecording && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={hasResult || transcript ? onRetry : recorder.start}
            disabled={transcribing || correcting}
          >
            🎤{' '}
            {hasResult || transcript
              ? t.practice.recordAgain
              : t.practice.startRecording}
          </Button>
        )}
        {recorder.isSupported && isRecording && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={recorder.stop}
          >
            ⏹ {t.practice.stop}
          </Button>
        )}
      </div>

      {!recorder.isSupported && (
        <p className="text-xs font-bold text-amber-700 mt-3">
          ⚠️ {t.practice.noRecorder}
        </p>
      )}

      {isRecording && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700 flex items-center justify-between gap-3">
          <div>
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse mr-2 align-middle" />
            {t.practice.recordingHintFree}
          </div>
          <div className="font-black tabular-nums">
            {Math.floor(recorder.elapsedMs / 1000)}s /{' '}
            {recorder.maxDurationMs / 1000}s
          </div>
        </div>
      )}

      {transcribing && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-emerald-700">
          <span className="inline-block animate-pulse mr-2">🤖</span>
          {t.practice.transcribing}
        </div>
      )}

      {transcribeError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700">
          ⚠️ {transcribeError}
        </div>
      )}

      {correcting && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-emerald-700">
          <span className="inline-block animate-pulse mr-2">✨</span>
          {t.practice.analyzing}
        </div>
      )}

      {correctionError && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 mt-4 text-sm font-bold text-red-700">
          ⚠️ {correctionError}
        </div>
      )}

      {transcript && (
        <div className="mt-5 bg-white border-2 border-stone-100 rounded-2xl p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
            {t.practice.whatYouSaid}
          </p>
          <p className="text-stone-700 font-semibold leading-relaxed">
            {transcript}
          </p>
        </div>
      )}

      {correction && (
        <div className="mt-4 space-y-3">
          <div className="bg-white border-2 border-emerald-200 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-2">
              ✨ {t.practice.correctedVersion}
            </p>
            <p className="text-stone-800 font-bold leading-relaxed">
              {correction.corrected}
            </p>
          </div>

          {correction.vocabUsed.length > 0 && (
            <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
                {t.practice.vocabUsed}
              </p>
              <div className="flex flex-wrap gap-2">
                {correction.vocabUsed.map((v) => (
                  <span
                    key={v}
                    className="bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  >
                    ✓ {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {correction.vocabSuggested.length > 0 && (
            <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
                {t.practice.vocabSuggested}
              </p>
              <div className="flex flex-wrap gap-2">
                {correction.vocabSuggested.map((v) => (
                  <span
                    key={v}
                    className="bg-amber-100 text-amber-800 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {correction.grammarTips.length > 0 && (
            <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
                {t.practice.grammarTips}
              </p>
              <ul className="space-y-1.5">
                {correction.grammarTips.map((tip, i) => (
                  <li
                    key={i}
                    className={cn(
                      'text-sm font-semibold text-stone-700',
                      'before:content-["•"] before:text-emerald-500 before:font-black before:mr-2'
                    )}
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white border-2 border-stone-100 rounded-2xl p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-2">
              {t.practice.fluency}
            </p>
            <p className="text-sm font-semibold text-stone-700 leading-relaxed">
              {correction.fluency}
            </p>
          </div>
        </div>
      )}

      {recorder.error && (
        <p className="text-sm font-bold text-red-700 mt-3">
          {t.practice.micError(recorder.error)}
        </p>
      )}
    </div>
  )
}
