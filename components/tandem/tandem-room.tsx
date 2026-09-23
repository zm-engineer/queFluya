'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { joinReservation } from '@/lib/reservations-db'
import { isOfferer } from '@/lib/webrtc'
import { useWebRTCCall, type CallStatus } from '@/components/tandem/use-webrtc-call'
import { useDict } from '@/components/i18n/language-provider'
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
  /** The topic's practice phrases per language — the in-call help overlay. */
  phrasesByLanguage: Record<Language, string[]>
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

export function TandemRoom({
  profileId,
  username,
  topicSlug,
  topicTitle,
  language,
  pairKey,
  vocabByLanguage,
  phrasesByLanguage,
  initialReservationId = null,
}: Props) {
  const supabase = useMemo(() => createClient(), [])
  const t = useDict()

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
        setLobbyError(t.room.reservationFail)
      }
    })
  }, [supabase, profileId, initialReservationId, t])

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
      setLobbyError(t.room.matchFail)
      return
    }
    setSearching(!result.matched)
    setSession(result.session)
  }, [supabase, profileId, topicSlug, language, pairKey, t])

  const handleCreate = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await createSession(supabase, profileId, topicSlug, language, pairKey)
    setBusy(false)
    if ('error' in result) {
      setLobbyError(t.room.createFail)
      return
    }
    setSearching(false)
    setSession(result.session)
  }, [supabase, profileId, topicSlug, language, pairKey, t])

  const handleJoin = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await joinByCode(supabase, profileId, codeInput)
    setBusy(false)
    if ('error' in result) {
      setLobbyError(
        t.room.joinErrors[result.error as keyof typeof t.room.joinErrors] ??
          t.room.joinErrors.unknown
      )
      return
    }
    setSession(result.session)
  }, [supabase, profileId, codeInput, t])

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
      phrasesByLanguage={phrasesByLanguage}
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
  const t = useDict()
  return (
    <div className="space-y-6">
      {canMatch && (
        <div className="bg-emerald-500 rounded-3xl p-8 text-center text-white">
          <p className="text-5xl mb-3">🔍</p>
          <h2 className="text-2xl font-black mb-2">{t.room.match}</h2>
          <p className="text-sm font-semibold text-emerald-50 leading-relaxed mb-6 max-w-md mx-auto">
            {t.room.matchSubtitle}
          </p>
          <Button variant="secondary" size="lg" onClick={onMatch} disabled={busy}>
            {busy ? t.room.searching : t.room.matchCta}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-4 text-stone-400">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-black uppercase tracking-wider">
          {t.room.orKnown}
        </span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 flex flex-col">
        <p className="text-5xl mb-3">🎙️</p>
        <h2 className="text-xl font-black text-stone-900 mb-2">{t.room.createRoom}</h2>
        <p className="text-sm font-semibold text-stone-500 leading-relaxed mb-6 flex-1">
          {t.room.createRoomDesc}
        </p>
        <Button size="lg" onClick={onCreate} disabled={busy}>
          {busy ? t.room.creating : t.room.createCta}
        </Button>
      </div>

      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 flex flex-col">
        <p className="text-5xl mb-3">🔑</p>
        <h2 className="text-xl font-black text-stone-900 mb-2">{t.room.joinWithCode}</h2>
        <p className="text-sm font-semibold text-stone-500 leading-relaxed mb-4">
          {t.room.joinWithCodeDesc}
        </p>
        <Input
          value={codeInput}
          onChange={(e) => setCodeInput(normalizeInviteCode(e.target.value))}
          placeholder={t.room.codePlaceholder}
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
          {busy ? t.room.joining : t.room.joinCta}
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
  const t = useDict()
  if (fromReservation) {
    return (
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
        <p className="text-6xl mb-4 animate-pulse">⏳</p>
        <h2 className="text-2xl font-black text-stone-900 mb-2">
          {t.room.waitingTitle}
        </h2>
        <p className="text-sm font-semibold text-stone-500 mb-8">
          {t.room.waitReservation}
        </p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t.room.exit}
        </Button>
      </div>
    )
  }

  if (searching) {
    return (
      <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
        <p className="text-6xl mb-4 animate-pulse">🔍</p>
        <h2 className="text-2xl font-black text-stone-900 mb-2">
          {t.room.searchingTitle}
        </h2>
        <p className="text-sm font-semibold text-stone-500 mb-8">
          {t.room.searchingBody}
        </p>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          {t.room.cancelSearch}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-12 text-center">
      <p className="text-6xl mb-4 animate-pulse">⏳</p>
      <h2 className="text-2xl font-black text-stone-900 mb-2">
        {t.room.waitingTitle}
      </h2>
      <p className="text-sm font-semibold text-stone-500 mb-8">
        {t.room.shareCodePre} <strong>{topicTitle}</strong>.
      </p>
      <div className="inline-flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-2xl px-8 py-5">
        <span className="text-4xl font-black tracking-[0.3em] text-emerald-700">
          {inviteCode}
        </span>
      </div>
      <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mt-8">
        {t.room.autoStart}
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
  phrasesByLanguage: Record<Language, string[]>
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
  phrasesByLanguage,
  partnerUsername,
  onSkipPhase,
  onEndEarly,
  onSend,
  onRestart,
}: ChatViewProps) {
  const t = useDict()
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const [inCall, setInCall] = useState(false)
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
  // `inCall` is a dep so the stream is re-attached when the immersive view
  // (which owns the <video> elements) mounts after an already-live stream.
  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = call.remoteStream
  }, [call.remoteStream, inCall])
  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = call.localStream
  }, [call.localStream, inCall])
  // "Skip language" only makes sense while there's a next phase to skip to.
  const canSkip = timer?.phase === 'EN'
  // Panel follows the timer phase: English vocab during EN, Spanish during ES.
  const panelLang: Language = timer?.phase === 'ES' ? 'ES' : 'EN'

  // In a video call → the immersive, full-screen "gaming" layout: the partner
  // fills the screen, chat is overlaid at the bottom and the topic's help
  // phrases sit in a corner. Leaving the call (or the session ending) drops
  // back to the plain chat view below.
  if (inCall && !ended) {
    return (
      <ImmersiveCall
        status={call.status}
        error={call.error}
        micMuted={call.micMuted}
        cameraOff={call.cameraOff}
        hasVideo={call.hasVideo}
        remoteVideoRef={remoteVideoRef}
        localVideoRef={localVideoRef}
        onToggleMic={call.toggleMic}
        onToggleCamera={call.toggleCamera}
        onHangUp={() => setInCall(false)}
        timer={timer}
        canSkip={canSkip}
        onSkipPhase={onSkipPhase}
        partnerUsername={partnerUsername}
        phrases={phrasesByLanguage[panelLang]}
        phrasesLang={panelLang}
        messages={messages}
        profileId={profileId}
        onSend={onSend}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col">
        <div className="px-5 py-2.5 border-b-2 border-stone-100 flex items-center gap-2 text-sm font-bold text-stone-600">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              partnerUsername ? 'bg-emerald-500' : 'bg-stone-300'
            )}
          />
          {partnerUsername ? (
            <>
              {t.room.talkingWith}{' '}
              <span className="text-stone-900 font-black">@{partnerUsername}</span>
            </>
          ) : (
            <span className="text-stone-400">{t.room.connecting}</span>
          )}
        </div>
        <TimerBanner timer={timer} ended={ended} />

        {ended ? (
          <div className="p-10 text-center">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-sm font-black text-stone-700 mb-4">
              {t.room.sessionEnded}
            </p>
            <Button size="sm" onClick={onRestart}>
              {t.room.newSession}
            </Button>
          </div>
        ) : (
          // Pre-call lobby: the room is a video call, so this screen only starts
          // it (or rejoins after hanging up) — the chat lives inside the call.
          <div className="p-8 sm:p-10 text-center">
            <p className="text-5xl mb-4">🎥</p>
            <h2 className="text-xl font-black text-stone-900 mb-2">
              {t.room.callLobbyTitle}
            </h2>
            <p className="text-sm font-semibold text-stone-500 mb-6 max-w-sm mx-auto leading-relaxed">
              {t.room.callLobbyBody}
            </p>
            <Button size="lg" onClick={() => setInCall(true)}>
              {t.room.startCall}
            </Button>
            <div className="mt-6 flex items-center justify-center gap-2">
              {canSkip && (
                <Button size="sm" variant="secondary" onClick={onSkipPhase}>
                  {t.room.skip}
                </Button>
              )}
              {confirmingEnd ? (
                <>
                  <span className="text-xs font-bold text-stone-500 mr-1">
                    {t.room.confirmEnd}
                  </span>
                  <Button size="sm" variant="danger" onClick={onEndEarly}>
                    {t.room.endYes}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setConfirmingEnd(false)}
                  >
                    {t.room.cancel}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirmingEnd(true)}
                >
                  {t.room.end}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <VocabPanel vocabulary={vocabByLanguage[panelLang]} language={panelLang} />
      </div>
    </div>
  )
}

