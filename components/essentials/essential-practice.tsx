'use client'

import { useEffect, useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import { Button } from '@/components/ui/button'
import { ExampleCard } from '@/components/essentials/example-card'
import { cn } from '@/lib/utils'
import type { EssentialItem } from '@/content/essentials/types'
import type { Language, Level } from '@/lib/topics'

type Props = {
  items: EssentialItem[]
  /** Native-language labels for each conjugated form (empty for non-verbs). */
  formLabels: string[]
  language: Language
  /** The learner's level — the tab shown first. */
  userLevel: Level
}

const LEVEL_ORDER: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

// One synced practice screen, filtered by level tabs: the studied word up top
// (with 🔊 under it and its conjugation), Prev/Next side by side, and — below —
// the example sentences for whichever word is on screen (ExampleCard).
export function EssentialPractice({
  items,
  formLabels,
  language,
  userLevel,
}: Props) {
  const synthesis = useTTS()
  const t = useDict()

  const levels = LEVEL_ORDER.filter((l) => items.some((i) => i.level === l))
  const [activeLevel, setActiveLevel] = useState<Level>(
    levels.includes(userLevel) ? userLevel : levels[0]
  )
  const [currentIdx, setCurrentIdx] = useState(0)

  const spoken = (item: EssentialItem) => (item.forms ?? [item.term]).join(', ')

  const { prefetch } = synthesis
  useEffect(() => {
    items.forEach((item) => prefetch(spoken(item)))
  }, [items, prefetch])

  const levelItems = items.filter((i) => i.level === activeLevel)
  if (levelItems.length === 0) return null

  const idx = Math.min(currentIdx, levelItems.length - 1)
  const item = levelItems[idx]
  const forms = item.forms
  const examples = item.examples ?? []

  function selectLevel(level: Level) {
    setActiveLevel(level)
    setCurrentIdx(0)
  }

  return (
    <div className="space-y-6">
      {/* Level tabs */}
      {levels.length > 1 && (
        <div className="flex gap-2">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => selectLevel(level)}
              className={cn(
                'flex-1 text-xs font-black uppercase tracking-wider px-3 py-2 rounded-2xl border-2 transition-colors',
                level === activeLevel
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-300'
              )}
            >
              {t.common.levels[level]}
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0">
          {idx + 1} / {levelItems.length}
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((idx + 1) / levelItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Studied word */}
      <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6 text-center">
        <p className="text-3xl sm:text-4xl font-black text-emerald-600 leading-tight">
          {item.term}
        </p>
        {synthesis.isSupported && (
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => synthesis.speak(spoken(item), language)}
              disabled={synthesis.isSpeaking}
            >
              🔊 {synthesis.isSpeaking ? t.deck.playing : t.practice.listen}
            </Button>
          </div>
        )}
        <p className="text-sm font-bold text-stone-400 mt-3">{item.translation}</p>

        {forms && forms.length > 0 && (
          <div className="grid grid-cols-3 gap-2 border-t-2 border-stone-100 mt-5 pt-4">
            {forms.map((form, i) => (
              <div key={i}>
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  {formLabels[i] ?? ''}
                </p>
                <p className="text-lg sm:text-xl font-black text-stone-900 leading-tight break-words">
                  {form}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prev / Next side by side */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={() => setCurrentIdx(Math.max(0, idx - 1))}
          disabled={idx === 0}
        >
          {t.deck.prev}
        </Button>
        <Button
          type="button"
          size="md"
          className="flex-1"
          onClick={() => setCurrentIdx(Math.min(levelItems.length - 1, idx + 1))}
          disabled={idx === levelItems.length - 1}
        >
          {t.deck.next}
        </Button>
      </div>

      {/* Example sentences for the current word (synced; remounts per word). */}
      {examples.length > 0 && (
        <div>
          <h2 className="text-lg font-black text-stone-900 mb-3">
            {t.essentials.examplesTitle}
          </h2>
          <ExampleCard
            key={`${activeLevel}-${idx}`}
            examples={examples}
            language={language}
          />
        </div>
      )}
    </div>
  )
}
