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
            {/* Topic banner — sticks under the app header while you scroll its
                sections (like Duolingo's section header), instead of scrolling
                away. Opaque bg + z-index so the path passes under it. */}
            <div
              className={cn(
                'sticky top-16 z-20 rounded-2xl px-5 py-4 flex items-center justify-between gap-3 text-white shadow-sm',
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

            {/* Path: zigzag on mobile, a single row on desktop. On mobile the
                path is pushed right (pl-24) so a character sits in the reserved
                left column without overlapping any node. */}
            <div className="relative flex flex-col items-center gap-6 py-8 pl-24 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8 sm:pl-0">
              {narrow && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none select-none"
                  // Inline style so positioning never depends on Tailwind
                  // generating fraction/arbitrary classes. Centred in the empty
                  // left column (the zigzag is pushed right by pl-24).
                  style={{ position: 'absolute', left: '35%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <PathCharacter className="w-20" mood={topicIdx % 2 === 0 ? 'a' : 'b'} />
                </div>
              )}
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

// Placeholder path character — amber so it clearly contrasts with the green
// nodes (that was the problem before). Swap this SVG for real art later; the
// placement in the reserved left column stays the same.
function PathCharacter({
  className,
  mood = 'a',
}: {
  className?: string
  mood?: 'a' | 'b'
}) {
  return (
    <svg viewBox="0 0 100 112" className={cn('h-auto w-20', className)} aria-hidden="true">
      {/* feet */}
      <ellipse cx="37" cy="99" rx="9" ry="6" fill="#d97706" />
      <ellipse cx="63" cy="99" rx="9" ry="6" fill="#d97706" />
      {/* antenna */}
      <line x1="50" y1="20" x2="50" y2="9" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="6" r="4" fill="#fbbf24" />
      {/* body */}
      <rect x="14" y="18" width="72" height="80" rx="34" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
      {/* cheeks */}
      <circle cx="30" cy="66" r="5" fill="#fb7185" opacity="0.6" />
      <circle cx="70" cy="66" r="5" fill="#fb7185" opacity="0.6" />
      {/* eyes */}
      <circle cx="40" cy={mood === 'b' ? 52 : 55} r="5.5" fill="#3f2d12" />
      <circle cx="60" cy={mood === 'b' ? 52 : 55} r="5.5" fill="#3f2d12" />
      <circle cx="41.5" cy={mood === 'b' ? 50.5 : 53.5} r="1.6" fill="#ffffff" />
      <circle cx="61.5" cy={mood === 'b' ? 50.5 : 53.5} r="1.6" fill="#ffffff" />
      {/* smile */}
      <path
        d="M40 70 Q 50 80 60 70"
        fill="none"
        stroke="#3f2d12"
        strokeWidth="3"
        strokeLinecap="round"
      />
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
