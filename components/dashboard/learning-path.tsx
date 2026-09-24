'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useDict } from '@/components/i18n/language-provider'
import { type Level, type TopicDetail } from '@/lib/topics'
import { isSectionAccessible, sectionKind, type SectionKind } from '@/lib/topic-journey'

const KIND_ICON: Record<SectionKind, string> = {
  study: '📖',
  shadowing: '🎧',
  recording: '⭐',
  video: '🎬',
  tandem: '🎥',
}

// Balanced serpentine offsets (px) — used only on mobile; centered on both ends.
const WAVE = [0, 60, 0, -60]

type Props = {
  /** Ordered by position, in the user's target language, with content. */
  topics: TopicDetail[]
  userLevel: Level
  /** slug → completed (0-indexed) sections. */
  progressBySlug: Record<string, number[]>
}

export function LearningPath({ topics, userLevel, progressBySlug }: Props) {
  // Zigzag only on narrow screens; on desktop the nodes sit in a plain row.
  // Driven from JS (matchMedia) + inline transform instead of a CSS-var utility,
  // which Safari didn't apply consistently. Starts false so SSR = no offset.
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const t = useDict()
  const levelTopics = topics.filter((topic) => topic.level === userLevel)

  if (levelTopics.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-stone-100 p-12 text-center">
        <p className="text-6xl mb-4">📚</p>
        <p className="text-stone-500 font-semibold">{t.dashboard.empty}</p>
      </div>
    )
  }

  // The single "current" node: first not-done, accessible section in reading
  // order across the level — where the user picks up.
  let currentKey: string | null = null
  for (const topic of levelTopics) {
    const done = new Set(progressBySlug[topic.slug] ?? [])
    const sections = topic.content.sections ?? []
    const hit = sections.findIndex(
      (_, i) => !done.has(i) && isSectionAccessible(sections, i, done)
    )
    if (hit !== -1) {
      currentKey = `${topic.slug}:${hit}`
      break
    }
  }

  return (
    <div className="space-y-8">
      {levelTopics.map((topic, topicIdx) => {
        const done = new Set(progressBySlug[topic.slug] ?? [])
        const sections = topic.content.sections ?? []
        const allDone = sections.length > 0 && done.size >= sections.length

        return (
          <div key={topic.slug}>
            {/* Topic banner */}
            <div
              className={cn(
                'rounded-2xl px-5 py-4 flex items-center justify-between gap-3 text-white',
                allDone ? 'bg-emerald-600' : 'bg-emerald-500'
              )}
            >
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                  {t.path.topic(topicIdx + 1)}
                </p>
                <p className="text-lg font-black leading-snug truncate">
                  {topic.title}
                </p>
              </div>
              {allDone && <span className="text-2xl shrink-0">🏆</span>}
            </div>

            {/* Path: zigzag on mobile, a single row on desktop */}
            <div className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8">
              {sections.map((section, i) => {
                const kind = sectionKind(section)
                const offset = WAVE[i % WAVE.length]
                return (
                  <div
                    key={i}
                    className="relative"
                    style={{
                      transform: narrow ? `translateX(${offset}px)` : undefined,
                    }}
                  >
                    {/* Static decorations fill the empty side left by the mobile
                        zigzag (a node shifted right leaves a gap on its left, and
                        vice versa). Placeholder figures — swap them later. */}
                    {narrow && offset > 0 && (
                      <div className="absolute top-8 right-full mr-3 -translate-y-1/2 pointer-events-none">
                        <PathDecoration variant="drop" />
                      </div>
                    )}
                    {narrow && offset < 0 && (
                      <div className="absolute top-8 left-full ml-3 -translate-y-1/2 pointer-events-none">
                        <PathDecoration variant="sparkle" />
                      </div>
                    )}
                    <PathNode
                      slug={topic.slug}
                      index={i}
                      icon={KIND_ICON[kind]}
                      label={t.path.kinds[kind]}
                      isDone={done.has(i)}
                      accessible={isSectionAccessible(sections, i, done)}
                      isCurrent={currentKey === `${topic.slug}:${i}`}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Small static decoration for the mobile serpentine gaps. Placeholder SVGs kept
// deliberately pale so they read as background flavour, not tappable nodes.
// Swap these paths for real illustrations later; the placement stays the same.
function PathDecoration({ variant }: { variant: 'drop' | 'sparkle' }) {
  if (variant === 'drop') {
    return (
      <svg viewBox="0 0 40 48" className="w-10 h-auto" aria-hidden="true">
        <path
          d="M20 4 C 26 18 34 24 34 33 A 14 14 0 1 1 6 33 C 6 24 14 18 20 4 Z"
          fill="#6ee7b7"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="14" cy="30" rx="3" ry="5" fill="#ffffff" opacity="0.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 40" className="w-9 h-auto" aria-hidden="true">
      <path
        d="M20 3 L24 16 L37 20 L24 24 L20 37 L16 24 L3 20 L16 16 Z"
        fill="#fcd34d"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="8" r="2.5" fill="#fbbf24" />
      <circle cx="8" cy="31" r="2" fill="#fbbf24" />
    </svg>
  )
}

type NodeProps = {
  slug: string
  index: number
  icon: string
  label: string
  isDone: boolean
  accessible: boolean
  isCurrent: boolean
}

function PathNode({
  slug,
  index,
  icon,
  label,
  isDone,
  accessible,
  isCurrent,
}: NodeProps) {
  const t = useDict()
  const content = (
    <div className="relative flex flex-col items-center">
      {isCurrent && (
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap bg-white text-emerald-600 text-[11px] font-black uppercase tracking-wide px-3 py-1 rounded-xl border-2 border-emerald-200 shadow-sm animate-bounce">
          {t.path.start}
        </span>
      )}
      <span
        className={cn(
          'h-[68px] w-[68px] rounded-full grid place-items-center text-3xl transition-transform',
          isDone
            ? 'bg-emerald-500 border-b-4 border-emerald-700 active:translate-y-0.5 active:border-b-2'
            : accessible
              ? isCurrent
                ? 'bg-white border-4 border-emerald-500 ring-4 ring-emerald-100'
                : 'bg-emerald-100 border-b-4 border-emerald-300 active:translate-y-0.5 active:border-b-2'
              : 'bg-stone-200 border-b-4 border-stone-300'
        )}
      >
        <span className={cn(!accessible && 'grayscale opacity-60')}>
          {isDone ? '✓' : accessible ? icon : '🔒'}
        </span>
      </span>
      <span
        className={cn(
          'mt-2 text-[10px] font-black uppercase tracking-wider',
          accessible ? 'text-stone-500' : 'text-stone-300'
        )}
      >
        {label}
      </span>
    </div>
  )

  if (!accessible) {
    return (
      <div
        aria-label={`${label} — ${t.path.tandemLocked}`}
        title={t.path.tandemLocked}
        className="cursor-not-allowed"
      >
        {content}
      </div>
    )
  }

  return (
    <Link href={`/topics/${slug}?section=${index}`} aria-label={label} className="block">
      {content}
    </Link>
  )
}
