'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useDict } from '@/components/i18n/language-provider'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const t = useDict()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors"
    >
      {t.common.logout}
    </button>
  )
}
