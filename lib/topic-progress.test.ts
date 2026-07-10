import { describe, expect, it } from 'vitest'
import { currentSectionFor, parseProgressRows } from './topic-progress'

describe('parseProgressRows', () => {
  it('returns empty set for no rows', () => {
    expect(parseProgressRows([])).toEqual(new Set<number>())
  })

  it('converts 1-indexed sections with completed_at to 0-indexed set', () => {
    expect(
      parseProgressRows([
        { section: 1, completed_at: '2026-06-01T00:00:00Z' },
        { section: 3, completed_at: '2026-06-01T00:01:00Z' },
      ])
    ).toEqual(new Set([0, 2]))
  })

  it('ignores rows where completed_at is null', () => {
    expect(
      parseProgressRows([
        { section: 1, completed_at: '2026-06-01T00:00:00Z' },
        { section: 2, completed_at: null },
      ])
    ).toEqual(new Set([0]))
  })

  it('deduplicates rows pointing at the same section', () => {
    expect(
      parseProgressRows([
        { section: 2, completed_at: '2026-06-01T00:00:00Z' },
        { section: 2, completed_at: '2026-06-01T00:05:00Z' },
      ])
    ).toEqual(new Set([1]))
  })
})

describe('currentSectionFor', () => {
  it('returns 0 when nothing completed', () => {
    expect(currentSectionFor(new Set(), 5)).toBe(0)
  })

  it('returns the first un-completed section', () => {
    expect(currentSectionFor(new Set([0, 1]), 5)).toBe(2)
  })

  it('returns the last index when every section is completed', () => {
    expect(currentSectionFor(new Set([0, 1, 2]), 3)).toBe(2)
  })

  it('skips over gaps to the first un-completed section', () => {
    expect(currentSectionFor(new Set([0, 2]), 5)).toBe(1)
  })

  it('returns 0 for an empty topic (no sections)', () => {
    expect(currentSectionFor(new Set(), 0)).toBe(0)
  })
})
