'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AudioShadowing } from '@/components/topic/audio-shadowing'
import { Button } from '@/components/ui/button'
import { DialogueViewer } from '@/components/topic/dialogue-viewer'
import { PhraseDeck } from '@/components/topic/phrase-deck'
import { VocabularyDeck } from '@/components/topic/vocabulary-deck'
import { FreeRecordingPractice } from '@/components/practice/free-recording-practice'
import { createClient } from '@/lib/supabase/client'
import {
  currentSectionFor,
  loadCompletedSections,
  markSectionCompleted,
} from '@/lib/topic-progress'
import { cn } from '@/lib/utils'
import { isSectionAccessible } from '@/lib/topic-journey'
import type { Language, TopicSection } from '@/lib/topics'

type Props = {
  sections: TopicSection[]
  language: Language
  topicSlug: string
  topicTitle: string
  topicDescription: string
  profileId: string
  /** Section to open on load (from the dashboard journey's ?section=N). */
  initialSection?: number
}

export function TopicSections({
  sections,
  language,
  topicSlug,
  topicTitle,
  topicDescription,
  profileId,
  initialSection,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [practicedInCurrent, setPracticedInCurrent] = useState(0)
  const [freeRecordingDone, setFreeRecordingDone] = useState(false)
  const [shadowingDone, setShadowingDone] = useState(false)
  const [loading, setLoading] = useState(true)

  const allVocabulary = useMemo(
    () => sections.flatMap((s) => s.vocabulary),
    [sections]
  )
  const allPhrases = useMemo(
    () => sections.flatMap((s) => s.practicePhrases),
    [sections]
  )
  const allDialogue = useMemo(
    () => sections.flatMap((s) => s.dialogue),
    [sections]
  )

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let cancelled = false
    loadCompletedSections(supabase, profileId, topicSlug).then((loaded) => {
      if (cancelled) return
      setCompleted(loaded)
      const wantsInitial =
        initialSection != null &&
        initialSection >= 0 &&
        initialSection < sections.length &&
        isSectionAccessible(sections, initialSection, loaded)
      setCurrentIdx(
        wantsInitial
          ? (initialSection as number)
          : currentSectionFor(loaded, sections.length)
      )
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [supabase, profileId, topicSlug, sections, initialSection])

  if (sections.length === 0) return null

  if (loading) {
    return (
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-12 text-center">
        <p className="text-sm font-bold text-stone-400">Cargando progreso…</p>
      </div>
    )
  }

  const section = sections[currentIdx]
  const total = sections.length
  const isLast = currentIdx === total - 1
  const isCurrentCompleted = completed.has(currentIdx)
  const allDone = completed.size === total
  const isFreeSection = Boolean(section.freeRecordingPrompt)
  const isComingSoonSection = Boolean(section.comingSoon)
  const isShadowingSection = Boolean(section.shadowing)
  const totalPhrases = section.practicePhrases.length
  const phraseGateOpen =
    totalPhrases === 0 || practicedInCurrent >= totalPhrases
  const gateOpen = isComingSoonSection
    ? true
    : isShadowingSection
      ? shadowingDone
      : isFreeSection
        ? freeRecordingDone
        : phraseGateOpen

  // Free navigation: any section is reachable except a locked one (the tandem
  // call, gated on completing the phrase practice). You can always stay put.
  function canJumpTo(idx: number): boolean {
    return idx === currentIdx || isSectionAccessible(sections, idx, completed)
  }

  // Navigate to a section, clearing the per-section transient gate flags (the
  // decks remount via their key prop; these local booleans we reset by hand).
  function goToSection(idx: number) {
    setCurrentIdx(idx)
    setFreeRecordingDone(false)
    setShadowingDone(false)
  }

  function jumpTo(idx: number) {
    if (canJumpTo(idx)) goToSection(idx)
  }

  const nextIdx = currentIdx + 1
  const canAdvance =
    nextIdx < total && isSectionAccessible(sections, nextIdx, completed)

  function complete() {
    const nextCompleted = new Set(completed)
    nextCompleted.add(currentIdx)
    setCompleted(nextCompleted)
    markSectionCompleted(supabase, profileId, topicSlug, currentIdx).catch(
      (err) => {
        console.error('Failed to persist topic progress', err)
      }
    )
    // Advance only if the next section is now reachable (completing the phrase
    // practice unlocks the tandem, so this opens up naturally).
    if (nextIdx < total && isSectionAccessible(sections, nextIdx, nextCompleted)) {
      goToSection(nextIdx)
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
            goToSection(0)
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

        {isComingSoonSection ? (
          section.comingSoon === 'tandem' ? (
            <TandemConnectCard topicSlug={topicSlug} />
          ) : (
            <ComingSoonCard />
          )
        ) : isShadowingSection ? (
          <AudioShadowing
            key={`shadow-${currentIdx}`}
            dialogue={allDialogue}
            language={language}
            onCompleted={() => setShadowingDone(true)}
          />
        ) : isFreeSection ? (
          <FreeRecordingPractice
            key={`free-${currentIdx}`}
            language={language}
            topicTitle={topicTitle}
            topicDescription={topicDescription}
            vocabulary={allVocabulary}
            practicePhrases={allPhrases}
            freePrompt={section.freeRecordingPrompt as string}
            onCorrected={() => setFreeRecordingDone(true)}
          />
        ) : (
          <>
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
                  onPracticedCountChange={setPracticedInCurrent}
                />
              </div>
            )}
          </>
        )}
      </article>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => currentIdx > 0 && goToSection(currentIdx - 1)}
          disabled={currentIdx === 0}
          className="text-sm font-black text-stone-500 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>
        {isCurrentCompleted ? (
          <Button
            size="lg"
            onClick={() => canAdvance && goToSection(nextIdx)}
            disabled={!canAdvance}
          >
            Siguiente sección →
          </Button>
        ) : (
          <Button size="lg" onClick={complete} disabled={!gateOpen}>
            {isLast
              ? '¡Terminar tema! 🎉'
              : isComingSoonSection
                ? 'Saltar sección →'
                : 'Completar sección ✓'}
          </Button>
        )}
      </div>

      {!isCurrentCompleted && !gateOpen && (
        <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <p className="text-sm font-bold text-amber-900 flex-1">
            {isShadowingSection ? (
              <>Reproduce el diálogo completo al menos una vez</>
            ) : isFreeSection ? (
              <>Graba al menos una vez para completar la sección</>
            ) : (
              <>
                Practica las {totalPhrases} frases para completar la sección
                <span className="text-amber-700 font-black ml-2">
                  ({practicedInCurrent}/{totalPhrases})
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </>
  )
}

function TandemConnectCard({ topicSlug }: { topicSlug: string }) {
  return (
    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8 text-center">
      <p className="text-6xl mb-3">👥</p>
      <p className="text-xl font-black text-stone-800 mb-2">
        Conectar con otra persona
      </p>
      <p className="text-sm font-semibold text-stone-500 max-w-md mx-auto leading-relaxed mb-6">
        Practica este tema por chat con alguien más: 5 minutos en inglés y 5 en
        español, con el vocabulario del tema a mano.
      </p>
      <Link
        href={`/topics/${topicSlug}/tandem`}
        className="inline-block bg-emerald-500 text-white border-b-4 border-emerald-700 rounded-2xl px-8 py-3.5 text-sm font-black uppercase tracking-wide hover:bg-emerald-400 active:translate-y-1 active:border-b-0 transition-transform duration-150"
      >
        Conectar en vivo →
      </Link>
    </div>
  )
}

function ComingSoonCard() {
  const meta = {
    emoji: '🎬',
    title: 'Video + shadowing',
    description:
      'Verás un video con dos hablantes nativos y repetirás las frases varias veces. Construcción en curso.',
  }
  return (
    <div className="bg-stone-100 border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center">
      <p className="text-6xl mb-3">{meta.emoji}</p>
      <p className="text-xl font-black text-stone-700 mb-2">
        Próximamente: {meta.title}
      </p>
      <p className="text-sm font-semibold text-stone-500 max-w-md mx-auto leading-relaxed">
        {meta.description}
      </p>
      <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mt-5">
        Por ahora puedes saltar esta sección
      </p>
    </div>
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
