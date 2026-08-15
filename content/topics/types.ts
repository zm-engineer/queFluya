// Authoring format for topic content. You write the MEANINGFUL parts (the study
// units + the recording prompt) as typed objects; buildSections() assembles the
// full 4-section structure the app expects (study… + shadowing + free-recording
// + tandem placeholder). scripts/build-topics.ts turns these into the seed SQL.
//
// Convention (matches the existing seed):
//  * Vocabulary: `term` in the topic's language, `translation` in the other.
//  * Study intro/dialogue/phrases: in the topic's language.
//  * Section titles, the practice-section intros and the recording prompt: in
//    Spanish (the app's UI language).

import type {
  Level,
  TopicDialogueLine,
  TopicSection,
  TopicVocab,
} from '../../lib/topics'

export type StudySection = {
  title: string
  intro: string
  vocabulary: TopicVocab[]
  dialogue: TopicDialogueLine[]
  practicePhrases: string[]
}

export type AuthoredSide = {
  slug: string
  title: string
  description: string
  studySections: StudySection[]
  /** Spanish instruction for the free-recording exercise. */
  freeRecordingPrompt: string
}

/** An EN topic and its ES mirror, linked by one pairKey (the tandem exchange). */
export type TopicPair = {
  pairKey: string
  level: Level
  /** Ordering within each language's topic list. */
  position: number
  en: AuthoredSide
  es: AuthoredSide
}

const SHADOWING_SECTION: TopicSection = {
  title: 'Shadowing del diálogo',
  intro:
    'Escucha y repite el diálogo del tema en voz alta. La repetición fija la pronunciación y el ritmo.',
  vocabulary: [],
  dialogue: [],
  practicePhrases: [],
  shadowing: true,
}

const TANDEM_SECTION: TopicSection = {
  title: 'Conectar',
  intro: 'Practica este tema con otro usuario en vivo.',
  vocabulary: [],
  dialogue: [],
  practicePhrases: [],
  comingSoon: 'tandem',
}

function recordingSection(prompt: string): TopicSection {
  return {
    title: 'Pon en práctica',
    intro: 'Graba tu respuesta usando lo que aprendiste. La IA te dará feedback.',
    vocabulary: [],
    dialogue: [],
    practicePhrases: [],
    freeRecordingPrompt: prompt,
  }
}

/** Expand an authored side into the full section list the app renders. */
export function buildSections(side: AuthoredSide): TopicSection[] {
  return [
    ...side.studySections.map((s) => ({ ...s })),
    SHADOWING_SECTION,
    recordingSection(side.freeRecordingPrompt),
    TANDEM_SECTION,
  ]
}
