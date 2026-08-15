import { describe, expect, it } from 'vitest'
import {
  JOIN_CLOSES_AFTER_MS,
  JOIN_OPENS_BEFORE_MS,
  isExpired,
  isJoinable,
  isValidScheduledTime,
  minutesUntil,
} from './reservations'

const T = 1_000_000_000_000 // an arbitrary "scheduled" instant

describe('isJoinable', () => {
  it('is false well before the slot', () => {
    expect(isJoinable(T, T - JOIN_OPENS_BEFORE_MS - 1000)).toBe(false)
  })

  it('opens exactly at the pre-window', () => {
    expect(isJoinable(T, T - JOIN_OPENS_BEFORE_MS)).toBe(true)
  })

  it('is true right at and shortly after the start', () => {
    expect(isJoinable(T, T)).toBe(true)
    expect(isJoinable(T, T + 5 * 60 * 1000)).toBe(true)
  })

  it('closes after the grace period', () => {
    expect(isJoinable(T, T + JOIN_CLOSES_AFTER_MS)).toBe(true)
    expect(isJoinable(T, T + JOIN_CLOSES_AFTER_MS + 1000)).toBe(false)
  })
})

describe('isExpired', () => {
  it('is true only past the grace window', () => {
    expect(isExpired(T, T + JOIN_CLOSES_AFTER_MS)).toBe(false)
    expect(isExpired(T, T + JOIN_CLOSES_AFTER_MS + 1)).toBe(true)
  })
})

describe('isValidScheduledTime', () => {
  it('accepts a future time and rejects past/now/NaN', () => {
    expect(isValidScheduledTime(T + 1, T)).toBe(true)
    expect(isValidScheduledTime(T, T)).toBe(false)
    expect(isValidScheduledTime(T - 1, T)).toBe(false)
    expect(isValidScheduledTime(NaN, T)).toBe(false)
  })
})

describe('minutesUntil', () => {
  it('rounds to whole minutes and goes negative after start', () => {
    expect(minutesUntil(T + 10 * 60 * 1000, T)).toBe(10)
    expect(minutesUntil(T - 3 * 60 * 1000, T)).toBe(-3)
  })
})
