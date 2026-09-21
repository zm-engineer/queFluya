'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/spinner'
import { useDict } from '@/components/i18n/language-provider'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()
  const t = useDict()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    // Keep `loading` true through the navigation — this button unmounts once we
    // land on /login, so there's no idle state to flip back to. Resetting here
    // would drop the spinner while the redirect is still in flight.
    router.replace('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-sm font-bold text-stone-500 hover:text-emerald-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading && <Spinner />}
      {t.common.logout}
    </button>
  )
}
