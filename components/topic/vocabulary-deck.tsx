'use client'

import { useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { cn } from '@/lib/utils'
import type { Language, TopicVocab } from '@/lib/topics'

type Props = {
  vocabulary: TopicVocab[]
  language: Language
}

export function VocabularyDeck({ vocabulary, language }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState(false)
  const synthesis = useTTS()

  if (vocabulary.length === 0) return null

  const card = vocabulary[currentIdx]
  const isLast = currentIdx === vocabulary.length - 1

  function advance() {
    if (!revealed) {
      setRevealed(true)
      return
    }
    if (isLast) {
      setDone(true)
    } else {
      setCurrentIdx(currentIdx + 1)
      setRevealed(false)
    }
  }

  function restart() {
    setCurrentIdx(0)
    setRevealed(false)
    setDone(false)
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-5xl mb-3">✅</p>
        <p className="text-xl font-black text-stone-900 mb-2">
          ¡Vocabulario completado!
        </p>
        <p className="text-sm font-semibold text-stone-600 mb-4">
          Repasaste {vocabulary.length}{' '}
          {vocabulary.length === 1 ? 'palabra' : 'palabras'}.
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

  const progressPct =
    ((currentIdx + (revealed ? 1 : 0)) / vocabulary.length) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0">
          {currentIdx + 1} / {vocabulary.length}
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={advance}
        className={cn(
          'w-full bg-white border-2 rounded-2xl px-6 py-8 text-center transition-all duration-150',
          'hover:-translate-y-0.5 active:translate-y-0.5',
          revealed
            ? 'border-emerald-300'
            : 'border-stone-200 hover:border-emerald-300'
        )}
      >
        <p className="text-3xl font-black text-stone-900">{card.term}</p>
        {revealed ? (
          <p className="mt-4 text-2xl font-bold text-emerald-600">
            {card.translation}
          </p>
        ) : (
          <p className="mt-4 text-sm font-bold text-stone-400">
            Toca para revelar 👀
          </p>
        )}
        {revealed && (
          <p className="mt-6 text-[11px] font-black uppercase tracking-wider text-stone-400">
            {isLast ? 'Toca para terminar ✓' : 'Toca para siguiente →'}
          </p>
        )}
      </button>

      {synthesis.isSupported && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => synthesis.speak(card.term, language)}
            disabled={synthesis.isSpeaking}
            className="text-sm font-bold text-stone-500 hover:text-emerald-600 disabled:opacity-50 transition-colors"
          >
            🔊 {synthesis.isSpeaking ? 'Sonando…' : 'Escuchar palabra'}
          </button>
        </div>
      )}
    </div>
  )
}
