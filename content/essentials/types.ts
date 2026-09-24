import type { Language, Level } from '../../lib/topics'

// "Esenciales" module: language-specific study/practice sets (irregular verbs,
// phrasal verbs, tenses…). Unlike conversational topics these are NOT symmetric
// EN↔ES pairs and have no tandem — each set targets one language (the one being
// learned) and is filtered by the user's target_language, like topics are.

export type EssentialKind =
  | 'irregular-verbs'
  | 'phrasal-verbs'
  | 'tenses'
  | 'interview'

/**
 * An example sentence (target language) with its translation (native).
 * `highlight` is the exact form inside `text` to emphasize, so the learner can
 * see which studied verb the sentence demonstrates.
 */
export type EssentialExample = {
  text: string
  translation: string
  highlight?: string
}

// One studied item. `term` is the headword (infinitive/phrasal); `forms` (when
// present, irregular verbs) are the conjugated forms shown labeled. `examples`
// are the sentences shown below, synced to whichever item is on screen — several
// per verb (e.g. `be` across pronouns: I am, she is, we are…). `level` groups
// items so the practice screen can be filtered by level.
export type EssentialItem = {
  term: string
  level: Level
  translation: string
  forms?: string[]
  examples?: EssentialExample[]
}

export type EssentialSet = {
  /** Unique — used in the /esenciales/[slug] route. */
  slug: string
  kind: EssentialKind
  /** The language being practised (matches profile.target_language). */
  language: Language
  /**
   * Per-set card title / subtitle. When present they override the kind's
   * generic label, so several sets of the same kind (e.g. two `interview` sets)
   * can each show a distinct name. Fall back to the kind label when omitted.
   */
  title?: string
  subtitle?: string
  /**
   * When set, the whole set is only shown to users of exactly this level (the
   * items' own `level` still groups content). Omit for sets shown at every
   * level (e.g. the verb sets).
   */
  level?: Level
  /** Listed but locked — content not authored yet. */
  comingSoon?: boolean
  items: EssentialItem[]
}

/** Display order of the kinds on the list screen. */
export const KIND_ORDER: EssentialKind[] = [
  'irregular-verbs',
  'phrasal-verbs',
  'interview',
  'tenses',
]

// A grammar tense — richer, explanatory content. `name` is the tense's name in
// the target language (e.g. "Present Simple", "Pretérito indefinido"); `when`
// and `structure` are explanations in the learner's native language.
export type TenseInfo = {
  slug: string
  language: Language
  level: Level
  name: string
  when: string
  structure: string
  examples: EssentialExample[]
}
