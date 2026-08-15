'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const t = useDict()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError(t.auth.enterEmail)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setLoading(false)

    if (authError) {
      setError(t.auth.forgot.sendFail)
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
            <p className="text-6xl mb-4">📨</p>
            <h1 className="text-3xl font-black text-stone-900 mb-3">
              {t.auth.forgot.successTitle}
            </h1>
            <p className="text-stone-600 font-semibold leading-relaxed">
              {t.auth.forgot.successBody}
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
            {t.auth.forgot.title}
          </h1>
          <p className="text-stone-500 font-semibold">
            {t.auth.forgot.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            {loading ? t.auth.forgot.loading : t.auth.forgot.submit}
          </Button>
        </form>

        <p className="text-center text-sm font-semibold text-stone-500 mt-10">
          {t.auth.forgot.remembered}{' '}
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
