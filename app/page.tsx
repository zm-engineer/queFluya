import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-emerald-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 h-[420px] w-[420px] rounded-full bg-amber-100/60 blur-3xl"
      />

      <div className="relative min-h-screen flex flex-col">
        <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
          <span className="font-serif text-2xl tracking-tight text-stone-900">
            que<span className="text-emerald-700">Fluya</span>
          </span>
          <Link
            href="/login"
            className="text-sm text-stone-600 hover:text-emerald-700 transition-colors"
          >
            Iniciar sesión
          </Link>
        </header>

        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl text-center -mt-12">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700 mb-8">
              Inglés ↔ Español
            </p>
            <h1 className="font-serif text-6xl sm:text-7xl leading-[1.05] text-stone-900 tracking-tight">
              Menos teoría,
              <br />
              más práctica,{' '}
              <span className="italic text-emerald-800">¡que fluya!</span>
            </h1>
            <p className="mt-8 text-lg text-stone-600 max-w-lg mx-auto leading-relaxed">
              Practica idiomas conversando con hablantes nativos. Habla. Escucha.
              Mejora cada día.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="w-full sm:w-auto bg-emerald-800 text-stone-50 px-10 py-4 text-sm font-medium tracking-wide hover:bg-emerald-900 transition-colors"
              >
                Registrarme gratis
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto border border-stone-300 text-stone-700 px-10 py-4 text-sm font-medium tracking-wide hover:border-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>

        <footer className="px-6 sm:px-10 py-8 text-center text-xs text-stone-400 tracking-wide">
          queFluya · 2026
        </footer>
      </div>
    </main>
  )
}
