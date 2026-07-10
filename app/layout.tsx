import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'queFluya — Practica idiomas hablando',
  description:
    'Intercambio de idiomas inglés ↔ español. Menos teoría, más práctica, ¡que fluya!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-900 font-sans">
        {children}
      </body>
    </html>
  )
}
