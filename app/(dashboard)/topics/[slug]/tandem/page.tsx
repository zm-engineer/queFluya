import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { TandemRoom } from '@/components/tandem/tandem-room'
import {
  getTopicBySlug,
  getTopicsByPairKey,
  type Language,
  type TopicVocab,
} from '@/lib/topics'

export default async function TandemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/onboarding')

  const topic = await getTopicBySlug(supabase, slug)
  if (!topic) notFound()

  // A tandem is an exchange, so we want BOTH languages' vocabulary: the panel
  // shows English during the EN phase and Spanish during the ES phase. Resolve
  // the mirror topic via pair_key; fall back to just this topic if unpaired.
  const pairTopics = topic.pairKey
    ? await getTopicsByPairKey(supabase, topic.pairKey)
    : [topic]
  const vocabByLanguage: Record<Language, TopicVocab[]> = { EN: [], ES: [] }
  for (const t of pairTopics.length > 0 ? pairTopics : [topic]) {
    vocabByLanguage[t.language] = (t.content.sections ?? []).flatMap(
      (s) => s.vocabulary
    )
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b-2 border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <section className="max-w-5xl mx-auto px-6 pt-10 pb-24">
        <Link
          href={`/topics/${slug}`}
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← Volver al tema
        </Link>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
          <span>👥</span>
          <span>Conectar en vivo</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-3">
          {topic.title}
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed max-w-2xl mb-10">
          Practica este tema por chat con otra persona. 5 minutos en inglés, 5 en
          español — y el vocabulario del tema siempre a mano.
        </p>

        <TandemRoom
          profileId={profile.id}
          username={profile.username}
          topicSlug={topic.slug}
          topicTitle={topic.title}
          language={topic.language}
          pairKey={topic.pairKey}
          vocabByLanguage={vocabByLanguage}
        />
      </section>
    </main>
  )
}
