'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useDict } from '@/components/i18n/language-provider'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useDict()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError(t.auth.fillFields)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t.auth.invalidEmail)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setLoading(false)
      setError(t.auth.login.badCreds)
      return
    }

    // Keep `loading` true through the navigation — the dashboard route takes a
    // moment to fetch its data, and this component unmounts once it renders.
    // Resetting loading here would flip the button back to its idle label and
    // leave the user staring at the login page with no sign anything happened.
    router.push('/dashboard')
    router.refresh()
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
            {t.auth.login.title}
          </h1>
          <p className="text-stone-500 font-semibold">
            {t.auth.login.subtitle}
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

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-black tracking-wider uppercase text-stone-500"
              >
                {t.auth.password}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-stone-500 hover:text-emerald-600 transition-colors"
              >
                {t.auth.login.forgot}
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                {t.auth.login.loading}
              </span>
            ) : (
              t.auth.signIn
            )}
          </Button>
        </form>

        <p className="text-center text-sm font-semibold text-stone-500 mt-10">
          {t.auth.login.noAccount}{' '}
          <Link
            href="/register"
            className="text-emerald-600 font-black hover:text-emerald-700 transition-colors"
          >
            {t.auth.login.createOne}
          </Link>
        </p>
      </div>
    </main>
  )
}
