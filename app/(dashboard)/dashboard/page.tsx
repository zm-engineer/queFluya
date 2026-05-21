import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/logout-button'

const LANGUAGE_LABEL: Record<string, string> = {
  EN: 'inglés',
  ES: 'español',
}

const LEVEL_LABEL: Record<string, string> = {
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
    .select('username, native_language, target_language, level')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) {
    redirect('/onboarding')
  }

  const targetLabel = LANGUAGE_LABEL[profile.target_language] ?? profile.target_language
  const levelLabel = LEVEL_LABEL[profile.level] ?? profile.level

  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="font-serif text-2xl tracking-tight text-stone-900"
          >
            que<span className="text-emerald-700">Fluya</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-stone-600">@{profile.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-serif text-5xl text-stone-900 leading-tight max-w-2xl">
          ¡Hola, {profile.username}! Sigamos practicando.
        </h1>
        <p className="text-stone-500 mt-4 max-w-xl">
          Menos teoría, más práctica. Tu próxima conversación te está esperando.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="border border-stone-200 bg-white p-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Estás aprendiendo
            </p>
            <p className="font-serif text-3xl text-stone-900 capitalize">
              {targetLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
              Nivel
            </p>
            <p className="font-serif text-3xl text-emerald-800">
              {levelLabel}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-serif text-3xl text-stone-900">Temas</h2>
          <span className="text-xs uppercase tracking-widest text-stone-500">
            Próximamente
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            'Presentaciones básicas',
            'En el restaurante',
            'Conversación cotidiana',
          ].map((title) => (
            <div
              key={title}
              className="relative border border-stone-200 bg-white p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-stone-50/60 backdrop-blur-[1px]" />
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">
                  Próximamente
                </p>
                <h3 className="font-serif text-xl text-stone-700">
                  {title}
                </h3>
                <p className="text-sm text-stone-400 mt-3">
                  Bloqueado por ahora.
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
