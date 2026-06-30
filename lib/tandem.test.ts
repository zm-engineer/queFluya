import { describe, expect, it } from 'vitest'
import {
  TANDEM_CAPACITY,
  TANDEM_PHASE_MS,
  canJoinSession,
  computeTimerState,
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
  parseDbTimestamp,
  skipToNextPhaseStart,
  validateMessage,
  INVITE_CODE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from './tandem'

describe('computeTimerState', () => {
  it('is in the first phase (EN) at the very start', () => {
    const s = computeTimerState(1000, 1000)
    expect(s.phase).toBe('EN')
    expect(s.phaseIndex).toBe(0)
    expect(s.secondsLeftInPhase).toBe(TANDEM_PHASE_MS / 1000)
  })

  it('clamps negative elapsed (now before start) to the start of phase 1', () => {
    const s = computeTimerState(5000, 1000)
    expect(s.phase).toBe('EN')
    expect(s.secondsLeftInPhase).toBe(TANDEM_PHASE_MS / 1000)
  })

  it('counts down within the first phase', () => {
    const start = 0
    const now = 60_000 // 1 minute in
    const s = computeTimerState(start, now)
    expect(s.phase).toBe('EN')
    expect(s.secondsLeftInPhase).toBe(TANDEM_PHASE_MS / 1000 - 60)
  })

  it('switches to ES once the first phase elapses', () => {
    const s = computeTimerState(0, TANDEM_PHASE_MS + 1000)
    expect(s.phase).toBe('ES')
    expect(s.phaseIndex).toBe(1)
    expect(s.secondsLeftInPhase).toBe(TANDEM_PHASE_MS / 1000 - 1)
  })

  it('ends after both phases elapse', () => {
    const s = computeTimerState(0, TANDEM_PHASE_MS * 2 + 5000)
    expect(s.phase).toBe('ended')
    expect(s.phaseIndex).toBe(-1)
    expect(s.secondsLeftInPhase).toBe(0)
    expect(s.totalSecondsLeft).toBe(0)
  })

  it('reports total seconds left across both phases', () => {
    const s = computeTimerState(0, 0)
    expect(s.totalSecondsLeft).toBe((TANDEM_PHASE_MS * 2) / 1000)
  })

  it('honours custom phase order and duration', () => {
    const s = computeTimerState(0, 0, { phaseMs: 1000, order: ['ES', 'EN'] })
    expect(s.phase).toBe('ES')
    expect(s.totalSecondsLeft).toBe(2)
  })
})

describe('skipToNextPhaseStart', () => {
  it('skips from EN to ES, giving ES its full duration', () => {
    // 2 minutes into the EN phase, then skip.
    const start = 0
    const now = 2 * 60 * 1000
    const newStart = skipToNextPhaseStart(start, now)
    expect(newStart).not.toBeNull()
    // From the new start, ES should be active with the full phase remaining.
    const s = computeTimerState(newStart as number, now)
    expect(s.phase).toBe('ES')
    expect(s.secondsLeftInPhase).toBe(TANDEM_PHASE_MS / 1000)
  })

  it('returns null when already in the last phase (nothing to skip to)', () => {
    const now = TANDEM_PHASE_MS + 1000 // inside ES, the last phase
    expect(skipToNextPhaseStart(0, now)).toBeNull()
  })

  it('returns null when the session has already ended', () => {
    const now = TANDEM_PHASE_MS * 2 + 1000
    expect(skipToNextPhaseStart(0, now)).toBeNull()
  })

  it('honours a custom phase order/duration', () => {
    // 3-phase order at 1s each; skipping from phase 0 lands on phase 1.
    const order = ['EN', 'ES', 'EN'] as const
    const newStart = skipToNextPhaseStart(0, 0, { phaseMs: 1000, order })
    const s = computeTimerState(newStart as number, 0, { phaseMs: 1000, order })
    expect(s.phaseIndex).toBe(1)
    expect(s.secondsLeftInPhase).toBe(1)
  })
})

describe('generateInviteCode', () => {
  it('produces a code of the configured length', () => {
    expect(generateInviteCode()).toHaveLength(INVITE_CODE_LENGTH)
  })

  it('only uses unambiguous charset characters', () => {
    for (let i = 0; i < 50; i++) {
      expect(isValidInviteCode(generateInviteCode())).toBe(true)
    }
  })

  it('is deterministic given a fixed rng', () => {
    const rng = () => 0 // always first char of the charset
    const code = generateInviteCode(rng)
    expect(code).toBe(code[0].repeat(INVITE_CODE_LENGTH))
  })
})

describe('normalizeInviteCode / isValidInviteCode', () => {
  it('uppercases and trims input', () => {
    expect(normalizeInviteCode('  ab2cd3 ')).toBe('AB2CD3')
  })

  it('rejects wrong length', () => {
    expect(isValidInviteCode('ABC')).toBe(false)
  })

  it('rejects ambiguous characters (0, O, 1, I, L)', () => {
    expect(isValidInviteCode('ABCDE0')).toBe(false)
    expect(isValidInviteCode('ABCDEI')).toBe(false)
  })

  it('accepts a well-formed code', () => {
    expect(isValidInviteCode('AB2CD3')).toBe(true)
  })
})

describe('parseDbTimestamp', () => {
  it('treats a zone-less timestamp (Postgres timestamp w/o tz) as UTC', () => {
    // The bug this guards against: parsed as local time this would shift by the
    // runner's UTC offset. Forcing UTC makes it equal to the explicit-Z parse.
    expect(parseDbTimestamp('2026-06-02T21:50:00.000')).toBe(
      Date.parse('2026-06-02T21:50:00.000Z')
    )
  })

  it('leaves a timestamp that already has a Z untouched', () => {
    expect(parseDbTimestamp('2026-06-02T21:50:00.000Z')).toBe(
      Date.parse('2026-06-02T21:50:00.000Z')
    )
  })

  it('leaves a timestamp with an explicit offset untouched', () => {
    expect(parseDbTimestamp('2026-06-02T23:50:00.000+02:00')).toBe(
      Date.parse('2026-06-02T21:50:00.000Z')
    )
  })

  it('a fresh zone-less start time reads as ~now, not hours in the past', () => {
    const nowIso = new Date().toISOString() // ...Z
    const naive = nowIso.replace('Z', '') // what Postgres hands back
    expect(Math.abs(parseDbTimestamp(naive) - Date.now())).toBeLessThan(2000)
  })
})

describe('validateMessage', () => {
  it('trims and accepts a normal message', () => {
    expect(validateMessage('  hello  ')).toEqual({ ok: true, value: 'hello' })
  })

  it('rejects an empty / whitespace-only message', () => {
    expect(validateMessage('   ')).toEqual({ ok: false, reason: 'empty' })
  })

  it('rejects a message over the max length', () => {
    expect(validateMessage('x'.repeat(MAX_MESSAGE_LENGTH + 1))).toEqual({
      ok: false,
      reason: 'too_long',
    })
  })
})

describe('canJoinSession', () => {
  it('allows joining a waiting session with room', () => {
    expect(canJoinSession('WAITING', 1)).toBe(true)
  })

  it('rejects a full session', () => {
    expect(canJoinSession('WAITING', TANDEM_CAPACITY)).toBe(false)
  })

  it('rejects a session that is no longer waiting', () => {
    expect(canJoinSession('ACTIVE', 1)).toBe(false)
    expect(canJoinSession('ENDED', 0)).toBe(false)
  })
})
