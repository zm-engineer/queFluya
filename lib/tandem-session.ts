import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
  skipToNextPhaseStart,
  validateMessage,
} from './tandem'
import type { Language } from './topics'
import type { SessionStatus } from './tandem'

export type SessionRow = {
  id: string
  topic_slug: string
  language: Language
  invite_code: string
  status: SessionStatus
  host_profile_id: string
  started_at: string | null
  ended_at: string | null
}

export type MessageRow = {
  id: string
  profile_id: string
  body: string
  created_at: string
}

const SESSION_COLUMNS =
  'id, topic_slug, language, invite_code, status, host_profile_id, started_at, ended_at'

/**
 * Create a WAITING session for a topic and add the host as the first
 * participant. Retries a couple of times if the random invite code collides
 * with an existing one (vanishingly unlikely, but cheap to guard).
 */
export async function createSession(
  supabase: SupabaseClient,
  profileId: string,
  topicSlug: string,
  language: Language
): Promise<{ session: SessionRow } | { error: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const inviteCode = generateInviteCode()
    const { data, error } = await supabase
      .from('tandem_sessions')
      .insert({
        topic_slug: topicSlug,
        language,
        invite_code: inviteCode,
        status: 'WAITING',
        host_profile_id: profileId,
      })
      .select(SESSION_COLUMNS)
      .single()

    if (error) {
      // 23505 = unique violation on invite_code → retry with a new code.
      if (error.code === '23505') continue
      return { error: error.message }
    }

    const session = data as SessionRow
    const { error: joinError } = await supabase
      .from('session_participants')
      .insert({ session_id: session.id, profile_id: profileId })

    // 23505 = the host already has a participant row for this fresh session
    // (e.g. a double-click or a dev StrictMode re-run). Harmless → treat as ok.
    if (joinError && joinError.code !== '23505') return { error: joinError.message }
    return { session }
  }
  return { error: 'could_not_allocate_code' }
}

export type JoinResult =
  | { session: SessionRow }
  | { error: 'invalid_code' | 'not_found' | 'full' | 'unknown' }

/**
 * Join a session by its invite code, add the caller as the second participant,
 * and flip the session to ACTIVE (starting the shared timer) once they're in.
 *
 * Note: we do NOT require the joiner to be on the same topic slug. A tandem is
 * a language *exchange* — the two learners come from mirror topics in opposite
 * languages (e.g. `greetings` EN ↔ `saludos` ES), which are different rows with
 * different slugs. The shared invite code is the scope; matching on slug would
 * make exchange impossible.
 */
export async function joinByCode(
  supabase: SupabaseClient,
  profileId: string,
  rawCode: string
): Promise<JoinResult> {
  const code = normalizeInviteCode(rawCode)
  if (!isValidInviteCode(code)) return { error: 'invalid_code' }

  const { data, error } = await supabase
    .from('tandem_sessions')
    .select(SESSION_COLUMNS)
    .eq('invite_code', code)
    .eq('status', 'WAITING')
    .maybeSingle()

  if (error || !data) return { error: 'not_found' }
  const session = data as SessionRow

  // Are we already in this session (re-joining after a refresh, or the host
  // pasting their own code)? RLS lets us read our own participant row. If so,
  // skip the INSERT entirely — re-inserting would 23505 and show a scary 409
  // in the network tab even though it's harmless.
  const { data: existing } = await supabase
    .from('session_participants')
    .select('id')
    .eq('session_id', session.id)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (!existing) {
    const { error: joinError } = await supabase
      .from('session_participants')
      .insert({ session_id: session.id, profile_id: profileId })

    if (joinError) {
      // Lost a race for the row → already in, fine. The capacity trigger
      // raises P0001 ("full") when the room already holds two people.
      if (joinError.code === '23505') return { session }
      if (joinError.message.includes('full')) return { error: 'full' }
      return { error: 'unknown' }
    }
  }

  const startedAt = new Date().toISOString()
  await supabase
    .from('tandem_sessions')
    .update({ status: 'ACTIVE', started_at: startedAt })
    .eq('id', session.id)
    .eq('status', 'WAITING')

  return { session: { ...session, status: 'ACTIVE', started_at: startedAt } }
}

/**
 * Move the session to the next language phase early. We shift `started_at` so
 * both clients recompute the timer into the next phase (with its full duration);
 * the change propagates via the same tandem_sessions UPDATE realtime listener.
 * Returns the new `started_at` ISO string, or null if there is no next phase
 * (caller should end the session instead).
 */
export async function skipToNextPhase(
  supabase: SupabaseClient,
  sessionId: string,
  startedAtMs: number,
  nowMs: number = Date.now()
): Promise<{ startedAt: string } | null> {
  const newStartMs = skipToNextPhaseStart(startedAtMs, nowMs)
  if (newStartMs === null) return null

  const startedAt = new Date(newStartMs).toISOString()
  await supabase
    .from('tandem_sessions')
    .update({ started_at: startedAt })
    .eq('id', sessionId)
    .eq('status', 'ACTIVE')

  return { startedAt }
}

export async function loadMessages(
  supabase: SupabaseClient,
  sessionId: string
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, profile_id, body, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data as MessageRow[]
}

export async function sendMessage(
  supabase: SupabaseClient,
  sessionId: string,
  profileId: string,
  rawBody: string
): Promise<{ row: MessageRow | null; error: string | null }> {
  const validation = validateMessage(rawBody)
  if (!validation.ok) return { row: null, error: validation.reason }

  // Return the inserted row so the sender can render it optimistically — the
  // Realtime echo may lag (or be missed during the subscribe handshake), and
  // we don't want the sender's own message to vanish until it round-trips.
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, profile_id: profileId, body: validation.value })
    .select('id, profile_id, body, created_at')
    .single()

  return {
    row: (data as MessageRow) ?? null,
    error: error ? error.message : null,
  }
}

export async function endSession(
  supabase: SupabaseClient,
  sessionId: string
): Promise<void> {
  await supabase
    .from('tandem_sessions')
    .update({ status: 'ENDED', ended_at: new Date().toISOString() })
    .eq('id', sessionId)
}
