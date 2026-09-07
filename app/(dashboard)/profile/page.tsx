import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { ProfileForm } from '@/components/profile/profile-form'
import { getDict } from '@/lib/i18n/dictionaries'
import { loadStreak } from '@/lib/streak'
import { loadAllProgress } from '@/lib/topic-progress'
import { loadPracticeCount } from '@/lib/profile'
import {
  BADGES,
  computeXp,
  earnedBadges,
  levelForXp,
} from '@/lib/gamification'
import { ProgressBar } from '@/components/gamification/progress-bar'
import { BadgeGrid } from '@/components/gamification/badge-grid'
import type { Language, Level } from '@/lib/topics'

const LANGUAGE_FLAG: Record<Language, string> = {
  EN: '🇬🇧',
  ES: '🇪🇸',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, native_language, target_language, level')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) redirect('/onboarding')

  const nativeLanguage = profile.native_language as Language
  const targetLanguage = profile.target_language as Language
  const level = profile.level as Level
  const t = getDict(nativeLanguage)

  const [streak, progressBySlug, practices] = await Promise.all([
    loadStreak(supabase, profile.id as string),
    loadAllProgress(supabase, profile.id as string),
    loadPracticeCount(supabase, profile.id as string),
  ])
  const topicsStarted = Object.keys(progressBySlug).length
  const sectionsCompleted = Object.values(progressBySlug).reduce(
    (sum, sections) => sum + sections.length,
    0
  )

  const stats: { label: string; value: string }[] = [
    { label: t.common.streak, value: t.common.streakDays(streak) },
    { label: t.profile.topicsStarted, value: String(topicsStarted) },
    { label: t.profile.sectionsCompleted, value: String(sectionsCompleted) },
    { label: t.profile.practices, value: String(practices) },
  ]

  const counters = { sectionsCompleted, practices, topicsStarted }
  const xp = computeXp(counters)
  const levelInfo = levelForXp(xp)
  const earned = new Set(earnedBadges({ ...counters, xp }))
  const badgeViews = BADGES.map((b) => ({
    emoji: b.emoji,
    name: t.gamification.badges[b.id].name,
    desc: t.gamification.badges[b.id].desc,
    earned: earned.has(b.id),
  }))

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
          <LogoutButton />
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        <Link
          href="/dashboard"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          {t.back.home}
        </Link>

        {/* Identity */}
        <div className="flex items-center gap-5 mb-10">
          <div className="h-20 w-20 shrink-0 rounded-3xl bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-4xl font-black text-emerald-700">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-stone-900 leading-tight">
              @{profile.username}
            </h1>
            <p className="text-stone-500 font-bold mt-1">
              {LANGUAGE_FLAG[nativeLanguage]} {t.common.languages[nativeLanguage]}
              {' → '}
              {LANGUAGE_FLAG[targetLanguage]} {t.common.languages[targetLanguage]}
              {'  ·  '}
              {t.common.levels[level]}
            </p>
          </div>
        </div>

        {/* Level + XP */}
        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6 mb-6">
          <ProgressBar
            label={t.gamification.progress}
            valueText={t.gamification.xpTotal(xp)}
            fraction={levelInfo.xpIntoLevel / levelInfo.xpForNextLevel}
          />
        </div>

        {/* Stats */}
        <h2 className="text-lg font-black text-stone-900 mb-3">
          {t.profile.statsTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border-2 border-stone-100 rounded-3xl p-5 text-center"
            >
              <p className="text-2xl font-black text-stone-900">{s.value}</p>
              <p className="text-[11px] font-black uppercase tracking-wider text-stone-400 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="mb-10">
          <BadgeGrid
            title={t.gamification.badgesTitle}
            earnedText={t.gamification.earnedCount(earned.size, BADGES.length)}
            badges={badgeViews}
          />
        </div>

        {/* Edit */}
        <ProfileForm
          profileId={profile.id as string}
          username={profile.username as string}
          nativeLanguage={nativeLanguage}
          level={level}
        />
      </section>
    </main>
  )
}
