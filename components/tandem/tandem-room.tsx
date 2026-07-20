'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { joinReservation } from '@/lib/reservations-db'
import { isOfferer } from '@/lib/webrtc'
import { useWebRTCCall, type CallStatus } from '@/components/tandem/use-webrtc-call'
import {
  computeTimerState,
  normalizeInviteCode,
  parseDbTimestamp,
  validateMessage,
  MAX_MESSAGE_LENGTH,
} from '@/lib/tandem'
import {
  createSession,
  endSession,
  findOrCreateMatch,
  getSessionById,
  joinByCode,
  loadMessages,
  sendMessage,
  skipToNextPhase,
  type MessageRow,
  type SessionRow,
} from '@/lib/tandem-session'
import type { Language, TopicVocab } from '@/lib/topics'

type Props = {
  profileId: string
  username: string
  topicSlug: string
  topicTitle: string
  language: Language
  pairKey: string | null
  vocabByLanguage: Record<Language, TopicVocab[]>
  /** When arriving from a scheduled reservation, open its session directly. */
  initialReservationId?: string | null
}

/** Union two message lists by id, ordered chronologically (ISO strings sort). */
function mergeMessages(a: MessageRow[], b: MessageRow[]): MessageRow[] {
  const byId = new Map<string, MessageRow>()
  for (const m of a) byId.set(m.id, m)
  for (const m of b) byId.set(m.id, m)
  return [...byId.values()].sort((x, y) =>
    x.created_at.localeCompare(y.created_at)
  )
}

const JOIN_ERRORS: Record<string, string> = {
  invalid_code: 'Ese código no tiene el formato correcto.',
  not_found: 'No encontramos una sala con ese código.',
  full: 'Esa sala ya está llena.',
  unknown: 'No pudimos unirte. Inténtalo de nuevo.',
}

