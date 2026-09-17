import Link from 'next/link'
import { headers } from 'next/headers'
import { detectLanguage, getDict } from '@/lib/i18n/dictionaries'

export default async function HomePage() {
  // Same browser/phone-language detection the root layout uses for logged-out
  // visitors: an English device gets the landing in English, everyone else ES.
  const lang = detectLanguage((await headers()).get('accept-language'))
  const t = getDict(lang)

  return (
    <main className="min-h-screen bg-stone-50 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-amber-200/50 blur-3xl"
      />

      <div className="relative min-h-screen flex flex-col">
        <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight text-stone-900">
            que<span className="text-emerald-500">Fluya</span>
          </span>
          <Link
            href="/login"
            className="text-sm font-bold text-stone-600 hover:text-emerald-600 transition-colors"
          >
            {t.landing.signIn}
          </Link>
        </header>

        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl text-center -mt-12">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-8">
              🇬🇧 ↔ 🇪🇸 {t.landing.badge}
            </p>
            <h1 className="text-6xl sm:text-7xl font-black leading-[1.05] text-stone-900 tracking-tight">
              {t.landing.headlineLine1}
              <br />
              {t.landing.headlineLine2}{' '}
              <span className="text-emerald-500">{t.landing.headlineHighlight}</span>
            </h1>
            <p className="mt-8 text-lg text-stone-600 font-semibold max-w-lg mx-auto leading-relaxed">
              {t.landing.subtitle}
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-emerald-500 text-white border-b-4 border-emerald-700 rounded-2xl px-10 py-4 text-sm font-black uppercase tracking-wide hover:bg-emerald-400 active:translate-y-1 active:border-b-0 transition-transform duration-150"
              >
                {t.landing.startFree}
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white text-stone-700 border-2 border-b-4 border-stone-200 rounded-2xl px-10 py-3.5 text-sm font-black uppercase tracking-wide hover:bg-stone-50 active:translate-y-1 active:border-b-2 transition-transform duration-150"
              >
                {t.landing.signIn}
              </Link>
            </div>
          </div>
        </section>

        <footer className="px-6 sm:px-10 py-8 text-center text-xs font-bold text-stone-400 tracking-wide">
          queFluya · 2026
        </footer>
      </div>
    </main>
  )
}
