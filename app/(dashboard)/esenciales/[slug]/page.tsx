import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile, getUser } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { essentialBySlug } from '@/lib/essentials'
import { EssentialPractice } from '@/components/essentials/essential-practice'
import type { EssentialKind } from '@/content/essentials/types'
import type { Language, Level } from '@/lib/topics'

const KIND_EMOJI: Record<EssentialKind, string> = {
  'irregular-verbs': '🔁',
  'phrasal-verbs': '🧩',
  interview: '💼',
  tenses: '⏳',
}

export default async function EssentialContentPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()
  if (!profile) redirect('/onboarding')

  const targetLanguage = profile.target_language as Language
  const userLevel = profile.level as Level
  const t = getDict(profile.native_language as Language)

  const set = essentialBySlug(slug)
  // Only serve a set that matches what the user is learning, and — for
  // level-restricted sets — their level (so /esenciales/interview-* 404s for
  // a beginner even via a direct link).
  if (!set || set.language !== targetLanguage) notFound()
  if (set.level && set.level !== userLevel) notFound()

  const kind = t.essentials.kinds[set.kind]

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="bg-white border-b-2 border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <section className="max-w-2xl mx-auto px-6 pt-10 pb-24">
        <Link
          href="/esenciales"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← {t.essentials.title}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-2">
          {KIND_EMOJI[set.kind]} {set.title ?? kind.name}
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed mb-8">
          {set.subtitle ?? kind.desc}
        </p>

        {set.comingSoon ? (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8 text-center">
            <p className="text-5xl mb-3">⏳</p>
            <p className="text-lg font-black text-amber-900">
              {t.essentials.comingSoon}
            </p>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-bold text-stone-400 mb-4">
              💡 {t.essentials.practiceHint}
            </p>
            <EssentialPractice
              items={set.items}
              formLabels={t.essentials.formLabels[targetLanguage]}
              language={targetLanguage}
            />
          </>
        )}
      </section>
    </main>
  )
}
