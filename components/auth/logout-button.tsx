'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

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
      Cerrar sesión
    </button>
  )
}
