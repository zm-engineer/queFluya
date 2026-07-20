'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { isJoinable, isValidScheduledTime, minutesUntil } from '@/lib/reservations'
import {
  bookReservation,
  cancelReservation,
  createReservation,
  listMyReservations,
  listOpenReservations,
  type ReservationRow,
} from '@/lib/reservations-db'
import type { Language } from '@/lib/topics'

type PublishTopic = { slug: string; title: string; language: Language; pairKey: string | null }

type Props = {
  profileId: string
  username: string
  /** Topics the user can publish (their target language). */
  topics: PublishTopic[]
  /** slug → {title, language} for showing others' slots (any language). */
  titleBySlug: Record<string, { title: string; language: Language }>
}

const FLAG: Record<Language, string> = { EN: '🇬🇧', ES: '🇪🇸' }

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function countdownLabel(scheduledAtMs: number, nowMs: number): string {
  const mins = minutesUntil(scheduledAtMs, nowMs)
  if (isJoinable(scheduledAtMs, nowMs)) return '¡Es la hora!'
  if (mins < 60) return `en ${mins} min`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `en ${hours} h`
  return `en ${Math.round(hours / 24)} d`
}

export function ReservationsPanel({ profileId, username, topics, titleBySlug }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [open, setOpen] = useState<ReservationRow[]>([])
  const [mine, setMine] = useState<ReservationRow[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [topicSlug, setTopicSlug] = useState(topics[0]?.slug ?? '')
  const [when, setWhen] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    const nowIso = new Date().toISOString()
    // setState lives in the .then callback (not a synchronous effect-body call),
    // which is the shape the react-hooks purity rule accepts.
    Promise.all([
      listOpenReservations(supabase, profileId, nowIso),
      listMyReservations(supabase, profileId),
    ]).then(([o, m]) => {
      setOpen(o)
      setMine(m)
    })
  }, [supabase, profileId])

  useEffect(() => {
    reload()
  }, [reload])

  // Tick for the countdowns + pick up others' new/booked slots periodically.
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
      reload()
    }, 15000)
    return () => clearInterval(id)
  }, [reload])

  const title = (slug: string) => titleBySlug[slug]?.title ?? slug
  const lang = (slug: string): Language | undefined => titleBySlug[slug]?.language

  async function handlePublish() {
    setError(null)
    const topic = topics.find((t) => t.slug === topicSlug)
    if (!topic || !when) return
    const scheduledMs = new Date(when).getTime()
    if (!isValidScheduledTime(scheduledMs, Date.now())) {
      setError('Elige una fecha y hora futuras.')
      return
    }
    setBusy(true)
    const result = await createReservation(
      supabase,
      profileId,
      username,
      topic.slug,
      topic.language,
      topic.pairKey,
      new Date(scheduledMs).toISOString()
    )
    setBusy(false)
    if ('error' in result) {
      setError('No pudimos publicar el hueco. Inténtalo de nuevo.')
      return
    }
    setWhen('')
    reload()
  }

  async function handleBook(id: string) {
    setError(null)
    setBusy(true)
    const result = await bookReservation(supabase, profileId, username, id)
    setBusy(false)
    if ('error' in result) {
      setError(
        result.error === 'unavailable'
          ? 'Ese hueco ya no está disponible.'
          : 'No pudimos reservar. Inténtalo de nuevo.'
      )
    }
    reload()
  }

  async function handleCancel(id: string) {
    setBusy(true)
    await cancelReservation(supabase, profileId, id)
    setBusy(false)
    reload()
  }

  // Local time, no seconds, for the datetime-local min (can't book the past).
  // Derived from the `now` tick so we don't call impure Date.now() during render.
  const minWhen = new Date(now - new Date(now).getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  return (
    <div className="space-y-8">
      {/* Publish a slot */}
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-black text-stone-900 mb-1">Publicar un hueco</h2>
        <p className="text-sm font-semibold text-stone-500 mb-5">
          Elige un tema y una hora. Quien reserve practicará el idioma opuesto contigo.
        </p>
        {topics.length === 0 ? (
          <p className="text-sm font-bold text-stone-400">
            No tienes temas disponibles para publicar todavía.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <label className="flex-1">
              <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
                Tema
              </span>
              <select
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value)}
                className="w-full rounded-2xl border-2 border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {topics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title} {FLAG[t.language]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1">
              <span className="block text-xs font-black uppercase tracking-wider text-stone-400 mb-1.5">
                Cuándo
              </span>
              <Input
                type="datetime-local"
                value={when}
                min={minWhen}
                onChange={(e) => setWhen(e.target.value)}
              />
            </label>
            <Button onClick={handlePublish} disabled={busy || !when}>
              Publicar
            </Button>
          </div>
        )}
        {error && <p className="mt-4 text-sm font-bold text-red-600">{error}</p>}
      </div>

      {/* My reservations */}
      <section>
        <h2 className="text-lg font-black text-stone-900 mb-3">Mis reservas</h2>
        {mine.length === 0 ? (
          <p className="text-sm font-semibold text-stone-400">
            Aún no tienes reservas. Publica un hueco o reserva uno de abajo.
          </p>
        ) : (
          <ul className="space-y-3">
            {mine.map((r) => {
              const ms = new Date(r.scheduled_at).getTime()
              const iAmHost = r.host_profile_id === profileId
              const withWhom = iAmHost ? r.guest_username : r.host_username
              return (
                <li
                  key={r.id}
                  className="bg-white border-2 border-stone-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-black text-stone-800 truncate">
                      {title(r.topic_slug)} {lang(r.topic_slug) && FLAG[lang(r.topic_slug)!]}
                    </p>
                    <p className="text-xs font-bold text-stone-500">
                      {formatWhen(r.scheduled_at)} · {countdownLabel(ms, now)}
                      {withWhom && (
                        <>
                          {' · con '}
                          <span className="text-stone-700">@{withWhom}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={
                        r.status === 'BOOKED'
                          ? 'text-xs font-black text-emerald-600'
                          : 'text-xs font-black text-amber-500'
                      }
                    >
                      {r.status === 'BOOKED'
                        ? 'Confirmada'
                        : iAmHost
                          ? 'Esperando'
                          : 'Reservada'}
                    </span>
                    {isJoinable(ms, now) && r.status === 'BOOKED' && (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/topics/${r.topic_slug}/tandem?reservation=${r.id}`)
                        }
                      >
                        Únete →
                      </Button>
                    )}
                    {iAmHost && r.status === 'OPEN' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCancel(r.id)}
                        disabled={busy}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Open slots to book */}
      <section>
        <h2 className="text-lg font-black text-stone-900 mb-3">Huecos disponibles</h2>
        {open.length === 0 ? (
          <p className="text-sm font-semibold text-stone-400">
            No hay huecos publicados ahora mismo. ¡Publica el primero!
          </p>
        ) : (
          <ul className="space-y-3">
            {open.map((r) => {
              const ms = new Date(r.scheduled_at).getTime()
              return (
                <li
                  key={r.id}
                  className="bg-white border-2 border-stone-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-black text-stone-800 truncate">
                      {title(r.topic_slug)} {FLAG[r.language]}
                    </p>
                    <p className="text-xs font-bold text-stone-500">
                      {formatWhen(r.scheduled_at)} · {countdownLabel(ms, now)}
                      {r.host_username && (
                        <>
                          {' · de '}
                          <span className="text-stone-700">@{r.host_username}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleBook(r.id)} disabled={busy}>
                    Reservar
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
