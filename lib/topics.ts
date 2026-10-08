import type { SupabaseClient } from '@supabase/supabase-js'

export type Language = 'EN' | 'ES'
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

/** Level progression, low → high. Drives grouping and unlock gating. */
export const LEVEL_ORDER: Record<Level, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
}

/** Levels low → high, for iterating grouped topic lists in order. */
export const LEVELS_IN_ORDER: Level[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

/** A topic is unlocked when its level is at or below the user's level. */
export function isLevelUnlocked(topicLevel: Level, userLevel: Level): boolean {
  return LEVEL_ORDER[topicLevel] <= LEVEL_ORDER[userLevel]
}

export type TopicVocab = { term: string; translation: string }
export type TopicDialogueLine = { speaker: string; text: string }
export type TopicSection = {
  title: string
  intro: string
  vocabulary: TopicVocab[]
  dialogue: TopicDialogueLine[]
  practicePhrases: string[]
  /**
   * When present, the section is a free-recording exercise: the user is
   * asked to speak on this prompt (typically using the topic's vocabulary
   * and phrases). The guided fields above are ignored for these sections.
   */
  freeRecordingPrompt?: string
  /**
   * When present, the section is a placeholder for a feature that hasn't
   * shipped yet. The UI shows a "Próximamente" card and the completion
   * gate is open so the user can advance past it.
   */
  comingSoon?: 'video' | 'tandem'
  /**
   * When true, the section is an audio-shadowing practice: the topic's
   * dialogue is played line-by-line with pauses for the user to repeat.
   * Uses the dialogue aggregated across all sections of the topic.
   */
  shadowing?: boolean
}
export type TopicContent = { sections: TopicSection[] }

export type TopicListItem = {
  slug: string
  title: string
  description: string
  language: Language
  level: Level
  position: number
  pairKey: string | null
}

export type TopicDetail = TopicListItem & {
  content: TopicContent
}

const LIST_COLUMNS =
  'slug, title, description, language, level, position, pairKey:pair_key'
const DETAIL_COLUMNS = `${LIST_COLUMNS}, content`

export async function getTopicsForUser(
  supabase: SupabaseClient,
  options: { targetLanguage: Language }
): Promise<TopicListItem[]> {
  const { data, error } = await supabase
    .from('topics')
    .select(LIST_COLUMNS)
    .eq('language', options.targetLanguage)
    .order('position', { ascending: true })

  if (error) return []
  return (data ?? []) as unknown as TopicListItem[]
}

/** Like getTopicsForUser but includes each topic's content (sections), for the
 *  dashboard journey which renders the section list per topic. */
export async function getTopicsWithContentForUser(
  supabase: SupabaseClient,
  options: { targetLanguage: Language }
): Promise<TopicDetail[]> {
  const { data, error } = await supabase
    .from('topics')
    .select(DETAIL_COLUMNS)
    .eq('language', options.targetLanguage)
    .order('position', { ascending: true })

  if (error) return []
  return (data ?? []) as unknown as TopicDetail[]
}

export async function getTopicBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<TopicDetail | null> {
  const { data, error } = await supabase
    .from('topics')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return data as unknown as TopicDetail
}

/**
 * All topics sharing a pair_key — i.e. the two mirror sides of a language
 * exchange (e.g. `greetings` EN + `saludos` ES). Returns whatever exists; a
 * topic with no ES/EN counterpart simply comes back as a single-element list.
 */
export async function getTopicsByPairKey(
  supabase: SupabaseClient,
  pairKey: string
): Promise<TopicDetail[]> {
  const { data, error } = await supabase
    .from('topics')
    .select(DETAIL_COLUMNS)
    .eq('pair_key', pairKey)

  if (error || !data) return []
  return data as unknown as TopicDetail[]
}
