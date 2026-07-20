import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { cn } from '@/lib/utils'
import { getTopicsForUser, type Language, type Level } from '@/lib/topics'

const LANGUAGE_LABEL: Record<Language, string> = {
  EN: 'inglés',
  ES: 'español',
}

const LANGUAGE_FLAG: Record<Language, string> = {
  EN: '🇬🇧',
  ES: '🇪🇸',
}

const LEVEL_LABEL: Record<Level, string> = {
  BEGINNER: 'Principiante',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

const TOPIC_EMOJI_POOL = [
  '👋',
  '🌅',
  '🍕',
  '🗺️',
  '🎯',
  '☕',
  '🎒',
  '🌳',
  '🎵',
  '⚽',
  '🎨',
  '📚',
  '🚀',
  '🍳',
  '🛒',
  '🎬',
]

function emojiForSlug(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) | 0
  }
  return TOPIC_EMOJI_POOL[Math.abs(hash) % TOPIC_EMOJI_POOL.length]
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

  const topics = await getTopicsForUser(supabase, { targetLanguage })

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
            <span className="text-sm font-bold text-stone-600">
              @{profile.username}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <h1 className="text-5xl md:text-6xl font-black text-stone-900 leading-tight">
          ¡Hola, {profile.username}!{' '}
          <span className="inline-block">👋</span>
        </h1>
        <p className="text-stone-500 mt-4 text-lg font-semibold max-w-xl">
          Menos teoría, más práctica. ¡Que fluya!
        </p>
        <Link
          href="/agenda"
          className="inline-flex items-center gap-2 mt-6 bg-emerald-500 text-white font-black text-sm px-5 py-3 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-transform"
        >
          📅 Agenda de tándems
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-3xl border-2 border-stone-100 p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              Idioma
            </p>
            <p className="text-2xl font-black text-stone-900 capitalize">
              {LANGUAGE_FLAG[targetLanguage]} {LANGUAGE_LABEL[targetLanguage]}
            </p>
          </div>
          <div className="sm:border-l-2 sm:border-stone-100 sm:pl-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              Nivel
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {LEVEL_LABEL[userLevel]}
            </p>
          </div>
          <div className="sm:border-l-2 sm:border-stone-100 sm:pl-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              Racha
            </p>
            <p className="text-2xl font-black text-orange-500">🔥 0 días</p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-3xl font-black text-stone-900">Temas</h2>
          {topics.length > 0 && (
            <span className="text-sm font-bold text-stone-400">
              {topics.length} disponibles
            </span>
          )}
        </div>

        {topics.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-stone-100 p-12 text-center">
            <p className="text-6xl mb-4">📚</p>
            <p className="text-stone-500 font-semibold">
              Aún no tenemos temas para tu idioma objetivo. Vuelve pronto.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const matchesLevel = topic.level === userLevel
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className={cn(
                    'group block bg-white rounded-3xl border-2 p-6 transition-all duration-150',
                    'hover:-translate-y-1 hover:shadow-lg',
                    matchesLevel
                      ? 'border-emerald-200 hover:border-emerald-400'
                      : 'border-stone-100 hover:border-stone-300'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl leading-none">
                      {emojiForSlug(topic.slug)}
                    </span>
                    {matchesLevel && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Tu nivel
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-[11px] font-black uppercase tracking-wider mb-1.5',
                      matchesLevel ? 'text-emerald-600' : 'text-stone-400'
                    )}
                  >
                    {LEVEL_LABEL[topic.level]}
                  </p>
                  <h3 className="text-xl font-black text-stone-900 group-hover:text-emerald-700 transition-colors mb-2 leading-snug">
                    {topic.title}
                  </h3>
                  <p className="text-sm text-stone-500 font-medium leading-relaxed">
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
