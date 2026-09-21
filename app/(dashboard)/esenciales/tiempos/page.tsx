import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile, getUser } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { tensesForLanguage } from '@/lib/essentials'
import type { Language, Level } from '@/lib/topics'

export default async function TiemposPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()
  if (!profile) redirect('/onboarding')

  const targetLanguage = profile.target_language as Language
  const userLevel = profile.level as Level
  const t = getDict(profile.native_language as Language)
  // Grammar tenses are shown only for the learner's own level (unlike verbs,
  // which show every level at once).
  const tenses = tensesForLanguage(targetLanguage).filter(
    (tense) => tense.level === userLevel
  )

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

      <section className="max-w-3xl mx-auto px-6 pt-10 pb-24">
        <Link
          href="/esenciales"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← {t.essentials.title}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-2">
          ⏳ {t.essentials.kinds.tenses.name}
        </h1>
        <p className="text-xs font-black uppercase tracking-wider text-emerald-600 mb-10">
          {t.common.levels[userLevel]}
        </p>

        {tenses.length === 0 ? (
          <p className="text-sm font-bold text-stone-400">{t.essentials.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tenses.map((tense) => (
              <Link
                key={tense.slug}
                href={`/esenciales/tiempos/${tense.slug}`}
                className="bg-white border-2 border-b-4 border-stone-200 rounded-3xl p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5 active:border-b-2"
              >
                <p className="text-lg font-black text-stone-900">{tense.name}</p>
                <p className="text-sm font-semibold text-stone-500 mt-1">
                  {tense.when}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
