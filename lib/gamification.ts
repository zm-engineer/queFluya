// XP, levels and badges — all DERIVED from the user's existing activity (no new
// table, same approach as the streak). Because everything is computed from
// monotonic counters (completed sections, practice attempts, topics), XP and
// badges only ever go up, so a badge earned stays earned. The streak is NOT
// used as a badge source: it can drop, which would un-earn a badge — it stays a
// live stat only. See lib/streak.ts and the profile page.

/** Monotonic counters the gamification is built from. */
export type GamificationStats = {
  sectionsCompleted: number
  practices: number
  topicsStarted: number
}

export const XP_PER_SECTION = 25
export const XP_PER_PRACTICE = 10
/** Flat cost per level — simple and predictable for the progress bar. */
export const XP_PER_LEVEL = 100

/** Total XP earned so far. */
export function computeXp(stats: GamificationStats): number {
  return (
    stats.sectionsCompleted * XP_PER_SECTION +
    stats.practices * XP_PER_PRACTICE
  )
}

// Internal 100-XP milestone math, used only to fill the "Progreso" bar toward
// the next milestone. Deliberately NOT surfaced as a user-facing "level" — the
// UI shows total XP + a progress bar, since a second "Nivel" clashed with the
// learner's language level (BEGINNER/INTERMEDIATE/ADVANCED).
export type LevelInfo = {
  /** 1-indexed milestone the user is currently in. */
  level: number
  /** XP accumulated within the current milestone (0 .. xpForNextLevel). */
  xpIntoLevel: number
  /** XP needed to reach the next milestone. */
  xpForNextLevel: number
}

export function levelForXp(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  return {
    level,
    xpIntoLevel: xp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  }
}

export type BadgeId =
  | 'firstSection'
  | 'topics3'
  | 'practices10'
  | 'practices50'
  | 'xp500'
  | 'xp1000'

/** Everything a badge can be tested against: the raw counters + total XP. */
export type BadgeContext = GamificationStats & { xp: number }

type BadgeDef = {
  id: BadgeId
  emoji: string
  test: (c: BadgeContext) => boolean
}

// Order here is the display order. Every predicate is over a monotonic value so
// badges are permanent once earned.
export const BADGES: readonly BadgeDef[] = [
  { id: 'firstSection', emoji: '🎯', test: (c) => c.sectionsCompleted >= 1 },
  { id: 'topics3', emoji: '📚', test: (c) => c.topicsStarted >= 3 },
  { id: 'practices10', emoji: '🎤', test: (c) => c.practices >= 10 },
  { id: 'practices50', emoji: '🎙️', test: (c) => c.practices >= 50 },
  { id: 'xp500', emoji: '⭐', test: (c) => c.xp >= 500 },
  { id: 'xp1000', emoji: '🌟', test: (c) => c.xp >= 1000 },
]

/** The ids of the badges the user has earned, in display order. */
export function earnedBadges(ctx: BadgeContext): BadgeId[] {
  return BADGES.filter((b) => b.test(ctx)).map((b) => b.id)
}
