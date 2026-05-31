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
      <header className="border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-serif text-2xl tracking-tight text-stone-900"
          >
            que<span className="text-emerald-700">Fluya</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-stone-600">@{profile.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        <Link
          href="/dashboard"
          className="text-xs uppercase tracking-widest text-stone-500 hover:text-emerald-700 transition-colors inline-block mb-8"
        >
          ← Volver a temas
        </Link>
        <p className="text-xs uppercase tracking-widest text-emerald-700 mb-3">
          {LEVEL_LABEL[topic.level]}
        </p>
        <h1 className="font-serif text-5xl text-stone-900 leading-tight mb-4">
          {topic.title}
        </h1>
        <p className="text-stone-600 text-lg leading-relaxed max-w-2xl">
          {topic.description}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 space-y-16">
        {sections.map((section, idx) => (
          <article key={idx} className="border-t border-stone-200 pt-12">
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-3">
              Sección {idx + 1} de {sections.length}
            </p>
            <h2 className="font-serif text-3xl text-stone-900 mb-4">
              {section.title}
            </h2>
            <p className="text-stone-600 leading-relaxed mb-10 max-w-2xl">
              {section.intro}
            </p>

            {section.vocabulary.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4">
                  Vocabulario
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {section.vocabulary.map((v) => (
                    <div
                      key={v.term}
                      className="flex items-baseline justify-between border-b border-stone-100 pb-2"
                    >
                      <dt className="font-serif text-lg text-stone-900">
                        {v.term}
                      </dt>
                      <dd className="text-sm text-stone-500 ml-4 text-right">
                        {v.translation}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {section.dialogue.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4">
                  Diálogo
                </h3>
                <div className="bg-white border border-stone-200 px-6 py-5 space-y-3">
                  {section.dialogue.map((line, lineIdx) => (
                    <div key={lineIdx} className="flex gap-4">
                      <span className="font-mono text-xs uppercase tracking-widest text-stone-400 pt-1 min-w-[5rem]">
                        {line.speaker}
                      </span>
                      <p className="text-stone-800 leading-relaxed flex-1">
                        {line.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section.practicePhrases.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-4">
                  Frases para practicar
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
