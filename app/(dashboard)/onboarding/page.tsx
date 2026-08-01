'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'
import { cn } from '@/lib/utils'

type Language = 'EN' | 'ES'
type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useDict()

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
      setError(t.onboarding.usernameShort)
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError(t.onboarding.usernameChars)
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
        setError(t.onboarding.usernameTaken)
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
        <p className="text-stone-500 font-bold">{t.onboarding.loading}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <Link
          href="/"
          className="block text-center text-2xl font-black tracking-tight text-stone-900 mb-10"
        >
          que<span className="text-emerald-500">Fluya</span>
        </Link>

        <div className="flex items-center justify-center gap-2 mb-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                'h-2 w-16 rounded-full transition-colors',
                step >= n ? 'bg-emerald-500' : 'bg-stone-200'
              )}
            />
          ))}
        </div>

        <div className="bg-white border-2 border-stone-100 rounded-3xl p-8 sm:p-10">
          {step === 1 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-3 text-center">
                {t.onboarding.stepOf(1)}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 text-center mb-8 leading-tight">
                {t.onboarding.q1}
              </h2>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && nextFromStep1()}
                className="text-center text-xl"
                placeholder="maria_g"
                autoFocus
              />
              {error && (
                <p className="text-sm font-bold text-red-700 text-center mt-4">
                  {error}
                </p>
              )}
              <div className="mt-8 flex justify-center">
                <Button onClick={nextFromStep1} size="lg" className="px-12">
                  {t.onboarding.continue}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-3 text-center">
                {t.onboarding.stepOf(2)}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 text-center mb-8 leading-tight">
                {t.onboarding.q2}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => pickLanguage('EN')}
                  className="bg-white border-2 border-b-4 border-stone-200 rounded-2xl py-10 hover:border-emerald-400 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-transform duration-150 group"
                >
                  <span className="block text-5xl mb-3">🇬🇧</span>
                  <span className="block text-xl font-black text-stone-900 group-hover:text-emerald-700">
                    English
                  </span>
                </button>
                <button
                  onClick={() => pickLanguage('ES')}
                  className="bg-white border-2 border-b-4 border-stone-200 rounded-2xl py-10 hover:border-emerald-400 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 transition-transform duration-150 group"
                >
                  <span className="block text-5xl mb-3">🇪🇸</span>
                  <span className="block text-xl font-black text-stone-900 group-hover:text-emerald-700">
                    Español
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-[fade_400ms_ease-out]">
              <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-3 text-center">
                {t.onboarding.stepOf(3)}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-stone-900 text-center mb-2 leading-tight">
                {t.onboarding.q3}
              </h2>
              <p className="text-stone-500 font-semibold text-center mb-8">
                {t.onboarding.q3Sub(
                  t.common.languages[nativeLanguage === 'EN' ? 'ES' : 'EN']
                )}
              </p>
              <div className="space-y-3">
                {(
                  [
                    { value: 'BEGINNER' as Level, emoji: '🌱' },
                    { value: 'INTERMEDIATE' as Level, emoji: '🌿' },
                    { value: 'ADVANCED' as Level, emoji: '🌳' },
                  ]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    disabled={saving}
                    onClick={() => pickLevel(opt.value)}
                    className={cn(
                      'w-full bg-white border-2 border-b-4 rounded-2xl px-5 py-4 text-left transition-transform duration-150',
                      'hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                      level === opt.value
                        ? 'border-emerald-400'
                        : 'border-stone-200 hover:border-emerald-300'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{opt.emoji}</span>
                      <div>
                        <span className="block text-lg font-black text-stone-900">
                          {t.common.levels[opt.value]}
                        </span>
                        <span className="block text-sm font-semibold text-stone-500">
                          {t.onboarding.levelHints[opt.value]}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-sm font-bold text-red-700 text-center mt-6">
                  {error}
                </p>
              )}
              {saving && (
                <p className="text-stone-500 font-bold text-center mt-6">
                  {t.onboarding.saving}
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
