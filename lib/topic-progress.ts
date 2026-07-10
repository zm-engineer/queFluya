import type { SupabaseClient } from '@supabase/supabase-js'

export type ProgressRow = {
  section: number
  completed_at: string | null
}

/**
 * Convert DB rows to a Set of completed section indices (0-indexed).
 * Rows whose completed_at is null are ignored — they represent sections
 * the user has touched but not finished, which the lesson player does
 * not currently distinguish from "not started".
 */
export function parseProgressRows(rows: ProgressRow[]): Set<number> {
  const completed = new Set<number>()
  for (const row of rows) {
    if (row.completed_at !== null) {
      completed.add(row.section - 1)
    }
  }
  return completed
}

/**
 * First un-completed section, or the last section if everything is done.
 * Used to decide where to drop the user when they reopen a topic.
 */
export function currentSectionFor(
  completed: Set<number>,
  total: number
): number {
  for (let i = 0; i < total; i++) {
    if (!completed.has(i)) return i
  }
  return Math.max(0, total - 1)
}

export async function loadCompletedSections(
  supabase: SupabaseClient,
  profileId: string,
  topicSlug: string
): Promise<Set<number>> {
  const { data, error } = await supabase
    .from('topic_progress')
    .select('section, completed_at')
    .eq('profile_id', profileId)
    .eq('topic_slug', topicSlug)

  if (error || !data) return new Set()
  return parseProgressRows(data as ProgressRow[])
}

export async function markSectionCompleted(
  supabase: SupabaseClient,
  profileId: string,
  topicSlug: string,
  sectionIdx: number
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('topic_progress').upsert(
    {
      profile_id: profileId,
      topic_slug: topicSlug,
      section: sectionIdx + 1,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,topic_slug,section' }
  )
  return { error: error ? new Error(error.message) : null }
}
