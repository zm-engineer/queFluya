import type { Metadata, Viewport } from 'next'
import { Nunito } from 'next/font/google'
import { headers } from 'next/headers'
import { LanguageProvider } from '@/components/i18n/language-provider'
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register'
import { detectLanguage, getDict } from '@/lib/i18n/dictionaries'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  // Localise the tab title + SEO description to the visitor's language, the same
  // way the pages do (Accept-Language for logged-out visitors).
  const lang = detectLanguage((await headers()).get('accept-language'))
  const t = getDict(lang)
  return {
    title: t.meta.title,
    description: t.meta.description,
    // PWA: the manifest is auto-linked from app/manifest.ts; these add the icons
    // and let iOS launch it full-screen from the home screen.
    appleWebApp: {
      capable: true,
      title: 'queFluya',
      statusBarStyle: 'default',
    },
    icons: {
      icon: '/icon-192.png',
      apple: '/apple-touch-icon.png',
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#10b981',
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
        <ServiceWorkerRegister />
        <LanguageProvider nativeLanguage={lang}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
