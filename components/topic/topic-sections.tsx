'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DialogueViewer } from '@/components/topic/dialogue-viewer'
import { PhraseDeck } from '@/components/topic/phrase-deck'
import { VocabularyDeck } from '@/components/topic/vocabulary-deck'
import { cn } from '@/lib/utils'
import type { Language, TopicSection } from '@/lib/topics'

type Props = {
  sections: TopicSection[]
  language: Language
  topicSlug: string
  profileId: string
}

export function TopicSections({
  sections,
  language,
  topicSlug,
  profileId,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())

  if (sections.length === 0) return null

  const section = sections[currentIdx]
  const total = sections.length
  const isLast = currentIdx === total - 1
  const isCurrentCompleted = completed.has(currentIdx)
  const allDone = completed.size === total

  function canJumpTo(idx: number): boolean {
    return idx === currentIdx || completed.has(idx)
  }

  function jumpTo(idx: number) {
    if (canJumpTo(idx)) setCurrentIdx(idx)
  }

  function complete() {
    setCompleted((prev) => {
      const next = new Set(prev)
      next.add(currentIdx)
      return next
    })
    if (!isLast) {
      setCurrentIdx(currentIdx + 1)
    }
  }

  if (allDone) {
    return (
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-8 sm:p-12 text-center">
        <p className="text-7xl mb-4">🎉</p>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-3">
          ¡Tema completado!
        </h2>
        <p className="text-stone-600 font-semibold mb-8">
          Terminaste las {total} secciones. ¿Listo para el siguiente?
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-emerald-500 text-white border-b-4 border-emerald-700 rounded-2xl px-8 py-3.5 text-sm font-black uppercase tracking-wide hover:bg-emerald-400 active:translate-y-1 active:border-b-0 transition-transform duration-150"
        >
          Volver a temas →
        </Link>
        <button
          type="button"
          onClick={() => {
            setCurrentIdx(0)
            setCompleted(new Set())
          }}
          className="block mx-auto mt-6 text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
        >
          Repetir este tema
        </button>
      </div>
    )
  }

  return (
    <>
      <Stepper
        total={total}
        currentIdx={currentIdx}
        completed={completed}
        canJumpTo={canJumpTo}
        onJump={jumpTo}
      />

      <article className="bg-white border-2 border-stone-100 rounded-3xl p-6 sm:p-8">
        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-2">
          Sección {currentIdx + 1} de {total}
        </p>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-3">
          {section.title}
        </h2>
        <p className="text-stone-600 font-semibold leading-relaxed mb-8">
          {section.intro}
        </p>

        {section.vocabulary.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
              📖 Vocabulario
            </h3>
            <VocabularyDeck
              key={`vocab-${currentIdx}`}
              vocabulary={section.vocabulary}
              language={language}
            />
          </div>
        )}

        {section.dialogue.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
              💬 Diálogo
            </h3>
            <DialogueViewer
              dialogue={section.dialogue}
              language={language}
            />
          </div>
        )}

        {section.practicePhrases.length > 0 && (
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
              🎤 Frases para practicar
            </h3>
            <PhraseDeck
              key={`phrases-${currentIdx}`}
              phrases={section.practicePhrases}
              language={language}
              topicSlug={topicSlug}
              profileId={profileId}
            />
          </div>
        )}
      </article>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="text-sm font-black text-stone-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        {isCurrentCompleted ? (
          <Button
            size="lg"
            onClick={() => !isLast && setCurrentIdx(currentIdx + 1)}
            disabled={isLast}
          >
            Siguiente sección →
          </Button>
        ) : (
          <Button size="lg" onClick={complete}>
            {isLast ? '¡Terminar tema! 🎉' : 'Completar sección ✓'}
          </Button>
        )}
      </div>
    </>
  )
}

type StepperProps = {
  total: number
  currentIdx: number
  completed: Set<number>
  canJumpTo: (idx: number) => boolean
  onJump: (idx: number) => void
}

function Stepper({
  total,
  currentIdx,
  completed,
  canJumpTo,
  onJump,
}: StepperProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => {
        const isCompleted = completed.has(i)
        const isCurrent = i === currentIdx
        const isAccessible = canJumpTo(i)
        return (
          <Fragment key={i}>
            {i > 0 && (
              <div
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  completed.has(i - 1) ? 'bg-emerald-500' : 'bg-stone-200'
                )}
              />
            )}
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={!isAccessible}
              className={cn(
                'h-10 w-10 rounded-full text-sm font-black transition-transform shrink-0',
                isCompleted &&
                  'bg-emerald-500 text-white border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-2',
                !isCompleted &&
                  isCurrent &&
                  'bg-white border-2 border-emerald-500 text-emerald-600',
                !isCompleted &&
                  !isCurrent &&
                  'bg-stone-100 text-stone-400 border-2 border-stone-200',
                isAccessible && !isCurrent && 'cursor-pointer hover:opacity-90',
                !isAccessible && 'cursor-not-allowed'
              )}
              aria-label={`Sección ${i + 1}${isCompleted ? ' (completada)' : isCurrent ? ' (actual)' : ' (bloqueada)'}`}
            >
              {isCompleted ? '✓' : i + 1}
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
