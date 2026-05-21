'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()

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
      setError('Por favor completa todos los campos.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Ingresa un email válido.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })
    setLoading(false)

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        setError('Este email ya está registrado. Intenta iniciar sesión.')
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
            className="font-serif text-3xl tracking-tight text-stone-900"
          >
            que<span className="text-emerald-700">Fluya</span>
          </Link>
          <div className="mt-16 border-t border-stone-200 pt-12">
            <h1 className="font-serif text-3xl text-stone-900 mb-4">
              Casi listo
            </h1>
            <p className="text-stone-600 leading-relaxed">
              Revisa tu email para confirmar tu cuenta y empezar a practicar.
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
            Crea tu cuenta
          </h1>
          <p className="text-stone-500 text-sm">
            Menos teoría, más práctica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-medium tracking-wide uppercase text-stone-600 mb-2"
            >
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none transition-colors"
              placeholder="María García"
            />
          </div>

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
            <label
              htmlFor="password"
              className="block text-xs font-medium tracking-wide uppercase text-stone-600 mb-2"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-stone-300 py-3 text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-medium tracking-wide uppercase text-stone-600 mb-2"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-10">
          ¿Ya tienes cuenta?{' '}
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
