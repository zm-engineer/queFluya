'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PracticeCard } from '@/components/practice/practice-card'
import { Button } from '@/components/ui/button'
import type { Language } from '@/lib/topics'

type Props = {
  phrases: string[]
  language: Language
  topicSlug: string
  profileId: string
  onPracticedCountChange?: (count: number) => void
}

export function PhraseDeck({
  phrases,
  language,
  topicSlug,
  profileId,
  onPracticedCountChange,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [practiced, setPracticed] = useState<Set<number>>(new Set())
  const [done, setDone] = useState(false)

  const onPracticedCountChangeRef = useRef(onPracticedCountChange)
  useEffect(() => {
    onPracticedCountChangeRef.current = onPracticedCountChange
  }, [onPracticedCountChange])

  useEffect(() => {
    onPracticedCountChangeRef.current?.(practiced.size)
  }, [practiced])

  const handlePracticed = useCallback(() => {
    setPracticed((prev) => {
      const next = new Set(prev)
      next.add(currentIdx)
      return next
    })
  }, [currentIdx])

  if (phrases.length === 0) return null

  const isLast = currentIdx === phrases.length - 1
  const isPracticed = practiced.has(currentIdx)

  function next() {
    if (isLast) {
      setDone(true)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  function restart() {
    setCurrentIdx(0)
    setPracticed(new Set())
    setDone(false)
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-5xl mb-3">🎤</p>
        <p className="text-xl font-black text-stone-900 mb-2">
          ¡Frases practicadas!
        </p>
        <p className="text-sm font-semibold text-stone-600 mb-4">
          Practicaste {practiced.size} de {phrases.length}.
        </p>
        <button
          type="button"
          onClick={restart}
          className="text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          ↺ Repetir desde el inicio
        </button>
      </div>
    )
  }

  const progressPct = (practiced.size / phrases.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0">
          {currentIdx + 1} / {phrases.length}
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <PracticeCard
        key={`phrase-${currentIdx}`}
        phrase={phrases[currentIdx]}
        language={language}
        topicSlug={topicSlug}
        profileId={profileId}
        onPracticed={handlePracticed}
      />

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="text-sm font-black text-stone-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        <Button size="md" onClick={next} disabled={!isPracticed}>
          {isLast ? 'Terminar ✓' : 'Siguiente →'}
        </Button>
      </div>

      {!isPracticed && (
        <p className="text-xs font-bold text-stone-400 text-center">
          Practica la frase para desbloquear el siguiente paso
        </p>
      )}
    </div>
  )
}
