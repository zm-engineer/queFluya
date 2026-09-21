'use client'

import { useEffect, useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import { Button } from '@/components/ui/button'
import { ExampleCard } from '@/components/essentials/example-card'
import type { EssentialItem } from '@/content/essentials/types'
import type { Language } from '@/lib/topics'

type Props = {
  items: EssentialItem[]
  /** Native-language labels for each conjugated form (empty for non-verbs). */
  formLabels: string[]
  language: Language
}

// One synced practice screen showing every item in the set (no level filter —
// verbs/phrasal are studied as a whole list): the studied word up top (with 🔊
// under it and its conjugation), Prev/Next side by side, and — below — the
// example sentences for whichever word is on screen (ExampleCard).
export function EssentialPractice({ items, formLabels, language }: Props) {
  const synthesis = useTTS()
  const t = useDict()

  const [currentIdx, setCurrentIdx] = useState(0)

  const { prefetch } = synthesis
  // Warm each word on its own (the term + every conjugated form) so its 🔊 plays
  // instantly — we no longer read all forms joined into one muddled audio.
  useEffect(() => {
    items.forEach((item) => {
      prefetch(item.term, language)
      item.forms?.forEach((form) => prefetch(form, language))
    })
  }, [items, prefetch, language])

  if (items.length === 0) return null

  const idx = Math.min(currentIdx, items.length - 1)
  const item = items[idx]
  const forms = item.forms
  const examples = item.examples ?? []

  // Icon-only listen button that speaks a SINGLE word (a term or one form).
  const renderListen = (text: string, size: 'sm' | 'md' = 'md') => {
    if (!synthesis.isSupported) return null
    const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
    return (
      <button
        type="button"
        onClick={() => synthesis.speak(text, language)}
        disabled={synthesis.isSpeaking}
        aria-label={t.practice.listen}
        className={`shrink-0 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 transition-colors ${dim}`}
      >
        🔊
      </button>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0">
          {idx + 1} / {items.length}
        </div>
        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((idx + 1) / items.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Studied word */}
      <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <p className="text-3xl sm:text-4xl font-black text-emerald-600 leading-tight">
            {item.term}
          </p>
          {/* Phrasal verbs have no forms grid, so the headword carries its own 🔊.
              Irregular verbs list the base form in the grid below, each with its
              own icon, so we don't duplicate one on the term. */}
          {(!forms || forms.length === 0) && renderListen(item.term)}
        </div>
        <p className="text-sm font-bold text-stone-400 mt-3">{item.translation}</p>

        {forms && forms.length > 0 && (
          <div className="grid grid-cols-3 gap-2 border-t-2 border-stone-100 mt-5 pt-4">
            {forms.map((form, i) => (
              <div key={i} className="flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                  {formLabels[i] ?? ''}
                </p>
                <p className="text-lg sm:text-xl font-black text-stone-900 leading-tight break-words">
                  {form}
                </p>
                <div className="mt-1.5">{renderListen(form, 'sm')}</div>
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
          onClick={() => setCurrentIdx(Math.min(items.length - 1, idx + 1))}
          disabled={idx === items.length - 1}
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
          <ExampleCard key={idx} examples={examples} language={language} />
        </div>
      )}
    </div>
  )
}
