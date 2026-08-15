import type { SupabaseClient } from '@supabase/supabase-js'
import {
  generateInviteCode,
  isValidInviteCode,
  normalizeInviteCode,
  oppositeLanguage,
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
  language: Language,
  pairKey: string | null = null
): Promise<{ session: SessionRow } | { error: string }> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const inviteCode = generateInviteCode()
    const { data, error } = await supabase
      .from('tandem_sessions')
      .insert({
        topic_slug: topicSlug,
        language,
        pair_key: pairKey,
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

export type MatchResult =
  | { session: SessionRow; matched: boolean }
  | { error: string }

/**
 * Matchmaking entry point. Find someone already WAITING for the same pair_key in
 * the OPPOSITE language (a tandem is an exchange) and pair with them; if nobody
 * is waiting, create a WAITING session and queue up. `matched: false` means we
 * are now the one waiting — the existing tandem_sessions UPDATE realtime
 * listener flips us to ACTIVE when a partner arrives, so the caller just renders
 * a "searching" state.
 *
 * pairKey is required to match; without a mirror topic (e.g. job-interview-basics
 * has no ES side) there is nobody to pair with, so we can only wait.
 */
export async function findOrCreateMatch(
  supabase: SupabaseClient,
  profileId: string,
  topicSlug: string,
  language: Language,
  pairKey: string | null
): Promise<MatchResult> {
  if (pairKey) {
    const want = oppositeLanguage(language)

    // Retry a few times: a candidate may be claimed by someone else between our
    // read and our join (the capacity trigger rejects the 3rd participant).
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: candidates } = await supabase
        .from('tandem_sessions')
        .select(SESSION_COLUMNS)
        .eq('status', 'WAITING')
        .eq('pair_key', pairKey)
        .eq('language', want)
        .neq('host_profile_id', profileId)
        .order('created_at', { ascending: true })
        .limit(1)

      const candidate = candidates?.[0] as SessionRow | undefined
      if (!candidate) break // nobody waiting → create our own queue entry below

      const { error: joinError } = await supabase
        .from('session_participants')
        .insert({ session_id: candidate.id, profile_id: profileId })

      if (joinError) {
        // Lost the race (already full) or duplicate row → try another candidate.
        if (joinError.code === '23505' || joinError.message.includes('full')) {
          continue
        }
        return { error: 'unknown' }
      }

      const startedAt = new Date().toISOString()
      await supabase
        .from('tandem_sessions')
        .update({ status: 'ACTIVE', started_at: startedAt })
        .eq('id', candidate.id)
        .eq('status', 'WAITING')

      return {
        session: { ...candidate, status: 'ACTIVE', started_at: startedAt },
        matched: true,
      }
    }
  }

  // No partner waiting (or no pair_key) → queue up ourselves and wait.
  const created = await createSession(supabase, profileId, topicSlug, language, pairKey)
  if ('error' in created) return { error: created.error }
  return { session: created.session, matched: false }
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

/**
 * Read one session by id (RLS lets you see it while you're a participant, or
 * while it's still WAITING). Used to backfill the session status on subscribe:
 * a matchmaking partner can flip us ACTIVE during the channel handshake, and
 * that single UPDATE event is otherwise the only thing that would move us on.
 */
export async function getSessionById(
  supabase: SupabaseClient,
  sessionId: string
): Promise<SessionRow | null> {
  const { data } = await supabase
    .from('tandem_sessions')
    .select(SESSION_COLUMNS)
    .eq('id', sessionId)
    .maybeSingle()
  return (data as SessionRow) ?? null
}

/**
 * Join an existing session by id (used by scheduled reservations, which already
 * know the session id — no invite code involved). Adds the caller as a
 * participant if needed and flips the session ACTIVE, then returns it.
 */
export async function joinSessionById(
  supabase: SupabaseClient,
  profileId: string,
  sessionId: string
): Promise<SessionRow | null> {
  const { data: existing } = await supabase
    .from('session_participants')
    .select('id')
    .eq('session_id', sessionId)
    .eq('profile_id', profileId)
    .maybeSingle()

  if (!existing) {
    const { error } = await supabase
      .from('session_participants')
      .insert({ session_id: sessionId, profile_id: profileId })
    // 23505 = already in; "full" = capacity trigger — both mean we can proceed.
    if (error && error.code !== '23505' && !error.message.includes('full')) {
      return null
    }
  }

  const startedAt = new Date().toISOString()
  await supabase
    .from('tandem_sessions')
    .update({ status: 'ACTIVE', started_at: startedAt })
    .eq('id', sessionId)
    .eq('status', 'WAITING')

  return getSessionById(supabase, sessionId)
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
