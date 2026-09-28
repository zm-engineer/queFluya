import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { recordActivity } from '@/lib/streak'

// Marks today as an active day for the streak. Called (fire-and-forget) by the
// client when the user interacts with Esenciales. Idempotent per day.
export async function POST() {
  const profile = await getProfile()
  if (!profile) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const supabase = await createClient()
  await recordActivity(supabase, profile.id).catch(() => {})
  return NextResponse.json({ ok: true })
}
