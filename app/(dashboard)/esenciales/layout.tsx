import { getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { recordActivity } from '@/lib/streak'

// Opening any Esenciales page counts toward the daily streak (not just
// completing a topic). Idempotent per day; failures are non-fatal (e.g. before
// the activity_days table migration is applied).
export default async function EsencialesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()
  if (profile) {
    const supabase = await createClient()
    await recordActivity(supabase, profile.id).catch(() => {})
  }
  return <>{children}</>
}
