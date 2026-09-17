import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { essentialBySlug } from '@/lib/essentials'
import { EssentialPractice } from '@/components/essentials/essential-practice'
import type { EssentialKind } from '@/content/essentials/types'
import type { Language } from '@/lib/topics'

const KIND_EMOJI: Record<EssentialKind, string> = {
  'irregular-verbs': '🔁',
  'phrasal-verbs': '🧩',
  tenses: '⏳',
}

export default async function EssentialContentPage({
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
    .select('username, target_language, native_language')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile) redirect('/onboarding')

  const targetLanguage = profile.target_language as Language
  const t = getDict(profile.native_language as Language)

  const set = essentialBySlug(slug)
  // Only serve a set that matches what the user is learning.
  if (!set || set.language !== targetLanguage) notFound()

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
          {KIND_EMOJI[set.kind]} {kind.name}
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed mb-8">
          {kind.desc}
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