export function TandemRoom({
  profileId,
  username,
  topicSlug,
  topicTitle,
  language,
  pairKey,
  vocabByLanguage,
  initialReservationId = null,
}: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [session, setSession] = useState<SessionRow | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [partnerUsername, setPartnerUsername] = useState<string | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [lobbyError, setLobbyError] = useState<string | null>(null)
  // True while we're queued via matchmaking (vs. hosting a code-shared room):
  // it switches the WAITING view between "Buscando pareja…" and "share this code".
  const [searching, setSearching] = useState(false)
  // True when we opened this session from a scheduled reservation (waiting on a
  // known partner, not a code or the queue) — for the right WAITING copy.
  const [fromReservation, setFromReservation] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Arriving from a scheduled reservation: open its session directly, skipping
  // the lobby. The ref guards the dev StrictMode double-mount.
  const reservationJoinRef = useRef(false)
  useEffect(() => {
    if (!initialReservationId || reservationJoinRef.current) return
    reservationJoinRef.current = true
    joinReservation(supabase, profileId, initialReservationId).then((result) => {
      if ('session' in result) {
        setFromReservation(true)
        setSession(result.session)
      } else {
        setLobbyError('No pudimos abrir la sesión de tu reserva. Vuelve a intentarlo.')
      }
    })
  }, [supabase, profileId, initialReservationId])

  // --- Realtime: new messages + session status changes -------------------
  useEffect(() => {
    if (!session?.id) return
    const sessionId = session.id
    let channel: RealtimeChannel | null = null
    let cancelled = false

    loadMessages(supabase, sessionId).then((rows) =>
      setMessages((prev) => mergeMessages(prev, rows))
    )

    ;(async () => {
      // postgres_changes is filtered by RLS using the *authenticated* user's
      // JWT. Without this the Realtime socket only carries the anon apikey,
      // auth.uid() is null, our policies reject everything and no events ever
      // arrive. Pin the user's access token onto the Realtime client first.
      const { data } = await supabase.auth.getSession()
      await supabase.realtime.setAuth(data.session?.access_token ?? null)
      if (cancelled) return

      const ch = supabase.channel(`tandem:${sessionId}`, {
        config: { presence: { key: profileId } },
      })

      ch.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row]
          )
        }
      )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'tandem_sessions',
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            setSession((prev) =>
              prev ? { ...prev, ...(payload.new as SessionRow) } : prev
            )
          }
        )
        // Presence carries each peer's username live, so we can show who you're
        // talking to without reading the other person's profile row (RLS only
        // exposes your own participant/profile data).
        .on('presence', { event: 'sync' }, () => {
          const state = ch.presenceState<{ username: string }>()
          const partner = Object.entries(state)
            .filter(([key]) => key !== profileId)
            .flatMap(([, entries]) => entries)[0]
          setPartnerUsername(partner?.username ?? null)
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            ch.track({ username })
            // Backfill anything that changed during the subscribe handshake —
            // events fired before we were live never reach us. Two things:
            //  * messages: the first line used to be lost for the peer.
            //  * session status: a matchmaking partner can flip us to ACTIVE in
            //    this window; without re-reading it the waiter is stuck forever.
            loadMessages(supabase, sessionId).then((rows) => {
              if (cancelled) return
              setMessages((prev) => mergeMessages(prev, rows))
            })
            getSessionById(supabase, sessionId).then((row) => {
              if (cancelled || !row) return
              setSession((prev) => (prev ? { ...prev, ...row } : prev))
            })
          }
        })

      channel = ch
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, session?.id, profileId, username])

  // Fallback while WAITING: re-check the session every few seconds until it goes
  // ACTIVE. The realtime UPDATE + the subscribe-gap backfill usually flip us, but
  // when both peers join within the same second (reservations especially) a
  // single backfill read can hit a lagging replica and miss the flip. Polling
  // guarantees the waiter self-heals. Stops as soon as the status changes.
  useEffect(() => {
    if (session?.status !== 'WAITING' || !session.id) return
    const sessionId = session.id
    const id = setInterval(() => {
      getSessionById(supabase, sessionId).then((row) => {
        if (row && row.status !== 'WAITING') {
          setSession((prev) => (prev ? { ...prev, ...row } : prev))
        }
      })
    }, 2500)
    return () => clearInterval(id)
  }, [supabase, session?.status, session?.id])

  // --- Timer tick (only while the session is live) -----------------------
  const startedAtMs = session?.started_at ? parseDbTimestamp(session.started_at) : null
  const isActive = session?.status === 'ACTIVE' && startedAtMs !== null

  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [isActive])

  const timer = isActive ? computeTimerState(startedAtMs as number, now) : null

  // When the clock runs out, flip the session to ENDED (idempotent; both
  // peers may fire it, the DB update is harmless either way).
  const endedRef = useRef(false)
  useEffect(() => {
    if (timer?.phase === 'ended' && session?.id && !endedRef.current) {
      endedRef.current = true
      endSession(supabase, session.id)
      setSession((prev) => (prev ? { ...prev, status: 'ENDED' } : prev))
    }
  }, [timer?.phase, session?.id, supabase])

  // --- Lobby actions -----------------------------------------------------
  // Matchmaking: pair with a waiting peer (opposite language, same pair_key) or
  // queue up. On `matched: false` we become the waiter; the realtime listener
  // flips us to ACTIVE when someone joins, so we just show "Buscando pareja…".
  const handleMatch = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await findOrCreateMatch(
      supabase,
      profileId,
      topicSlug,
      language,
      pairKey
    )
    setBusy(false)
    if ('error' in result) {
      setLobbyError('No pudimos buscar pareja. Inténtalo de nuevo.')
      return
    }
    setSearching(!result.matched)
    setSession(result.session)
  }, [supabase, profileId, topicSlug, language, pairKey])

  const handleCreate = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await createSession(supabase, profileId, topicSlug, language, pairKey)
    setBusy(false)
    if ('error' in result) {
      setLobbyError('No pudimos crear la sala. Inténtalo de nuevo.')
      return
    }
    setSearching(false)
    setSession(result.session)
  }, [supabase, profileId, topicSlug, language, pairKey])

  const handleJoin = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await joinByCode(supabase, profileId, codeInput)
    setBusy(false)
    if ('error' in result) {
      setLobbyError(JOIN_ERRORS[result.error] ?? JOIN_ERRORS.unknown)
      return
    }
    setSession(result.session)
  }, [supabase, profileId, codeInput])

  // Skip the rest of the current language and jump to the next phase (EN→ES).
  // Shifting started_at recomputes the timer on both clients (via the
  // tandem_sessions UPDATE listener); we also set it locally for instant feedback.
  const handleSkipPhase = useCallback(async () => {
    if (!session?.id || startedAtMs === null) return
    const result = await skipToNextPhase(supabase, session.id, startedAtMs)
    if (result) {
      setSession((prev) => (prev ? { ...prev, started_at: result.startedAt } : prev))
    }
  }, [supabase, session, startedAtMs])

  // End the conversation early. endSession flips status to ENDED, which reaches
  // the peer through the same tandem_sessions UPDATE listener.
  const handleEndEarly = useCallback(async () => {
    if (!session?.id) return
    endedRef.current = true
    await endSession(supabase, session.id)
    setSession((prev) => (prev ? { ...prev, status: 'ENDED' } : prev))
  }, [supabase, session])

  // Leave the matchmaking queue: end our WAITING session so it stops being a
  // candidate for others, then drop back to the lobby.
  const handleCancelSearch = useCallback(async () => {
    if (session?.id) await endSession(supabase, session.id)
    setSearching(false)
    setSession(null)
  }, [supabase, session])

  // --- Views -------------------------------------------------------------
  if (!session) {
    return (
      <Lobby
        codeInput={codeInput}
        setCodeInput={setCodeInput}
        busy={busy}
        error={lobbyError}
        canMatch={pairKey !== null}
        onMatch={handleMatch}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />
    )
  }

  if (session.status === 'WAITING') {
    return (
      <WaitingRoom
        inviteCode={session.invite_code}
        topicTitle={topicTitle}
        searching={searching}
        fromReservation={fromReservation}
        onCancel={handleCancelSearch}
      />
    )
  }

  return (
    <ChatView
      supabase={supabase}
      profileId={profileId}
      session={session}
      messages={messages}
      timer={timer}
      vocabByLanguage={vocabByLanguage}
      partnerUsername={partnerUsername}
      onSkipPhase={handleSkipPhase}
      onEndEarly={handleEndEarly}
      onSend={async (body) => {
        const { row, error } = await sendMessage(
          supabase,
          session.id,
          profileId,
          body
        )
        // Render our own message immediately; the Realtime echo dedups by id.
        if (row) setMessages((prev) => mergeMessages(prev, [row]))
        return { error }
      }}
      onRestart={() => {
        endedRef.current = false
        setSession(null)
        setMessages([])
        setPartnerUsername(null)
        setCodeInput('')
        setSearching(false)
      }}
    />
  )
}

