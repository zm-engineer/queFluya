import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import {
  getTopicsWithContentForUser,
  type Language,
  type Level,
} from '@/lib/topics'
import { loadAllProgress } from '@/lib/topic-progress'
import { LearningPath } from '@/components/dashboard/learning-path'

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
    .select('id, username, native_language, target_language, level')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/onboarding')
  }

  const targetLanguage = profile.target_language as Language
  const userLevel = profile.level as Level

  const [topics, progressBySlug] = await Promise.all([
    getTopicsWithContentForUser(supabase, { targetLanguage }),
    loadAllProgress(supabase, profile.id as string),
  ])

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
          ¡Hola, {profile.username}! <span className="inline-block">👋</span>
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
        <h2 className="text-3xl font-black text-stone-900 mb-6">Tu camino</h2>
        <LearningPath
          topics={topics}
          userLevel={userLevel}
          progressBySlug={progressBySlug}
        />
      </section>
    </main>
  )
}
