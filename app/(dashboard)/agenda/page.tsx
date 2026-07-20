import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { ReservationsPanel } from '@/components/tandem/reservations-panel'
import type { Language } from '@/lib/topics'

type TopicRow = { slug: string; title: string; language: Language; pairKey: string | null }

export default async function AgendaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, target_language')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) redirect('/onboarding')

  const targetLanguage = profile.target_language as Language

  const { data: topicRows } = await supabase
    .from('topics')
    .select('slug, title, language, pairKey:pair_key')
    .order('position', { ascending: true })
  const topics = (topicRows ?? []) as unknown as TopicRow[]

  // Topics the user can publish (their target language) + a slug→title map that
  // also covers others' slots (which can be in the opposite language).
  const publishTopics = topics.filter((t) => t.language === targetLanguage)
  const titleBySlug: Record<string, { title: string; language: Language }> = {}
  for (const t of topics) titleBySlug[t.slug] = { title: t.title, language: t.language }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b-2 border-stone-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-black tracking-tight text-stone-900"
          >
            que<span className="text-emerald-500">Fluya</span>
          </Link>
          <div className="flex items-center gap-5">
            <span className="text-sm font-bold text-stone-600">@{profile.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        <Link
          href="/dashboard"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← Volver al inicio
        </Link>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
          <span>📅</span>
          <span>Agenda de tándems</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-3">
          Reserva una conversación
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed mb-10">
          Publica un hueco para practicar más tarde, o reserva el de otra persona.
          A la hora acordada entráis juntos a la sala de tándem.
        </p>

        <ReservationsPanel
          profileId={profile.id}
          username={profile.username}
          topics={publishTopics}
          titleBySlug={titleBySlug}
        />
      </section>
    </main>
  )
}
