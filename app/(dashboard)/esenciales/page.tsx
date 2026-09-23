import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile, getUser } from '@/lib/auth'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { essentialsForLanguage, tensesForLanguage } from '@/lib/essentials'
import type { EssentialKind } from '@/content/essentials/types'
import type { Language } from '@/lib/topics'

const KIND_EMOJI: Record<EssentialKind, string> = {
  'irregular-verbs': '🔁',
  'phrasal-verbs': '🧩',
  interview: '💼',
  tenses: '⏳',
}

export default async function EsencialesPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  const profile = await getProfile()
  if (!profile) redirect('/onboarding')

  const targetLanguage = profile.target_language as Language
  const t = getDict(profile.native_language as Language)
  const sets = essentialsForLanguage(targetLanguage)
  const tenses = tensesForLanguage(targetLanguage)

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
          href="/dashboard"
          className="text-sm font-black text-stone-500 hover:text-emerald-600 transition-colors inline-block mb-6"
        >
          {t.back.home}
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 leading-tight mb-3">
          🧱 {t.essentials.title}
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed mb-10">
          {t.essentials.intro}
        </p>

        {sets.length === 0 ? (
          <p className="text-sm font-bold text-stone-400">{t.essentials.empty}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sets.map((set) => {
              const kind = t.essentials.kinds[set.kind]
              const emoji = KIND_EMOJI[set.kind]
              // A set may override the generic kind label with its own name.
              const name = set.title ?? kind.name
              const desc = set.subtitle ?? kind.desc

              if (set.comingSoon) {
                return (
                  <div
                    key={set.slug}
                    className="bg-stone-50 border-2 border-stone-100 rounded-3xl p-6 opacity-70"
                  >
                    <div className="text-3xl mb-2 grayscale">{emoji}</div>
                    <p className="text-lg font-black text-stone-400">
                      {name}
                    </p>
                    <p className="text-sm font-semibold text-stone-400 mt-1">
                      {desc}
                    </p>
                    <span className="inline-block mt-3 text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                      {t.essentials.comingSoon}
                    </span>
                  </div>
                )
              }

              return (
                <Link
                  key={set.slug}
                  href={`/esenciales/${set.slug}`}
                  className="bg-white border-2 border-b-4 border-stone-200 rounded-3xl p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5 active:border-b-2"
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <p className="text-lg font-black text-stone-900">{name}</p>
                  <p className="text-sm font-semibold text-stone-500 mt-1">
                    {desc}
                  </p>
                  <span className="inline-block mt-3 text-[11px] font-black uppercase tracking-wider text-emerald-600">
                    {t.essentials.itemsCount(set.items.length)}
                  </span>
                </Link>
              )
            })}

            {tenses.length > 0 && (
              <Link
                href="/esenciales/tiempos"
                className="bg-white border-2 border-b-4 border-stone-200 rounded-3xl p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5 active:border-b-2"
              >
                <div className="text-3xl mb-2">{KIND_EMOJI.tenses}</div>
                <p className="text-lg font-black text-stone-900">
                  {t.essentials.kinds.tenses.name}
                </p>
                <p className="text-sm font-semibold text-stone-500 mt-1">
                  {t.essentials.kinds.tenses.desc}
                </p>
                <span className="inline-block mt-3 text-[11px] font-black uppercase tracking-wider text-emerald-600">
                  {t.essentials.itemsCount(tenses.length)}
                </span>
              </Link>
            )}

            <Link
              href="/esenciales/diccionario"
              className="bg-white border-2 border-b-4 border-stone-200 rounded-3xl p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5 active:border-b-2"
            >
              <div className="text-3xl mb-2">🔎</div>
              <p className="text-lg font-black text-stone-900">
                {t.essentials.dictionary.title}
              </p>
              <p className="text-sm font-semibold text-stone-500 mt-1">
                {t.essentials.dictionary.desc}
              </p>
            </Link>

            <Link
              href="/esenciales/escucha"
              className="bg-white border-2 border-b-4 border-stone-200 rounded-3xl p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:border-emerald-300 active:translate-y-0.5 active:border-b-2"
            >
              <div className="text-3xl mb-2">🎧</div>
              <p className="text-lg font-black text-stone-900">
                {t.essentials.listening.title}
              </p>
              <p className="text-sm font-semibold text-stone-500 mt-1">
                {t.essentials.listening.desc}
              </p>
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
