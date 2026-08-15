'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDict } from '@/components/i18n/language-provider'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const t = useDict()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError(t.auth.passwordMin)
      return
    }

    if (password !== confirm) {
      setError(t.auth.passwordsNoMatch)
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (authError) {
      setError(t.auth.reset.updateFail)
      return
    }

    router.push('/login')
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
            {t.auth.reset.title}
          </h1>
          <p className="text-stone-500 font-semibold">
            {t.auth.reset.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.reset.newPassword}
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
              htmlFor="confirm"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              {t.auth.register.confirmPassword}
            </label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? t.auth.reset.loading : t.auth.reset.submit}
          </Button>
        </form>
      </div>
    </main>
  )
}
