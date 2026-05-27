'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Ingresa un email válido.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    setLoading(false)

    if (authError) {
      setError('Credenciales incorrectas. Revisa tu email y contraseña.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link
            href="/"
            className="font-serif text-3xl tracking-tight text-stone-900"
          >
            que<span className="text-emerald-700">Fluya</span>
          </Link>
          <h1 className="font-serif text-4xl text-stone-900 mt-10 mb-3">
            Bienvenido de vuelta
          </h1>
          <p className="text-stone-500 text-sm">
            Continúa donde lo dejaste.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium tracking-wide uppercase text-stone-600 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium tracking-wide uppercase text-stone-600"
              >
                Contraseña
              </label>
              <button
                type="button"
                className="text-xs text-stone-500 hover:text-emerald-700 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-800 text-stone-50 py-3.5 text-sm font-medium tracking-wide hover:bg-emerald-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-10">
          ¿Aún no tienes cuenta?{' '}
          <Link
            href="/register"
            className="text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </main>
  )
}
