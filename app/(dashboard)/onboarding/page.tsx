'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Language = 'EN' | 'ES'
type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [checking, setChecking] = useState(true)
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (profile) {
        router.replace('/dashboard')
        return
      }
      setChecking(false)
    }
    check()
  }, [router, supabase])

  function nextFromStep1() {
    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setError('Tu nombre de usuario debe tener al menos 3 caracteres.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Solo letras, números y guion bajo.')
      return
    }
    setError(null)
    setStep(2)
  }

  function pickLanguage(lang: Language) {
    setNativeLanguage(lang)
    setError(null)
    setStep(3)
  }

  async function pickLevel(value: Level) {
    setLevel(value)
    setError(null)

    if (!nativeLanguage) return

    setSaving(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setSaving(false)
      router.replace('/login')
      return
    }

    const targetLanguage: Language = nativeLanguage === 'EN' ? 'ES' : 'EN'

    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: user.id,
      username: username.trim(),
      native_language: nativeLanguage,
      target_language: targetLanguage,
      level: value,
    })

    setSaving(false)

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Ese nombre de usuario ya está en uso. Vuelve al paso 1 y elige otro.')
      } else {
        setError(insertError.message)
      }
      setLevel(null)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-sm">Cargando…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="block text-center font-serif text-2xl tracking-tight text-stone-900 mb-16"
        >
          que<span className="text-emerald-700">Fluya</span>
        </Link>

        <div className="flex items-center justify-center gap-3 mb-14">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-px w-12 transition-colors ${
                step >= n ? 'bg-emerald-700' : 'bg-stone-300'
              }`}
            />
          ))}
        </div>

        <div className="transition-opacity duration-500">
          {step === 1 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-4 text-center">
                Paso 1 de 3
              </p>
              <h2 className="font-serif text-4xl text-stone-900 text-center mb-10 leading-tight">
                ¿Cuál es tu nombre de usuario?
              </h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nextFromStep1()}
                className="w-full bg-transparent border-b border-stone-300 py-4 text-center text-2xl font-serif text-stone-900 placeholder:text-stone-300 focus:border-emerald-700 focus:outline-none transition-colors"
                placeholder="maria_g"
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-700 text-center mt-6">{error}</p>
              )}
              <button
                onClick={nextFromStep1}
                className="block mx-auto mt-12 bg-emerald-800 text-stone-50 px-10 py-3.5 text-sm font-medium tracking-wide hover:bg-emerald-900 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-4 text-center">
                Paso 2 de 3
              </p>
              <h2 className="font-serif text-4xl text-stone-900 text-center mb-10 leading-tight">
                ¿Cuál es tu idioma nativo?
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => pickLanguage('EN')}
                  className="border border-stone-300 bg-white py-10 hover:border-emerald-700 hover:bg-emerald-50/40 transition-colors group"
                >
                  <span className="block font-serif text-3xl text-stone-900 group-hover:text-emerald-800">
                    English
                  </span>
                  <span className="block text-xs uppercase tracking-widest text-stone-500 mt-2">
                    Inglés
                  </span>
                </button>
                <button
                  onClick={() => pickLanguage('ES')}
                  className="border border-stone-300 bg-white py-10 hover:border-emerald-700 hover:bg-emerald-50/40 transition-colors group"
                >
                  <span className="block font-serif text-3xl text-stone-900 group-hover:text-emerald-800">
                    Español
                  </span>
                  <span className="block text-xs uppercase tracking-widest text-stone-500 mt-2">
                    Spanish
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-xs uppercase tracking-widest text-stone-500 mb-4 text-center">
                Paso 3 de 3
              </p>
              <h2 className="font-serif text-4xl text-stone-900 text-center mb-3 leading-tight">
                ¿Cuál es tu nivel?
              </h2>
              <p className="text-stone-500 text-sm text-center mb-10">
                {nativeLanguage === 'EN' ? 'de español' : 'de inglés'}
              </p>
              <div className="space-y-3">
                {(
                  [
                    { value: 'BEGINNER' as Level, label: 'Principiante', hint: 'Apenas estoy empezando' },
                    { value: 'INTERMEDIATE' as Level, label: 'Intermedio', hint: 'Puedo mantener conversaciones simples' },
                    { value: 'ADVANCED' as Level, label: 'Avanzado', hint: 'Solo me falta práctica' },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    disabled={saving}
                    onClick={() => pickLevel(opt.value)}
                    className={`w-full border bg-white px-6 py-5 text-left hover:border-emerald-700 hover:bg-emerald-50/40 transition-colors disabled:opacity-50 ${
                      level === opt.value ? 'border-emerald-700' : 'border-stone-300'
                    }`}
                  >
                    <span className="block font-serif text-xl text-stone-900">
                      {opt.label}
                    </span>
                    <span className="block text-sm text-stone-500 mt-1">
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-sm text-red-700 text-center mt-6">{error}</p>
              )}
              {saving && (
                <p className="text-stone-500 text-sm text-center mt-6">
                  Guardando…
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}
