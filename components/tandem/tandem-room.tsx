'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
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
  joinByCode,
  loadMessages,
  sendMessage,
  type MessageRow,
  type SessionRow,
} from '@/lib/tandem-session'
import type { Language, TopicVocab } from '@/lib/topics'

type Props = {
  profileId: string
  topicSlug: string
  topicTitle: string
  language: Language
  vocabulary: TopicVocab[]
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
  topicSlug,
  topicTitle,
  language,
  vocabulary,
}: Props) {
  const supabase = useMemo(() => createClient(), [])

  const [session, setSession] = useState<SessionRow | null>(null)
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [codeInput, setCodeInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [lobbyError, setLobbyError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

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

      channel = supabase
        .channel(`tandem:${sessionId}`)
        .on(
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
        .subscribe((status, err) => {
          console.log('[tandem] realtime status:', status, err ?? '')
          // Once the channel is truly live, re-load the history and merge it.
          // This backfills anything inserted during the subscribe handshake —
          // the window where the first message used to be lost for the peer.
          if (status === 'SUBSCRIBED') {
            loadMessages(supabase, sessionId).then((rows) => {
              if (cancelled) return
              setMessages((prev) => mergeMessages(prev, rows))
            })
          }
        })
    })()

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [supabase, session?.id])

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
  const handleCreate = useCallback(async () => {
    setBusy(true)
    setLobbyError(null)
    const result = await createSession(supabase, profileId, topicSlug, language)
    setBusy(false)
    if ('error' in result) {
      setLobbyError('No pudimos crear la sala. Inténtalo de nuevo.')
      return
    }
    setSession(result.session)
  }, [supabase, profileId, topicSlug, language])

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

  // --- Views -------------------------------------------------------------
  if (!session) {
    return (
      <Lobby
        codeInput={codeInput}
        setCodeInput={setCodeInput}
        busy={busy}
        error={lobbyError}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />
    )
  }

  if (session.status === 'WAITING') {
    return <WaitingRoom inviteCode={session.invite_code} topicTitle={topicTitle} />
  }

  return (
    <ChatView
      profileId={profileId}
      session={session}
      messages={messages}
      timer={timer}
      vocabulary={vocabulary}
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
        setCodeInput('')
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
  onCreate: () => void
  onJoin: () => void
}

function Lobby({ codeInput, setCodeInput, busy, error, onCreate, onJoin }: LobbyProps) {
  return (
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
  )
}

function WaitingRoom({ inviteCode, topicTitle }: { inviteCode: string; topicTitle: string }) {
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
  profileId: string
  session: SessionRow
  messages: MessageRow[]
  timer: ReturnType<typeof computeTimerState> | null
  vocabulary: TopicVocab[]
  onSend: (body: string) => Promise<{ error: string | null }>
  onRestart: () => void
}

function ChatView({
  profileId,
  session,
  messages,
  timer,
  vocabulary,
  onSend,
  onRestart,
}: ChatViewProps) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const ended = session.status === 'ENDED' || timer?.phase === 'ended'

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
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="bg-white border-2 border-stone-100 rounded-3xl overflow-hidden flex flex-col h-[34rem]">
        <TimerBanner timer={timer} ended={ended} />

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

      <VocabPanel vocabulary={vocabulary} />
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

function VocabPanel({ vocabulary }: { vocabulary: TopicVocab[] }) {
  if (vocabulary.length === 0) return null
  return (
    <aside className="bg-white border-2 border-stone-100 rounded-3xl p-5 h-fit lg:max-h-[34rem] lg:overflow-y-auto">
      <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
        📖 Vocabulario útil
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