// ---------------------------------------------------------------------------

type LobbyProps = {
  codeInput: string
  setCodeInput: (v: string) => void
  busy: boolean
  error: string | null
  canMatch: boolean
  onMatch: () => void
  onCreate: () => void
  onJoin: () => void
}

function Lobby({
  codeInput,
  setCodeInput,
  busy,
  error,
  canMatch,
  onMatch,
  onCreate,
  onJoin,
}: LobbyProps) {
  return (
    <div className="space-y-6">
      {canMatch && (
        <div className="bg-emerald-500 rounded-3xl p-8 text-center text-white">
          <p className="text-5xl mb-3">🔍</p>
          <h2 className="text-2xl font-black mb-2">Buscar pareja</h2>
          <p className="text-sm font-semibold text-emerald-50 leading-relaxed mb-6 max-w-md mx-auto">
            Te emparejamos al instante con alguien que practica el otro idioma.
            Sin coordinar nada: un clic y a hablar.
          </p>
          <Button variant="secondary" size="lg" onClick={onMatch} disabled={busy}>
            {busy ? 'Buscando…' : 'Buscar pareja 🔍'}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4 text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-black uppercase tracking-wider">
          o conecta con alguien que conoces
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 flex flex-col">
        <p className="text-5xl mb-3">🎙️</p>
        <h2 className="text-xl font-black text-stone-900 mb-2">Crear una sala</h2>
        <p className="text-sm font-semibold text-stone-500 leading-relaxed mb-6 flex-1">
          Te damos un código para compartir. Cuando tu pareja entre, empieza la
          conversación: 5 min en inglés y 5 min en español.
        </p>
        <Button size="lg" onClick={onCreate} disabled={busy}>
          {busy ? 'Creando…' : 'Crear sala →'}
        </Button>
      </div>

      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 flex flex-col">
        <p className="text-5xl mb-3">🔑</p>
        <h2 className="text-xl font-black text-stone-900 mb-2">Unirme con código</h2>
        <p className="text-sm font-semibold text-stone-500 leading-relaxed mb-4">
          ¿Tienes un código de tu pareja? Escríbelo aquí para entrar a su sala.
        </p>
        <Input
          value={codeInput}
          onChange={(e) => setCodeInput(normalizeInviteCode(e.target.value))}
          placeholder="Ej: AB2CD3"
          maxLength={6}
          className="mb-4 text-center tracking-[0.3em] font-black uppercase"
          disabled={busy}
        />
        <Button
          variant="secondary"
          size="lg"
          onClick={onJoin}
          disabled={busy || codeInput.length < 6}
        >
          {busy ? 'Entrando…' : 'Unirme →'}
        </Button>
        {error && (
          <p className="mt-4 text-sm font-bold text-red-600">{error}</p>
        )}
      </div>
      </div>
    </div>
  )
}

function WaitingRoom({
  inviteCode,
  topicTitle,
  searching,
  fromReservation,
  onCancel,
}: {
  inviteCode: string
  topicTitle: string
  searching: boolean
  fromReservation: boolean
  onCancel: () => void
}) {
  if (fromReservation) {
    return (
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
        <p className="text-6xl mb-4 animate-pulse">⏳</p>
        <h2 className="text-2xl font-black text-stone-900 mb-2">
          Esperando a tu pareja…
        </h2>
        <p className="text-sm font-semibold text-stone-500 mb-8">
          Tienes una reserva a esta hora. En cuanto tu pareja entre, empezáis
          automáticamente.
        </p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Salir
        </Button>
      </div>
    )
  }

  if (searching) {
    return (
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
        <p className="text-6xl mb-4 animate-pulse">🔍</p>
        <h2 className="text-2xl font-black text-stone-900 mb-2">
          Buscando pareja…
        </h2>
        <p className="text-sm font-semibold text-stone-500 mb-8">
          En cuanto alguien busque practicar contigo, empezáis a hablar
          automáticamente. Puedes dejar esta pestaña abierta.
        </p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Cancelar búsqueda
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
      <p className="text-6xl mb-4 animate-pulse">⏳</p>
      <h2 className="text-2xl font-black text-stone-900 mb-2">
        Esperando a tu pareja…
      </h2>
      <p className="text-sm font-semibold text-stone-500 mb-8">
        Comparte este código. Hablaréis sobre <strong>{topicTitle}</strong>.
      </p>
      <div className="inline-flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-8 py-5">
        <span className="text-4xl font-black tracking-[0.3em] text-emerald-700">
          {inviteCode}
        </span>
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mt-8">
        La conversación empieza sola cuando tu pareja entre
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------

type ChatViewProps = {
  supabase: SupabaseClient
  profileId: string
  session: SessionRow
  messages: MessageRow[]
  timer: ReturnType<typeof computeTimerState> | null
  vocabByLanguage: Record<Language, TopicVocab[]>
  partnerUsername: string | null
  onSkipPhase: () => void
  onEndEarly: () => void
  onSend: (body: string) => Promise<{ error: string | null }>
  onRestart: () => void
}

function ChatView({
  supabase,
  profileId,
  session,
  messages,
  timer,
  vocabByLanguage,
  partnerUsername,
  onSkipPhase,
  onEndEarly,
  onSend,
  onRestart,
}: ChatViewProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [inCall, setInCall] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const ended = session.status === 'ENDED' || timer?.phase === 'ended'

  // --- Video call (WebRTC) -----------------------------------------------
  const call = useWebRTCCall({
    supabase,
    sessionId: session.id,
    profileId,
    isOfferer: isOfferer(profileId, session.host_profile_id),
    enabled: inCall && !ended,
  })

  // Feed each stream into its <video> (the remote one carries audio too).
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = call.remoteStream
  }, [call.remoteStream])
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = call.localStream
  }, [call.localStream])
  // "Skip language" only makes sense while there's a next phase to skip to.
  const canSkip = timer?.phase === 'EN'
  // Panel follows the timer phase: English vocab during EN, Spanish during ES.
  const panelLang: Language = timer?.phase === 'ES' ? 'ES' : 'EN'

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function submit() {
    if (!validateMessage(draft).ok || sending) return
    setSending(true)
    const { error } = await onSend(draft)
    setSending(false)
    if (!error) setDraft('')
  }

  return (
    <div className="space-y-6">
      {inCall && (
        <CallStage
          status={call.status}
          error={call.error}
          cameraOff={call.cameraOff}
          remoteVideoRef={remoteVideoRef}
          localVideoRef={localVideoRef}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col h-[34rem]">
        <div className="px-5 py-2.5 border-b-2 border-stone-100 flex items-center gap-2 text-sm font-bold text-stone-600">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              partnerUsername ? 'bg-emerald-500' : 'bg-stone-300'
            )}
          />
          {partnerUsername ? (
            <>
              Hablando con{' '}
              <span className="text-stone-900 font-black">@{partnerUsername}</span>
            </>
          ) : (
            <span className="text-stone-400">Tu pareja está conectándose…</span>
          )}
        </div>
        <TimerBanner timer={timer} ended={ended} />

        {!ended && (
          <div className="px-5 py-2 border-b-2 border-stone-100 flex items-center justify-between gap-2">
            <CallControls
              inCall={inCall}
              status={call.status}
              micMuted={call.micMuted}
              cameraOff={call.cameraOff}
              hasVideo={call.hasVideo}
              error={call.error}
              onStart={() => setInCall(true)}
              onHangUp={() => setInCall(false)}
              onToggleMic={call.toggleMic}
              onToggleCamera={call.toggleCamera}
            />
            <div className="flex items-center gap-2">
            {canSkip && (
              <Button size="sm" variant="secondary" onClick={onSkipPhase}>
                Pasar al español 🇪🇸
              </Button>
            )}
            {confirmingEnd ? (
              <>
                <span className="text-xs font-bold text-stone-500 mr-1">
                  ¿Terminar la conversación?
                </span>
                <Button size="sm" variant="danger" onClick={onEndEarly}>
                  Sí, terminar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfirmingEnd(false)}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmingEnd(true)}
              >
                Terminar
              </Button>
            )}
            </div>
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && !ended && (
            <p className="text-center text-sm font-semibold text-stone-400 mt-8">
              Saluda para romper el hielo 👋
            </p>
          )}
          {messages.map((m) => {
            const mine = m.profile_id === profileId
            return (
              <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    mine
                      ? 'max-w-[75%] bg-emerald-500 text-white rounded-2xl rounded-br-md px-4 py-2.5 text-sm font-semibold'
                      : 'max-w-[75%] bg-stone-100 text-stone-800 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm font-semibold'
                  }
                >
                  {m.body}
                </div>
              </div>
            )
          })}
        </div>

        {ended ? (
          <div className="border-t-2 border-stone-100 p-5 text-center">
            <p className="text-sm font-black text-stone-700 mb-3">
              ¡Sesión terminada! 🎉 Practicaste los dos idiomas.
            </p>
            <Button size="sm" onClick={onRestart}>
              Nueva sesión
            </Button>
          </div>
        ) : (
          <div className="border-t-2 border-stone-100 p-4 flex items-end gap-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Escribe un mensaje…"
              maxLength={MAX_MESSAGE_LENGTH}
              className="flex-1"
            />
            <Button onClick={submit} disabled={sending || draft.trim().length === 0}>
              Enviar
            </Button>
          </div>
        )}
      </div>

      <VocabPanel vocabulary={vocabByLanguage[panelLang]} language={panelLang} />
      </div>
    </div>
  )
}

