import type { SupabaseClient } from '@supabase/supabase-js'
import type { Language } from './topics'

export const USERNAME_MIN_LENGTH = 3
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/

export type UsernameError = 'short' | 'chars'

/**
 * Validate a username with the same rules as onboarding: at least
 * `USERNAME_MIN_LENGTH` characters after trimming, letters/digits/underscore
 * only. Returns the error kind (for i18n lookup) or null when valid.
 */
export function validateUsername(raw: string): UsernameError | null {
  const trimmed = raw.trim()
  if (trimmed.length < USERNAME_MIN_LENGTH) return 'short'
  if (!USERNAME_PATTERN.test(trimmed)) return 'chars'
  return null
}

/** The language the user practises = the opposite of their native language. */
export function targetFor(native: Language): Language {
  return native === 'EN' ? 'ES' : 'EN'
}

/**
 * Count of the user's saved practice attempts — a single number, never the rows
 * themselves (the profile page shows a tally, not a recording history). Uses a
 * head-only exact count so no data is transferred.
 */
export async function loadPracticeCount(
  supabase: SupabaseClient,
  profileId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('recordings')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)

  return error ? 0 : count ?? 0
}
