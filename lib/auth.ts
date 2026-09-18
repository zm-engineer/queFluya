import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Language, Level } from '@/lib/topics'

export type Profile = {
  id: string
  username: string
  native_language: Language
  target_language: Language
  level: Level
}

// React `cache()` memoizes per request, so the layout AND the page (and any
// component) share ONE auth round-trip and ONE profile query instead of each
// hitting Supabase again. `getUser` validates the token server-side (secure);
// `getProfile` selects every column any dashboard page needs.

export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, native_language, target_language, level')
    .eq('user_id', user.id)
    .maybeSingle()
  return (data as Profile) ?? null
})
