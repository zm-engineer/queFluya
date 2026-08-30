import type { SupabaseClient } from '@supabase/supabase-js'
import { parseDbTimestamp } from './tandem'

/** A calendar day in `YYYY-MM-DD` form. */
export type DayKey = string

/**
 * Convert an instant to its `YYYY-MM-DD` calendar day in the given IANA time
 * zone. `en-CA` is used because it formats as `YYYY-MM-DD`, which sorts and
 * compares lexicographically as a date.
 */
export function dayKeyOf(instant: number | Date, timeZone = 'UTC'): DayKey {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant)
}

/** The day key `deltaDays` away from `day`, computed at UTC midnight. */
function shiftDay(day: DayKey, deltaDays: number): DayKey {
  const [y, m, d] = day.split('-').map(Number)
  const shifted = Date.UTC(y, m - 1, d) + deltaDays * 86_400_000
  return dayKeyOf(shifted, 'UTC')
}

/**
 * Length of the current daily streak: consecutive calendar days with at least
 * one activity, counting back from `today`. The streak is still alive (and
 * counts) if the most recent activity was today OR yesterday; once the last
 * activity is older than yesterday it is broken (0). Repeated activity on the
 * same day counts once.
 */
export function computeStreak(
  activeDays: Iterable<DayKey>,
  today: DayKey
): number {
  const set = activeDays instanceof Set ? activeDays : new Set(activeDays)
  if (set.size === 0) return 0

  // Anchor on today if there's activity today, otherwise on yesterday so a
  // not-yet-practiced-today user keeps the streak they earned. Anything older
  // means the streak already lapsed.
  let cursor: DayKey
  if (set.has(today)) cursor = today
  else if (set.has(shiftDay(today, -1))) cursor = shiftDay(today, -1)
  else return 0

  let count = 0
  while (set.has(cursor)) {
    count++
    cursor = shiftDay(cursor, -1)
  }
  return count
}

/**
 * The user's current practice streak, from their saved recordings. Buckets each
 * recording into its calendar day (in `timeZone`) and counts consecutive days
 * back from now. `created_at` is a naive-UTC `timestamp` (see the project-wide
 * timestamp-without-tz note), so it's parsed via `parseDbTimestamp` before
 * bucketing. `timeZone` defaults to UTC — day boundaries fall at UTC midnight
 * until we track a per-user time zone.
 */
export async function loadStreak(
  supabase: SupabaseClient,
  profileId: string,
  now: number | Date = Date.now(),
  timeZone = 'UTC'
): Promise<number> {
  const { data, error } = await supabase
    .from('recordings')
    .select('created_at')
    .eq('profile_id', profileId)

  if (error || !data) return 0

  const days = new Set<DayKey>()
  for (const row of data as { created_at: string }[]) {
    if (!row.created_at) continue
    days.add(dayKeyOf(parseDbTimestamp(row.created_at), timeZone))
  }

  return computeStreak(days, dayKeyOf(now, timeZone))
}