// A round, translucent control button for the immersive call bar.
function RoundBtn({
  onClick,
  children,
  label,
  active,
  danger,
}: {
  onClick: () => void
  children: ReactNode
  label: string
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'w-12 h-12 rounded-full grid place-items-center text-xl transition-colors shadow-lg',
        danger
          ? 'bg-red-500 hover:bg-red-400 text-white'
          : active === false
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-white/90 hover:bg-white text-stone-900'
      )}
    >
      {children}
    </button>
  )
}

// The full-screen, "video-game" call layout: the partner fills the viewport,
// your camera is a PiP, the timer + controls sit in a top/bottom bar, chat is
// overlaid at the bottom and the topic's help phrases live in a corner.
function ImmersiveCall({
  status,
  error,
  micMuted,
  cameraOff,
  hasVideo,
  remoteVideoRef,
  localVideoRef,
  onToggleMic,
  onToggleCamera,
  onHangUp,
  timer,
  canSkip,
  onSkipPhase,
  partnerUsername,
  phrases,
  phrasesLang,
  messages,
  profileId,
  onSend,
}: {
  status: CallStatus
  error: string | null
  micMuted: boolean
  cameraOff: boolean
  hasVideo: boolean
  remoteVideoRef: RefObject<HTMLVideoElement | null>
  localVideoRef: RefObject<HTMLVideoElement | null>
  onToggleMic: () => void
  onToggleCamera: () => void
  onHangUp: () => void
  timer: ReturnType<typeof computeTimerState> | null
  canSkip: boolean
  onSkipPhase: () => void
  partnerUsername: string | null
  phrases: string[]
  phrasesLang: Language
  messages: MessageRow[]
  profileId: string
  onSend: (body: string) => Promise<{ error: string | null }>
}) {
  const t = useDict()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [showPhrases, setShowPhrases] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function submit() {
    if (!validateMessage(draft).ok || sending) return
    setSending(true)
    const { error: err } = await onSend(draft)
    setSending(false)
    if (!err) setDraft('')
  }

  const mins = timer ? Math.floor(timer.secondsLeftInPhase / 60) : 0
  const secs = timer ? timer.secondsLeftInPhase % 60 : 0
  const speaking = timer?.phase === 'ES' ? t.room.speakES : t.room.speakEN

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col text-white">
      {/* Partner fills the screen (carries the remote audio too). */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Connecting / failed overlay */}
      {status !== 'connected' && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-stone-950/85 text-center px-6">
          <div>
            <p className="text-5xl mb-4 animate-pulse">📡</p>
            <p className="text-sm font-black">
              {status === 'failed'
                ? (error ?? t.room.stageFailed)
                : t.room.stageConnecting}
            </p>
            {status === 'failed' && (
              <div className="mt-6">
                <RoundBtn onClick={onHangUp} danger label={t.room.close}>
                  ✕
                </RoundBtn>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Your own camera, picture-in-picture. */}
      <div className="absolute right-3 top-16 z-20 w-24 sm:w-32 aspect-video rounded-xl overflow-hidden border-2 border-white/40 bg-stone-800 shadow-lg">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        {cameraOff && (
          <div className="absolute inset-0 grid place-items-center bg-stone-800 text-[10px] font-black text-white/80">
            {t.room.cameraOffLabel}
          </div>
        )}
      </div>

      {/* Top bar: partner + timer */}
      <div
        className="relative z-20 flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-black/70 to-transparent"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <span
          className={cn(
            'h-2.5 w-2.5 rounded-full shrink-0',
            partnerUsername ? 'bg-emerald-400' : 'bg-stone-400'
          )}
        />
        <span className="text-sm font-black truncate">
          {partnerUsername ? `@${partnerUsername}` : t.room.connecting}
        </span>
        {timer && timer.phase !== 'ended' && (
          <span className="ml-auto flex items-center gap-2 bg-emerald-500/90 rounded-full px-3 py-1">
            <span className="text-[11px] font-black uppercase tracking-wide">
              {speaking}
            </span>
            <span className="text-sm font-black tabular-nums">
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </span>
        )}
      </div>

      {/* Corner: help phrases (toggleable). */}
      <div className="relative z-10 flex-1 min-h-0 px-3">
        {phrases.length > 0 &&
          (showPhrases ? (
            <aside className="w-64 max-w-[75%] max-h-[45%] overflow-y-auto bg-black/55 backdrop-blur-sm rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2 gap-2">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-white/70">
                  💡 {t.room.helpPhrases} · {phrasesLang}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPhrases(false)}
                  aria-label={t.room.close}
                  className="text-white/60 hover:text-white text-xs font-black shrink-0"
                >
                  ✕
                </button>
              </div>
              <ul className="space-y-2">
                {phrases.map((p, i) => (
                  <li key={i} className="text-sm font-semibold leading-snug">
                    {p}
                  </li>
                ))}
              </ul>
            </aside>
          ) : (
            <button
              type="button"
              onClick={() => setShowPhrases(true)}
              className="bg-black/55 backdrop-blur-sm rounded-full px-3 py-2 text-xs font-black"
            >
              💡 {t.room.helpPhrases}
            </button>
          ))}
      </div>

      {/* Bottom: controls + chat overlay */}
      <div
        className="relative z-20 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pt-8 pb-3 space-y-2.5"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-center gap-3">
          <RoundBtn onClick={onToggleMic} active={!micMuted} label={micMuted ? t.room.micOff : t.room.micOn}>
            {micMuted ? '🔇' : '🎙️'}
          </RoundBtn>
          {hasVideo && (
            <RoundBtn
              onClick={onToggleCamera}
              active={!cameraOff}
              label={cameraOff ? t.room.cameraOffBtn : t.room.cameraOn}
            >
              {cameraOff ? '📷' : '📹'}
            </RoundBtn>
          )}
          {canSkip && (
            <RoundBtn onClick={onSkipPhase} label={t.room.skip}>
              ⏭️
            </RoundBtn>
          )}
          <RoundBtn onClick={onHangUp} danger label={t.room.hangUp}>
            📞
          </RoundBtn>
        </div>

        <div ref={listRef} className="max-h-36 overflow-y-auto space-y-1.5">
          {messages.map((m) => {
            const mine = m.profile_id === profileId
            return (
              <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-1.5 text-sm font-semibold',
                    mine
                      ? 'bg-emerald-500 text-white rounded-br-md'
                      : 'bg-white/85 text-stone-900 rounded-bl-md'
                  )}
                >
                  {m.body}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-end gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder={t.room.messagePlaceholder}
            maxLength={MAX_MESSAGE_LENGTH}
            className="flex-1 rounded-2xl bg-white/90 text-stone-900 placeholder:text-stone-400 px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending || draft.trim().length === 0}
            className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm font-black uppercase tracking-wide disabled:opacity-50 transition-colors"
          >
            {t.room.send}
          </button>
        </div>
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
  const t = useDict()
  if (ended || !timer || timer.phase === 'ended') {
    return (
      <div className="bg-stone-100 px-5 py-3 text-center text-sm font-black text-stone-500">
        {t.room.sessionFinished}
      </div>
    )
  }
  const mins = Math.floor(timer.secondsLeftInPhase / 60)
  const secs = timer.secondsLeftInPhase % 60
  const speaking = timer.phase === 'EN' ? t.room.speakEN : t.room.speakES
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
  const t = useDict()
  if (vocabulary.length === 0) return null
  const label = language === 'EN' ? t.room.vocabLabelEN : t.room.vocabLabelES
  return (
    <aside className="bg-white border-2 border-stone-100 rounded-3xl p-5 h-fit lg:max-h-[34rem] lg:overflow-y-auto">
      <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
        📖 {t.room.vocab} — {label}
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
