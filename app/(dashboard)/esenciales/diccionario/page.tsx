import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'
import { getDict } from '@/lib/i18n/dictionaries'
import { Dictionary } from '@/components/essentials/dictionary'
import type { Language } from '@/lib/topics'

export default async function DiccionarioPage() {
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
          🔎 {t.essentials.dictionary.title}
        </h1>
        <p className="text-stone-600 text-base font-semibold leading-relaxed mb-8">
          {t.essentials.dictionary.desc}
        </p>

        <Dictionary language={targetLanguage} />
      </section>
    </main>
  )
}
