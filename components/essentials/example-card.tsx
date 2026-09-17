'use client'

import { useEffect, useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import { Button } from '@/components/ui/button'
import type { EssentialExample } from '@/content/essentials/types'
import type { Language } from '@/lib/topics'

type Props = {
  examples: EssentialExample[]
  language: Language
}

// One card that shows a single example at a time, with a small in-card "next" to
// cycle through the list. To reset it (e.g. when the studied word changes),
// remount it with a `key`.
export function ExampleCard({ examples, language }: Props) {
  const synthesis = useTTS()
  const t = useDict()
  const [idx, setIdx] = useState(0)

  const { prefetch } = synthesis
  useEffect(() => {
    examples.forEach((e) => prefetch(e.text))
  }, [examples, prefetch])

  if (examples.length === 0) return null

  const ex = examples[Math.min(idx, examples.length - 1)]

  // Emphasize the studied form inside the sentence (first occurrence).
  const at = ex.highlight ? ex.text.indexOf(ex.highlight) : -1
  const body =
    at === -1 || !ex.highlight ? (
      ex.text
    ) : (
      <>
        {ex.text.slice(0, at)}
        <span className="text-emerald-600 underline decoration-emerald-400 decoration-2 underline-offset-2">
          {ex.text.slice(at, at + ex.highlight.length)}
        </span>
        {ex.text.slice(at + ex.highlight.length)}
      </>
    )

  return (
    <div className="bg-white border-2 border-stone-100 rounded-2xl p-5">
      <p className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
        {body}
      </p>
      <p className="text-sm font-semibold text-stone-500 mt-1 mb-4">
        {ex.translation}
      </p>
      <div className="flex items-center justify-between gap-3">
        {synthesis.isSupported ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => synthesis.speak(ex.text, language)}
            disabled={synthesis.isSpeaking}
          >
            🔊 {synthesis.isSpeaking ? t.deck.playing : t.practice.listen}
          </Button>
        ) : (
          <span />
        )}
        {examples.length > 1 && (
          <button
            type="button"
            onClick={() => setIdx((i) => (i + 1) % examples.length)}
            className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors shrink-0"
          >
            {idx + 1}/{examples.length} · {t.deck.next}
          </button>
        )}
      </div>
    </div>
  )
}
