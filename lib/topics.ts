import type { SupabaseClient } from '@supabase/supabase-js'

export type Language = 'EN' | 'ES'
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type TopicVocab = { term: string; translation: string }
export type TopicDialogueLine = { speaker: string; text: string }
export type TopicSection = {
  title: string
  intro: string
  vocabulary: TopicVocab[]
  dialogue: TopicDialogueLine[]
  practicePhrases: string[]
}
export type TopicContent = { sections: TopicSection[] }

export type TopicListItem = {
  slug: string
  title: string
  description: string
  language: Language
  level: Level
  position: number
}

export type TopicDetail = TopicListItem & {
  content: TopicContent
}

const LIST_COLUMNS = 'slug, title, description, language, level, position'
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
