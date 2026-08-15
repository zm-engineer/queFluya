'use client'

import { useEffect, useState } from 'react'
import { useTTS } from '@/lib/practice/use-tts'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'
import type { Language, TopicDialogueLine } from '@/lib/topics'

type Props = {
  dialogue: TopicDialogueLine[]
  language: Language
}

export function DialogueViewer({ dialogue, language }: Props) {
  const synthesis = useTTS()
  const t = useDict()
  const [activeLine, setActiveLine] = useState<number | null>(null)

  const { prefetch } = synthesis
  useEffect(() => {
    dialogue.forEach((line) => prefetch(line.text))
  }, [dialogue, prefetch])

  if (dialogue.length === 0) return null

  function playLine(idx: number) {
    setActiveLine(idx)
    synthesis.speak(dialogue[idx].text, language)
  }

  return (
    <div className="bg-stone-50 rounded-2xl px-3 py-3 space-y-1">
      {dialogue.map((line, idx) => {
        const isActive = activeLine === idx && synthesis.isSpeaking
        return (
          <div
            key={idx}
            className={cn(
              'flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors',
              isActive && 'bg-emerald-100'
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 pt-1.5 min-w-[5rem]">
              {line.speaker}
            </span>
            <p className="text-stone-800 font-semibold leading-relaxed flex-1">
              {line.text}
            </p>
            {synthesis.isSupported && (
              <button
                type="button"
                onClick={() => playLine(idx)}
                className="text-lg hover:scale-110 active:scale-95 transition-transform shrink-0 mt-0.5"
                aria-label={t.deck.listenLine(idx + 1)}
              >
                {isActive ? '🔉' : '🔊'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
