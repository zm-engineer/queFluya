import { describe, expect, it } from 'vitest'
import { computeStreak, dayKeyOf } from './streak'

describe('dayKeyOf', () => {
  it('formats an epoch as YYYY-MM-DD in UTC', () => {
    expect(dayKeyOf(Date.UTC(2026, 7, 29, 13, 0, 0), 'UTC')).toBe('2026-08-29')
  })

  it('respects the given time zone at the day boundary', () => {
    // 23:30 UTC on Aug 29 is already Aug 30 in Madrid (UTC+2 in summer).
    const instant = Date.UTC(2026, 7, 29, 23, 30, 0)
    expect(dayKeyOf(instant, 'Europe/Madrid')).toBe('2026-08-30')
    expect(dayKeyOf(instant, 'UTC')).toBe('2026-08-29')
  })

  it('accepts a Date as well as an epoch', () => {
    expect(dayKeyOf(new Date('2026-01-05T09:00:00Z'), 'UTC')).toBe('2026-01-05')
  })
})

describe('computeStreak', () => {
  const today = '2026-08-29'

  it('is 0 with no activity', () => {
    expect(computeStreak([], today)).toBe(0)
  })

  it('counts a single day of activity today', () => {
    expect(computeStreak([today], today)).toBe(1)
  })

  it('counts consecutive days ending today', () => {
    expect(
      computeStreak(['2026-08-27', '2026-08-28', '2026-08-29'], today)
    ).toBe(3)
  })

  it('stays alive when the most recent activity was yesterday', () => {
    // Not practiced today yet, but yesterday + the day before → streak of 2.
    expect(computeStreak(['2026-08-27', '2026-08-28'], today)).toBe(2)
  })

  it('is broken when the last activity is older than yesterday', () => {
    expect(computeStreak(['2026-08-26', '2026-08-27'], today)).toBe(0)
  })

  it('stops at the first gap', () => {
    // Aug 29 + 28 are consecutive; the Aug 25 island does not extend the streak.
    expect(
      computeStreak(['2026-08-25', '2026-08-28', '2026-08-29'], today)
    ).toBe(2)
  })

  it('de-duplicates repeated days', () => {
    expect(
      computeStreak(['2026-08-29', '2026-08-29', '2026-08-28'], today)
    ).toBe(2)
  })

  it('handles a month/year boundary', () => {
    expect(
      computeStreak(['2025-12-30', '2025-12-31', '2026-01-01'], '2026-01-01')
    ).toBe(3)
  })

  it('accepts a Set as input', () => {
    expect(computeStreak(new Set(['2026-08-29', '2026-08-28']), today)).toBe(2)
  })
})
