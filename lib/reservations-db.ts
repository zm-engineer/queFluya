import type { SupabaseClient } from '@supabase/supabase-js'
import type { Language } from './topics'
import type { ReservationStatus } from './reservations'
import {
  createSession,
  joinSessionById,
  type SessionRow,
} from './tandem-session'

export type ReservationRow = {
  id: string
  host_profile_id: string
  host_username: string | null
  topic_slug: string
  language: Language
  pair_key: string | null
  // timestamptz → PostgREST returns it WITH a zone, so Date.parse is correct
  // directly (no parseDbTimestamp dance needed, unlike the naive columns).
  scheduled_at: string
  status: ReservationStatus
  guest_profile_id: string | null
  guest_username: string | null
  session_id: string | null
}

const COLUMNS =
  'id, host_profile_id, host_username, topic_slug, language, pair_key, scheduled_at, status, guest_profile_id, guest_username, session_id'

/** Publish an OPEN slot for a future time. */
export async function createReservation(
  supabase: SupabaseClient,
  hostProfileId: string,
  hostUsername: string,
  topicSlug: string,
  language: Language,
  pairKey: string | null,
  scheduledAtIso: string
): Promise<{ reservation: ReservationRow } | { error: string }> {
  const { data, error } = await supabase
    .from('tandem_reservations')
    .insert({
      host_profile_id: hostProfileId,
      host_username: hostUsername,
      topic_slug: topicSlug,
      language,
      pair_key: pairKey,
      scheduled_at: scheduledAtIso,
      status: 'OPEN',
    })
    .select(COLUMNS)
    .single()

  if (error) return { error: error.message }
  return { reservation: data as ReservationRow }
}

/** OPEN slots published by others, not yet past, soonest first. */
export async function listOpenReservations(
  supabase: SupabaseClient,
  profileId: string,
  nowIso: string
): Promise<ReservationRow[]> {
  const { data, error } = await supabase
    .from('tandem_reservations')
    .select(COLUMNS)
    .eq('status', 'OPEN')
    .neq('host_profile_id', profileId)
    .gte('scheduled_at', nowIso)
    .order('scheduled_at', { ascending: true })

  if (error || !data) return []
  return data as ReservationRow[]
}

/** My upcoming reservations, whether I host or booked them (soonest first). */
export async function listMyReservations(
  supabase: SupabaseClient,
  profileId: string
): Promise<ReservationRow[]> {
  const { data, error } = await supabase
    .from('tandem_reservations')
    .select(COLUMNS)
    .or(`host_profile_id.eq.${profileId},guest_profile_id.eq.${profileId}`)
    .neq('status', 'CANCELLED')
    .order('scheduled_at', { ascending: true })

  if (error || !data) return []
  return data as ReservationRow[]
}

/** Claim an OPEN slot as the guest. Fails if it was taken or is your own. */
export async function bookReservation(
  supabase: SupabaseClient,
  guestProfileId: string,
  guestUsername: string,
  reservationId: string
): Promise<{ reservation: ReservationRow } | { error: string }> {
  const { data, error } = await supabase
    .from('tandem_reservations')
    .update({
      guest_profile_id: guestProfileId,
      guest_username: guestUsername,
      status: 'BOOKED',
    })
    .eq('id', reservationId)
    .eq('status', 'OPEN')
    .neq('host_profile_id', guestProfileId)
    .select(COLUMNS)
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'unavailable' } // taken, cancelled, or your own
  return { reservation: data as ReservationRow }
}

/** Cancel a slot you host (marks it CANCELLED so it drops off both lists). */
export async function cancelReservation(
  supabase: SupabaseClient,
  hostProfileId: string,
  reservationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('tandem_reservations')
    .update({ status: 'CANCELLED' })
    .eq('id', reservationId)
    .eq('host_profile_id', hostProfileId)

  return { error: error ? error.message : null }
}

async function getReservationById(
  supabase: SupabaseClient,
  reservationId: string
): Promise<ReservationRow | null> {
  const { data } = await supabase
    .from('tandem_reservations')
    .select(COLUMNS)
    .eq('id', reservationId)
    .maybeSingle()
  return (data as ReservationRow) ?? null
}

/**
 * Enter the tandem session for a reservation at its scheduled time. The first of
 * the two peers to arrive creates the session and pins it onto the reservation
 * (compare-and-set on session_id, which is UNIQUE); the second joins that same
 * session. Returns the session for the caller to open the tandem room with.
 *
 * The CAS handles the near-simultaneous race: if we lose it, we re-read the
 * winner's session_id and join theirs instead (our just-created session is left
 * as a harmless empty WAITING row).
 */
export async function joinReservation(
  supabase: SupabaseClient,
  profileId: string,
  reservationId: string
): Promise<{ session: SessionRow } | { error: string }> {
  const res = await getReservationById(supabase, reservationId)
  if (!res) return { error: 'not_found' }

  // Someone already opened the session → just join it.
  if (res.session_id) {
    const session = await joinSessionById(supabase, profileId, res.session_id)
    return session ? { session } : { error: 'unknown' }
  }

  // We're (maybe) first: create a session and try to claim the reservation.
  const created = await createSession(
    supabase,
    profileId,
    res.topic_slug,
    res.language,
    res.pair_key
  )
  if ('error' in created) return { error: created.error }

  const { data: claimed } = await supabase
    .from('tandem_reservations')
    .update({ session_id: created.session.id })
    .eq('id', reservationId)
    .is('session_id', null)
    .select('session_id')

  if (claimed && claimed.length > 0) {
    // We won the claim → our WAITING session is the shared one.
    return { session: created.session }
  }

  // Lost the race → join whatever session the other peer pinned.
  const fresh = await getReservationById(supabase, reservationId)
  if (fresh?.session_id) {
    const session = await joinSessionById(supabase, profileId, fresh.session_id)
    return session ? { session } : { error: 'unknown' }
  }
  return { error: 'unknown' }
}
