import { ESSENTIAL_SETS } from '../content/essentials'
import { TENSES } from '../content/essentials/tenses'
import {
  KIND_ORDER,
  type EssentialSet,
  type TenseInfo,
} from '../content/essentials/types'
import type { Language } from './topics'

/** The essential sets for a target language, in display order (by kind). */
export function essentialsForLanguage(language: Language): EssentialSet[] {
  return ESSENTIAL_SETS.filter((s) => s.language === language).sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  )
}

/** A single set by slug (or undefined). */
export function essentialBySlug(slug: string): EssentialSet | undefined {
  return ESSENTIAL_SETS.find((s) => s.slug === slug)
}

/** The grammar tenses for a target language. */
export function tensesForLanguage(language: Language): TenseInfo[] {
  return TENSES.filter((t) => t.language === language)
}

/** A single tense by slug (or undefined). */
export function tenseBySlug(slug: string): TenseInfo | undefined {
  return TENSES.find((t) => t.slug === slug)
}