type CallControlsProps = {
  inCall: boolean
  status: CallStatus
  micMuted: boolean
  cameraOff: boolean
  hasVideo: boolean
  error: string | null
  onStart: () => void
  onHangUp: () => void
  onToggleMic: () => void
  onToggleCamera: () => void
}

function CallControls({
  inCall,
  status,
  micMuted,
  cameraOff,
  hasVideo,
  error,
  onStart,
  onHangUp,
  onToggleMic,
  onToggleCamera,
}: CallControlsProps) {
  if (!inCall) {
    return (
      <Button size="sm" variant="secondary" onClick={onStart}>
        Iniciar videollamada 🎥
      </Button>
    )
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-red-600 max-w-[16rem]">
          {error ?? 'No se pudo conectar la llamada.'}
        </span>
        <Button size="sm" variant="secondary" onClick={onHangUp}>
          Cerrar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-black">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            status === 'connected' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
          )}
        />
        <span className={status === 'connected' ? 'text-emerald-600' : 'text-stone-500'}>
          {status === 'connected' ? 'En videollamada 🎥' : 'Conectando…'}
        </span>
      </span>
      {status === 'connected' && (
        <>
          <Button size="sm" variant="secondary" onClick={onToggleMic}>
            {micMuted ? 'Micro 🔇' : 'Micro 🎙️'}
          </Button>
          {hasVideo && (
            <Button size="sm" variant="secondary" onClick={onToggleCamera}>
              {cameraOff ? 'Cámara 📷' : 'Cámara 🎥'}
            </Button>
          )}
        </>
      )}
      <Button size="sm" variant="danger" onClick={onHangUp}>
        Colgar
      </Button>
    </div>
  )
}

