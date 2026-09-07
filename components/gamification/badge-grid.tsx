// Presentational (server-renderable): earned badges are shown in full colour,
// locked ones greyed with their unlock hint. The caller resolves i18n strings.

import { cn } from '@/lib/utils'

export type BadgeView = {
  emoji: string
  name: string
  desc: string
  earned: boolean
}

type Props = {
  title: string
  earnedText: string
  badges: BadgeView[]
}

export function BadgeGrid({ title, earnedText, badges }: Props) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-black text-stone-900">{title}</h2>
        <span className="text-xs font-black uppercase tracking-wider text-stone-400">
          {earnedText}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div
            key={b.name}
            className={cn(
              'border-2 rounded-3xl p-5 text-center transition-colors',
              b.earned
                ? 'bg-white border-stone-100'
                : 'bg-stone-50 border-stone-100'
            )}
          >
            <div
              className={cn(
                'text-4xl mb-2',
                b.earned ? '' : 'grayscale opacity-40'
              )}
            >
              {b.emoji}
            </div>
            <p
              className={cn(
                'text-sm font-black',
                b.earned ? 'text-stone-900' : 'text-stone-400'
              )}
            >
              {b.name}
            </p>
            <p className="text-xs font-semibold text-stone-400 mt-1 leading-snug">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
