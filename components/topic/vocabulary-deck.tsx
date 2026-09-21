'use client'

import { useEffect, useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Language, TopicVocab } from '@/lib/topics'

type Props = {
  vocabulary: TopicVocab[]
  language: Language
}

export function VocabularyDeck({ vocabulary, language }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [done, setDone] = useState(false)
  const synthesis = useTTS()
  const t = useDict()

  const { prefetch } = synthesis
  useEffect(() => {
    vocabulary.forEach((v) => prefetch(v.term, language))
  }, [vocabulary, prefetch, language])

  if (vocabulary.length === 0) return null

  const card = vocabulary[currentIdx]
  const isLast = currentIdx === vocabulary.length - 1

  // Term and translation are both shown up front (no reveal step); tapping the
  // card just advances, so the learner browses many terms with quick taps.
  function next() {
    if (isLast) {
      setDone(true)
    } else {
      setCurrentIdx(currentIdx + 1)
    }
  }

  function prev() {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1)
  }

  function restart() {
    setCurrentIdx(0)
    setDone(false)
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-5xl mb-3">✅</p>
        <p className="text-xl font-black text-stone-900 mb-2">
          {t.deck.vocabDone}
        </p>
        <p className="text-sm font-semibold text-stone-600 mb-4">
          {t.deck.reviewedWords(vocabulary.length)}
        </p>
        <button
          type="button"
          onClick={restart}
          className="text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {t.deck.restart}
        </button>
      </div>
    )
  }

  const progressPct = ((currentIdx + 1) / vocabulary.length) * 100

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
        onClick={next}
        className={cn(
          'w-full bg-white border-2 border-stone-200 rounded-2xl px-6 py-8 text-center transition-all duration-150',
          'hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5'
        )}
      >
        <p className="text-3xl font-black text-stone-900">{card.term}</p>
        <p className="mt-3 text-2xl font-bold text-emerald-600">
          {card.translation}
        </p>
        <p className="mt-6 text-[11px] font-black uppercase tracking-wider text-stone-400">
          {isLast ? t.deck.tapFinish : t.deck.tapNext}
        </p>
      </button>

      <div className="flex items-center justify-center gap-5">
        {currentIdx > 0 && (
          <button
            type="button"
            onClick={prev}
            className="text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
          >
            {t.deck.prev}
          </button>
        )}
        {synthesis.isSupported && (
          <button
            type="button"
            onClick={() => synthesis.speak(card.term, language)}
            disabled={synthesis.isSpeaking}
            className="text-sm font-bold text-stone-500 hover:text-emerald-600 disabled:opacity-50 transition-colors"
          >
            🔊 {synthesis.isSpeaking ? t.deck.playing : t.deck.listenWord}
          </button>
        )}
      </div>
    </div>
  )
}