function CallStage({
  status,
  error,
  cameraOff,
  remoteVideoRef,
  localVideoRef,
}: {
  status: CallStatus
  error: string | null
  cameraOff: boolean
  remoteVideoRef: RefObject<HTMLVideoElement | null>
  localVideoRef: RefObject<HTMLVideoElement | null>
}) {
  return (
    <div className="relative w-full max-h-[26rem] aspect-video bg-stone-900 rounded-3xl overflow-hidden">
      {/* Partner (fills the stage; carries the remote audio too). */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {status !== 'connected' && (
        <div className="absolute inset-0 grid place-items-center bg-stone-900/80 text-center px-6">
          <p className="text-sm font-black text-white">
            {status === 'failed'
              ? (error ?? 'No se pudo conectar la videollamada.')
              : 'Conectando videollamada… tu pareja debe pulsar «Iniciar videollamada» también.'}
          </p>
        </div>
      )}

      {/* Your own camera, picture-in-picture. Muted so you don't hear yourself. */}
      <div className="absolute bottom-3 right-3 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden border-2 border-white/60 bg-stone-800">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {cameraOff && (
          <div className="absolute inset-0 grid place-items-center bg-stone-800 text-[10px] font-black text-white/80">
            Cámara apagada
          </div>
        )}
      </div>
    </div>
  )
}

function TimerBanner({
  timer,
  ended,
}: {
  timer: ReturnType<typeof computeTimerState> | null
  ended: boolean
}) {
  if (ended || !timer || timer.phase === 'ended') {
    return (
      <div className="bg-stone-100 px-5 py-3 text-center text-sm font-black text-stone-500">
        Sesión finalizada
      </div>
    )
  }
  const mins = Math.floor(timer.secondsLeftInPhase / 60)
  const secs = timer.secondsLeftInPhase % 60
  const speaking = timer.phase === 'EN' ? 'Habla en inglés 🇬🇧' : 'Habla en español 🇪🇸'
  return (
    <div className="bg-emerald-500 text-white px-5 py-3 flex items-center justify-between">
      <span className="text-sm font-black uppercase tracking-wide">{speaking}</span>
      <span className="text-sm font-black tabular-nums">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

function VocabPanel({
  vocabulary,
  language,
}: {
  vocabulary: TopicVocab[]
  language: Language
}) {
  if (vocabulary.length === 0) return null
  const label = language === 'EN' ? 'Inglés 🇬🇧' : 'Español 🇪🇸'
  return (
    <aside className="bg-white border-2 border-stone-100 rounded-3xl p-5 h-fit lg:max-h-[34rem] lg:overflow-y-auto">
      <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
        📖 Vocabulario — {label}
      </h3>
      <ul className="space-y-2.5">
        {vocabulary.map((v) => (
          <li key={v.term} className="text-sm">
            <span className="font-black text-stone-800">{v.term}</span>
            <span className="block text-stone-400 font-semibold">{v.translation}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
