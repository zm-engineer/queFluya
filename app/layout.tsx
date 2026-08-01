import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { headers } from 'next/headers'
import { LanguageProvider } from '@/components/i18n/language-provider'
import { detectLanguage } from '@/lib/i18n/dictionaries'
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Logged-out default (auth/onboarding); the (dashboard) layout overrides this
  // with the user's profile language once they're signed in.
  const lang = detectLanguage((await headers()).get('accept-language'))

  return (
    <html
      lang={lang === 'EN' ? 'en' : 'es'}
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 text-stone-900 font-sans">
        <LanguageProvider nativeLanguage={lang}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
