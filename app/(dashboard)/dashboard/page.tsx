import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { getTopicsForUser, type Language, type Level } from '@/lib/topics'

const LANGUAGE_LABEL: Record<Language, string> = {
  EN: 'inglés',
  ES: 'español',
}

const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, native_language, target_language, level')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/onboarding')
  }

  const targetLanguage = profile.target_language as Language
  const userLevel = profile.level as Level

  const targetLabel = LANGUAGE_LABEL[targetLanguage] ?? targetLanguage
  const levelLabel = LEVEL_LABEL[userLevel] ?? userLevel

  const topics = await getTopicsForUser(supabase, { targetLanguage })

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
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

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-serif text-5xl text-stone-900 leading-tight max-w-2xl">
          ¡Hola, {profile.username}! Sigamos practicando.
        </h1>
        <p className="text-stone-500 mt-4 max-w-xl">
          Menos teoría, más práctica. Tu próxima conversación te está esperando.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="border border-stone-200 bg-white p-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Estás aprendiendo
            </p>
            <p className="font-serif text-3xl text-stone-900 capitalize">
              {targetLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Nivel
            </p>
            <p className="font-serif text-3xl text-emerald-800">
              {levelLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl text-stone-900">Temas</h2>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            {topics.length === 0
              ? 'Próximamente'
              : `${topics.length} disponibles`}
          </span>
        </div>

        {topics.length === 0 ? (
          <div className="border border-stone-200 bg-white p-12 text-center">
            <p className="text-stone-500">
              Aún no tenemos temas para tu idioma objetivo. Vuelve pronto.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const matchesLevel = topic.level === userLevel
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className={`group block border bg-white p-6 transition-colors ${
                    matchesLevel
                      ? 'border-emerald-200 hover:border-emerald-700'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <p
                      className={`text-xs uppercase tracking-widest ${
                        matchesLevel ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {LEVEL_LABEL[topic.level]}
                    </p>
                    {matchesLevel && (
                      <span className="text-[10px] uppercase tracking-widest text-emerald-700">
                        Tu nivel
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-xl text-stone-900 group-hover:text-emerald-800 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-3 leading-relaxed">
                    {topic.description}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
