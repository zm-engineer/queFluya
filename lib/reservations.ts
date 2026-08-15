// Pure rules for scheduled tandems (Conectar, Phase 5 "agenda"). Side-effect
// free so they unit-test without a DB or browser. The DB ops live in
// lib/reservations-db.ts; the language-exchange pairing reuses oppositeLanguage
// from lib/tandem.ts.

export type ReservationStatus = 'OPEN' | 'BOOKED' | 'CANCELLED'

/** You can enter the room from 2 min before the slot… */
export const JOIN_OPENS_BEFORE_MS = 2 * 60 * 1000
/** …until 15 min after it (grace period); past that the slot is expired. */
export const JOIN_CLOSES_AFTER_MS = 15 * 60 * 1000

/** Whether the "Únete" action is live right now for a slot at `scheduledAtMs`. */
export function isJoinable(scheduledAtMs: number, nowMs: number): boolean {
  return (
    nowMs >= scheduledAtMs - JOIN_OPENS_BEFORE_MS &&
    nowMs <= scheduledAtMs + JOIN_CLOSES_AFTER_MS
  )
}

/** True once the join window has fully passed — the slot is no longer usable. */
export function isExpired(scheduledAtMs: number, nowMs: number): boolean {
  return nowMs > scheduledAtMs + JOIN_CLOSES_AFTER_MS
}

/** A slot can only be published for a future time. */
export function isValidScheduledTime(scheduledAtMs: number, nowMs: number): boolean {
  return Number.isFinite(scheduledAtMs) && scheduledAtMs > nowMs
}

/** Whole minutes from now until the slot (negative once it has started). */
export function minutesUntil(scheduledAtMs: number, nowMs: number): number {
  return Math.round((scheduledAtMs - nowMs) / 60000)
}
