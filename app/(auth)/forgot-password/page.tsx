'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Introduce tu email.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/reset-password` }
    )
    setLoading(false)

    if (authError) {
      setError('No se pudo enviar el enlace. Inténtalo de nuevo.')
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
            className="font-serif text-3xl tracking-tight text-stone-900"
          >
            que<span className="text-emerald-700">Fluya</span>
          </Link>
          <div className="mt-16 border-t border-stone-200 pt-12">
            <h1 className="font-serif text-3xl text-stone-900 mb-4">
              Revisa tu email
            </h1>
            <p className="text-stone-600 leading-relaxed">
              Te enviamos un enlace para restablecer tu contraseña. Revisa la
              bandeja de entrada y haz click en el enlace para continuar.
            </p>
            <Link
              href="/login"
              className="inline-block mt-10 text-sm text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    )
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
            Recupera tu contraseña
          </h1>
          <p className="text-stone-500 text-sm">
            Te enviaremos un enlace por email.
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
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-10">
          ¿Recordaste tu contraseña?{' '}
          <Link
            href="/login"
            className="text-emerald-700 hover:text-emerald-900 underline underline-offset-4"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
