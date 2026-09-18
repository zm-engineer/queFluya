import { LanguageProvider } from '@/components/i18n/language-provider'
import { getProfile } from '@/lib/auth'

// Resolves the user's native language once for the whole dashboard group and
// provides the UI dictionary to client components. Server components in the
// group read it themselves via getDict(nativeLanguage). The profile fetch is
// cache()d, so pages reusing getProfile() don't hit Supabase again.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  // No profile yet (e.g. during onboarding) → inherit the root layout's
  // browser-detected language instead of forcing one.
  if (!profile) return <>{children}</>

  return (
    <LanguageProvider nativeLanguage={profile.native_language}>
      {children}
    </LanguageProvider>
  )
}
