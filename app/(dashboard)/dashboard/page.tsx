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
import { loadStreak } from '@/lib/streak'
import { LearningPath } from '@/components/dashboard/learning-path'
import { getDict } from '@/lib/i18n/dictionaries'

const LANGUAGE_FLAG: Record<Language, string> = {
  EN: '🇬🇧',
  ES: '🇪🇸',
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
  const t = getDict(profile.native_language as Language)

  const [topics, progressBySlug, streak] = await Promise.all([
    getTopicsWithContentForUser(supabase, { targetLanguage }),
    loadAllProgress(supabase, profile.id as string),
    loadStreak(supabase, profile.id as string),
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
            <Link
              href="/profile"
              className="text-sm font-bold text-stone-600 hover:text-emerald-600 transition-colors"
            >
              @{profile.username}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-8">
        <h1 className="text-5xl md:text-6xl font-black text-stone-900 leading-tight">
          {t.dashboard.greeting(profile.username)}{' '}
          <span className="inline-block">👋</span>
        </h1>
        <p className="text-stone-500 mt-4 text-lg font-semibold max-w-xl">
          {t.dashboard.tagline}
        </p>
        <Link
          href="/agenda"
          className="inline-flex items-center gap-2 mt-6 bg-emerald-500 text-white font-black text-sm px-5 py-3 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-transform"
        >
          {t.dashboard.agenda}
        </Link>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-white rounded-3xl border-2 border-stone-100 p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              {t.common.language}
            </p>
            <p className="text-2xl font-black text-stone-900 capitalize">
              {LANGUAGE_FLAG[targetLanguage]} {t.common.languages[targetLanguage]}
            </p>
          </div>
          <div className="sm:border-l-2 sm:border-stone-100 sm:pl-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              {t.common.level}
            </p>
            <p className="text-2xl font-black text-emerald-600">
              {t.common.levels[userLevel]}
            </p>
          </div>
          <div className="sm:border-l-2 sm:border-stone-100 sm:pl-6">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
              {t.common.streak}
            </p>
            <p className="text-2xl font-black text-orange-500">
              {t.common.streakDays(streak)}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-black text-stone-900 mb-6">
          {t.dashboard.path}
        </h2>
        <LearningPath
          topics={topics}
          userLevel={userLevel}
          progressBySlug={progressBySlug}
        />
      </section>
    </main>
  )
}
