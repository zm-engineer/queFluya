'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useDict } from '@/components/i18n/language-provider'

export default function RegisterPage() {
  const supabase = createClient()
  const t = useDict()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(t.auth.fillFields)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t.auth.invalidEmail)
      return
    }

    if (password.length < 8) {
      setError(t.auth.passwordMin)
      return
    }

    if (password !== confirmPassword) {
      setError(t.auth.passwordsNoMatch)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Confirmation link must point back to wherever the user signed up
        // (localhost in dev, the Vercel URL in prod) instead of Supabase's
        // default Site URL — otherwise prod emails send users to localhost.
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName.trim(),
        },
      },
    })
    setLoading(false)

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        setError(t.auth.register.alreadyRegistered)
      } else {
        setError(authError.message)
      }
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight text-stone-900"
          >
            que<span className="text-emerald-500">Fluya</span>
          </Link>
          <div className="mt-12 bg-white border-2 border-stone-100 rounded-3xl p-10">
            <p className="text-6xl mb-4">📬</p>
            <h1 className="text-3xl font-black text-stone-900 mb-3">
              {t.auth.register.successTitle}
            </h1>
            <p className="text-stone-600 font-semibold leading-relaxed">
              {t.auth.register.successBody}
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block mt-8 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {t.auth.backToLogin}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight text-stone-900"
          >
            que<span className="text-emerald-500">Fluya</span>
          </Link>
          <h1 className="text-4xl font-black text-stone-900 mt-10 mb-2">
            {t.auth.register.title}
          </h1>
          <p className="text-stone-500 font-semibold">
            {t.auth.register.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.register.fullName}
            </label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="María García"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.email}
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.password}
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.register.passwordPlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.register.confirmPassword}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm font-bold text-red-700 bg-red-50 border-2 border-red-100 px-4 py-3 rounded-2xl">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Spinner />
                {t.auth.register.loading}
              </span>
            ) : (
              t.auth.register.submit
            )}
          </Button>
        </form>

        <p className="text-center text-sm font-semibold text-stone-500 mt-10">
          {t.auth.register.haveAccount}{' '}
          <Link
            href="/login"
            className="text-emerald-600 font-black hover:text-emerald-700 transition-colors"
          >
            {t.auth.signIn}
          </Link>
        </p>
      </div>
    </main>
  )
}
