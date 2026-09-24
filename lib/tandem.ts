// Pure logic for the 1:1 tandem text chat (Phase 1 of the "Conectar" section).
//
// Everything here is side-effect free so it can be unit-tested without a DB or
// a browser. The realtime wiring (Supabase channels) and persistence live in
// the hook/route handlers; this module only decides *rules*: the language
// timer, invite-code shape, message validity, and session capacity.

import type { Language, Level } from './topics'

export type SessionStatus = 'WAITING' | 'ACTIVE' | 'ENDED'
export type SessionPhase = 'EN' | 'ES' | 'ended'

/**
 * A tandem is an exchange, so your match practises the OPPOSITE language: if you
 * study English (so you can be the native-Spanish helper during the ES phase),
 * your partner studies Spanish. Matchmaking pairs same-pair_key + opposite-language.
 */
export function oppositeLanguage(language: Language): Language {
  return language === 'EN' ? 'ES' : 'EN'
}

/** Default phase length (fallback) — 5 minutes. */
export const TANDEM_PHASE_MS = 5 * 60 * 1000

// Each language phase's length depends on the level: less time for beginners,
// more for advanced. Both clients derive the same value from the topic's level
// (mirror topics share a level), so the shared timer stays in sync.
export const PHASE_MS_BY_LEVEL: Record<Level, number> = {
  BEGINNER: 2 * 60 * 1000,
  INTERMEDIATE: 3 * 60 * 1000,
  ADVANCED: 5 * 60 * 1000,
}

export function phaseMsForLevel(level: Level): number {
  return PHASE_MS_BY_LEVEL[level] ?? TANDEM_PHASE_MS
}
export const TANDEM_PHASE_ORDER: readonly Exclude<SessionPhase, 'ended'>[] = [
  'EN',
  'ES',
]
/** A 1:1 tandem holds exactly two people. */
export const TANDEM_CAPACITY = 2

export type TimerState = {
  /** Current language to speak, or 'ended' once both phases are over. */
  phase: SessionPhase
  /** 0-based index into the phase order, or -1 when ended. */
  phaseIndex: number
  /** Whole seconds remaining in the current phase (0 when ended). */
  secondsLeftInPhase: number
  /** Whole seconds remaining across all phases (0 when ended). */
  totalSecondsLeft: number
}

type TimerOpts = {
  phaseMs?: number
  order?: readonly Exclude<SessionPhase, 'ended'>[]
}

/**
 * Derive the timer purely from the session's start timestamp and "now".
 * Both clients compute the same phase from the shared `startedAt`, so we never
 * have to broadcast ticks — each browser just runs its own 1s interval.
 */
export function computeTimerState(
  startedAtMs: number,
  nowMs: number,
  opts: TimerOpts = {}
): TimerState {
  const phaseMs = opts.phaseMs ?? TANDEM_PHASE_MS
  const order = opts.order ?? TANDEM_PHASE_ORDER
  const totalMs = phaseMs * order.length

  const elapsed = Math.max(0, nowMs - startedAtMs)

  if (elapsed >= totalMs) {
    return { phase: 'ended', phaseIndex: -1, secondsLeftInPhase: 0, totalSecondsLeft: 0 }
  }

  const phaseIndex = Math.floor(elapsed / phaseMs)
  const phaseEndsAt = phaseMs * (phaseIndex + 1)

  return {
    phase: order[phaseIndex],
    phaseIndex,
    secondsLeftInPhase: Math.ceil((phaseEndsAt - elapsed) / 1000),
    totalSecondsLeft: Math.ceil((totalMs - elapsed) / 1000),
  }
}

/**
 * New `started_at` (epoch ms) so the session jumps to the START of the next
 * phase, giving that phase its full duration. Since the timer is derived purely
 * from `started_at`, shifting the start is all we need — both clients recompute
 * the same phase, no tick broadcast required.
 *
 * Returns null when there is no next phase (already in the last phase, or the
 * session has ended) — in that case the caller should end the session instead.
 */
export function skipToNextPhaseStart(
  startedAtMs: number,
  nowMs: number,
  opts: TimerOpts = {}
): number | null {
  const phaseMs = opts.phaseMs ?? TANDEM_PHASE_MS
  const order = opts.order ?? TANDEM_PHASE_ORDER
  const { phaseIndex } = computeTimerState(startedAtMs, nowMs, opts)
  const nextIndex = phaseIndex + 1
  if (phaseIndex < 0 || nextIndex >= order.length) return null
  // Place the start so that elapsed === phaseMs * nextIndex right now: we land
  // exactly on the next phase's boundary, leaving it its full duration.
  return nowMs - phaseMs * nextIndex
}

/**
 * Parse a timestamp coming from the DB into epoch milliseconds.
 *
 * Our timestamp columns are `timestamp` WITHOUT time zone (Prisma's default
 * DateTime mapping). We always WRITE UTC (`new Date().toISOString()`), but
 * Postgres drops the trailing `Z`, so a read-back looks like
 * "2026-06-02T21:50:00" with no zone — and `Date.parse` would treat that as
 * LOCAL time, shifting the instant by the user's UTC offset and wrecking the
 * timer. If the string carries no zone, we re-attach `Z` to read it back as
 * the UTC instant we stored. (Strings that already carry a zone are left as-is,
 * so this stays correct if the column is ever migrated to `timestamptz`.)
 */
export function parseDbTimestamp(value: string): number {
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(value)
  return Date.parse(hasZone ? value : `${value}Z`)
}

// Invite codes. Charset deliberately excludes 0/O, 1/I/L to avoid the classic
// "is that a zero or an oh?" when sharing a code verbally or over chat.
const CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const INVITE_CODE_LENGTH = 6
const CODE_PATTERN = new RegExp(`^[${CODE_CHARSET}]{${INVITE_CODE_LENGTH}}$`)

/** `rng` is injectable so tests can be deterministic. */
export function generateInviteCode(rng: () => number = Math.random): string {
  let code = ''
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    const idx = Math.floor(rng() * CODE_CHARSET.length) % CODE_CHARSET.length
    code += CODE_CHARSET[idx]
  }
  return code
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase()
}

export function isValidInviteCode(code: string): boolean {
  return CODE_PATTERN.test(code)
}

// Chat messages.
export const MAX_MESSAGE_LENGTH = 500

export type MessageValidation =
  | { ok: true; value: string }
  | { ok: false; reason: 'empty' | 'too_long' }

export function validateMessage(raw: string): MessageValidation {
  const value = raw.trim()
  if (value.length === 0) return { ok: false, reason: 'empty' }
  if (value.length > MAX_MESSAGE_LENGTH) return { ok: false, reason: 'too_long' }
  return { ok: true, value }
}

/** A peer may join only a still-waiting session that isn't already full. */
export function canJoinSession(
  status: SessionStatus,
  participantCount: number
): boolean {
  return status === 'WAITING' && participantCount < TANDEM_CAPACITY
}
