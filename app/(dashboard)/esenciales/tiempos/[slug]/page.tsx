import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile, getUser } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { tenseBySlug } from '@/lib/essentials'
import { ExampleCard } from '@/components/essentials/example-card'
import type { Language, Level } from '@/lib/topics'

export default async function TenseDetailPage({
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
  const t = getDict(profile.native_language as Language)

  const tense = tenseBySlug(slug)
  if (!tense || tense.language !== targetLanguage) notFound()

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
          href="/esenciales/tiempos"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          ← {t.essentials.kinds.tenses.name}
        </Link>

        <div className="flex items-center gap-3 flex-wrap mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight">
            {tense.name}
          </h1>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            {t.common.levels[tense.level as Level]}
          </span>
        </div>

        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6 mb-4">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
            {t.essentials.tensesWhen}
          </h2>
          <p className="text-base font-semibold text-stone-800">{tense.when}</p>
        </div>

        <div className="bg-white border-2 border-stone-100 rounded-3xl p-6 mb-10">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-stone-400 mb-1">
            {t.essentials.tensesStructure}
          </h2>
          <p className="text-base font-black text-emerald-700">
            {tense.structure}
          </p>
        </div>

        <h2 className="text-lg font-black text-stone-900 mb-3">
          {t.essentials.examplesTitle}
        </h2>
        <ExampleCard examples={tense.examples} language={targetLanguage} />
      </section>
    </main>
  )
}
