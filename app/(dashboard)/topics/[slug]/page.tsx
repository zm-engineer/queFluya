import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { PracticeCard } from '@/components/practice/practice-card'
import { getTopicBySlug, type Level } from '@/lib/topics'

const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

const LEVEL_EMOJI: Record<Level, string> = {
  BEGINNER: '🌱',
  INTERMEDIATE: '🌿',
  ADVANCED: '🌳',
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/onboarding')
  }

  const topic = await getTopicBySlug(supabase, slug)

  if (!topic) {
    notFound()
  }

  const sections = topic.content.sections ?? []

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
            <span className="text-sm font-bold text-stone-600">
              @{profile.username}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-10">
        <Link
          href="/dashboard"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← Volver a temas
        </Link>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
          <span>{LEVEL_EMOJI[topic.level]}</span>
          <span>{LEVEL_LABEL[topic.level]}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 leading-tight mb-4">
          {topic.title}
        </h1>
        <p className="text-stone-600 text-lg font-semibold leading-relaxed max-w-2xl">
          {topic.description}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 space-y-10">
        {sections.map((section, idx) => (
          <article
            key={idx}
            className="bg-white border-2 border-stone-100 rounded-3xl p-6 sm:p-8"
          >
            <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-2">
              Sección {idx + 1} de {sections.length}
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-3">
              {section.title}
            </h2>
            <p className="text-stone-600 font-semibold leading-relaxed mb-8">
              {section.intro}
            </p>

            {section.vocabulary.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
                  📖 Vocabulario
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {section.vocabulary.map((v) => (
                    <div
                      key={v.term}
                      className="flex items-baseline justify-between bg-stone-50 rounded-2xl px-4 py-3"
                    >
                      <dt className="text-base font-black text-stone-900">
                        {v.term}
                      </dt>
                      <dd className="text-sm font-semibold text-stone-500 ml-4 text-right">
                        {v.translation}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {section.dialogue.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
                  💬 Diálogo
                </h3>
                <div className="bg-stone-50 rounded-2xl px-5 py-4 space-y-3">
                  {section.dialogue.map((line, lineIdx) => (
                    <div key={lineIdx} className="flex gap-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 pt-1.5 min-w-[5rem]">
                        {line.speaker}
                      </span>
                      <p className="text-stone-800 font-semibold leading-relaxed flex-1">
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.practicePhrases.length > 0 && (
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-stone-400 mb-4">
                  🎤 Frases para practicar
                </h3>
                <div className="space-y-4">
                  {section.practicePhrases.map((phrase, phraseIdx) => (
                    <PracticeCard
                      key={`${idx}-${phraseIdx}`}
                      phrase={phrase}
                      language={topic.language}
                      topicSlug={topic.slug}
                      profileId={profile.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  )
}
