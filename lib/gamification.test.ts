import { describe, expect, it } from 'vitest'
import {
  BADGES,
  computeXp,
  earnedBadges,
  levelForXp,
  XP_PER_LEVEL,
  XP_PER_PRACTICE,
  XP_PER_SECTION,
} from './gamification'

const noStats = { sectionsCompleted: 0, practices: 0, topicsStarted: 0 }

describe('computeXp', () => {
  it('is 0 with no activity', () => {
    expect(computeXp(noStats)).toBe(0)
  })

  it('adds section and practice XP', () => {
    expect(
      computeXp({ sectionsCompleted: 3, practices: 4, topicsStarted: 2 })
    ).toBe(3 * XP_PER_SECTION + 4 * XP_PER_PRACTICE)
  })

  it('ignores topicsStarted (not an XP source)', () => {
    expect(computeXp({ sectionsCompleted: 0, practices: 0, topicsStarted: 9 })).toBe(0)
  })
})

describe('levelForXp', () => {
  it('starts at level 1 with an empty bar', () => {
    expect(levelForXp(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: XP_PER_LEVEL,
    })
  })

  it('rolls into the next level at the threshold', () => {
    expect(levelForXp(XP_PER_LEVEL)).toMatchObject({ level: 2, xpIntoLevel: 0 })
    expect(levelForXp(XP_PER_LEVEL - 1)).toMatchObject({
      level: 1,
      xpIntoLevel: XP_PER_LEVEL - 1,
    })
  })

  it('reports partial progress within a level', () => {
    expect(levelForXp(250)).toMatchObject({ level: 3, xpIntoLevel: 50 })
  })
})

describe('earnedBadges', () => {
  const ctx = (over: Partial<{ sectionsCompleted: number; practices: number; topicsStarted: number; xp: number }>) => ({
    sectionsCompleted: 0,
    practices: 0,
    topicsStarted: 0,
    xp: 0,
    ...over,
  })

  it('earns nothing with no activity', () => {
    expect(earnedBadges(ctx({}))).toEqual([])
  })

  it('earns firstSection at one completed section', () => {
    expect(earnedBadges(ctx({ sectionsCompleted: 1 }))).toContain('firstSection')
  })

  it('earns practice badges at their thresholds', () => {
    expect(earnedBadges(ctx({ practices: 10 }))).toContain('practices10')
    expect(earnedBadges(ctx({ practices: 49 }))).not.toContain('practices50')
    expect(earnedBadges(ctx({ practices: 50 }))).toContain('practices50')
  })

  it('earns XP badges at their thresholds', () => {
    expect(earnedBadges(ctx({ xp: 500 }))).toContain('xp500')
    expect(earnedBadges(ctx({ xp: 499 }))).not.toContain('xp500')
    expect(earnedBadges(ctx({ xp: 1000 }))).toEqual(
      expect.arrayContaining(['xp500', 'xp1000'])
    )
  })

  it('returns ids in display order', () => {
    const all = ctx({
      sectionsCompleted: 5,
      practices: 50,
      topicsStarted: 3,
      xp: 1000,
    })
    expect(earnedBadges(all)).toEqual(BADGES.map((b) => b.id))
  })
})
