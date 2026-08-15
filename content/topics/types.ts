// Authoring format for topic content. You write the MEANINGFUL parts (the study
// units + the recording prompt) as typed objects; buildSections() assembles the
// full 4-section structure the app expects (study… + shadowing + free-recording
// + tandem placeholder). scripts/build-topics.ts turns these into the seed SQL.
//
// Convention:
//  * The topic `title` stays in the topic's language — it's the topic's name,
//    the way the learner recognises it (an ES topic is "Saludos", not "Greetings").
//  * Vocabulary: `term` in the topic's language, `translation` in the other.
//  * Study dialogue + practicePhrases: in the topic's language (immersion — this
//    is the content the learner practises out loud).
//  * Everything that is instruction/chrome — the topic `description`, the study
//    section title + intro, the recording prompt, and the boilerplate
//    practice-section titles/intros — goes in the LEARNER'S NATIVE language, i.e.
//    the OPPOSITE of the topic's language (an EN topic is for Spanish natives →
//    Spanish; an ES topic is for English natives → English). So on the `en` side
//    description/title/intro/prompt are Spanish, and on the `es` side English.

import type {
  Language,
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
  /** Free-recording instruction, in the learner's NATIVE language (opposite of
   *  the topic's language): Spanish on the `en` side, English on the `es` side. */
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

// Boilerplate practice sections, keyed by the LEARNER'S NATIVE language.
const BOILERPLATE = {
  ES: {
    shadowingTitle: 'Shadowing del diálogo',
    shadowingIntro:
      'Escucha y repite el diálogo del tema en voz alta. La repetición fija la pronunciación y el ritmo.',
    recordingTitle: 'Pon en práctica',
    recordingIntro:
      'Graba tu respuesta usando lo que aprendiste. La IA te dará feedback.',
    tandemTitle: 'Conectar',
    tandemIntro: 'Practica este tema con otro usuario en vivo.',
  },
  EN: {
    shadowingTitle: 'Shadow the dialogue',
    shadowingIntro:
      'Listen and repeat the dialogue out loud. Repetition locks in your pronunciation and rhythm.',
    recordingTitle: 'Put it into practice',
    recordingIntro:
      'Record your answer using what you learned. The AI will give you feedback.',
    tandemTitle: 'Connect',
    tandemIntro: 'Practice this topic live with another person.',
  },
} satisfies Record<Language, Record<string, string>>

/**
 * Expand an authored side into the full section list the app renders. The
 * boilerplate practice sections are emitted in the learner's native language
 * (the opposite of the topic's `language`).
 */
export function buildSections(
  side: AuthoredSide,
  language: Language
): TopicSection[] {
  const b = BOILERPLATE[language === 'EN' ? 'ES' : 'EN']
  return [
    ...side.studySections.map((s) => ({ ...s })),
    {
      title: b.shadowingTitle,
      intro: b.shadowingIntro,
      vocabulary: [],
      dialogue: [],
      practicePhrases: [],
      shadowing: true,
    },
    {
      title: b.recordingTitle,
      intro: b.recordingIntro,
      vocabulary: [],
      dialogue: [],
      practicePhrases: [],
      freeRecordingPrompt: side.freeRecordingPrompt,
    },
    {
      title: b.tandemTitle,
      intro: b.tandemIntro,
      vocabulary: [],
      dialogue: [],
      practicePhrases: [],
      comingSoon: 'tandem',
    },
  ]
}
