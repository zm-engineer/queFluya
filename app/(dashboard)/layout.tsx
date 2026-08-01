import { createClient } from '@/lib/supabase/server'
import { LanguageProvider } from '@/components/i18n/language-provider'
import type { Language } from '@/lib/topics'

// Resolves the user's native language once for the whole dashboard group and
// provides the UI dictionary to client components. Server components in the
// group read it themselves via getDict(nativeLanguage).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let nativeLanguage: Language | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('native_language')
      .eq('user_id', user.id)
      .maybeSingle()
    if (profile?.native_language) {
      nativeLanguage = profile.native_language as Language
    }
  }

  // No profile yet (e.g. during onboarding) → inherit the root layout's
  // browser-detected language instead of forcing one.
  if (!nativeLanguage) return <>{children}</>

  return (
    <LanguageProvider nativeLanguage={nativeLanguage}>
      {children}
    </LanguageProvider>
  )
}
