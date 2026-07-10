'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
            className="text-3xl font-black tracking-tight text-stone-900"
          >
            que<span className="text-emerald-500">Fluya</span>
          </Link>
          <div className="mt-12 bg-white border-2 border-stone-100 rounded-3xl p-10">
            <p className="text-6xl mb-4">📬</p>
            <h1 className="text-3xl font-black text-stone-900 mb-3">
              ¡Casi listo!
            </h1>
            <p className="text-stone-600 font-semibold leading-relaxed">
              Revisa tu email para confirmar tu cuenta y empezar a practicar.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-block mt-8 text-sm font-black text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            ← Volver al inicio de sesión
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
            Crea tu cuenta 🚀
          </h1>
          <p className="text-stone-500 font-semibold">
            Menos teoría, más práctica.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              Nombre completo
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
              Email
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
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-black tracking-wider uppercase text-stone-500 mb-2"
            >
              Confirmar contraseña
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
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="text-center text-sm font-semibold text-stone-500 mt-10">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-emerald-600 font-black hover:text-emerald-700 transition-colors"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  )
}
