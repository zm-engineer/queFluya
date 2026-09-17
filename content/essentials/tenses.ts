import type { TenseInfo } from './types'

// Grammar tenses. `name` is the tense name (target language); `when`/`structure`
// are in the learner's native language (opposite of the topic language).
export const TENSES: TenseInfo[] = [
  // ── English tenses (for Spanish speakers) ──────────────────────────────────
  {
    slug: 'present-simple-en',
    language: 'EN',
    level: 'BEGINNER',
    name: 'Present Simple',
    when: 'Para rutinas, hábitos y verdades generales.',
    structure: 'sujeto + verbo (+ -s / -es en él, ella, eso)',
    examples: [
      { text: 'I work from home.', highlight: 'work', translation: 'Trabajo desde casa.' },
      { text: 'She works in a hospital.', highlight: 'works', translation: 'Ella trabaja en un hospital.' },
      { text: "We don't eat meat.", highlight: "don't eat", translation: 'No comemos carne.' },
      { text: 'Do you speak English?', highlight: 'Do you speak', translation: '¿Hablas inglés?' },
    ],
  },
  {
    slug: 'present-continuous-en',
    language: 'EN',
    level: 'BEGINNER',
    name: 'Present Continuous',
    when: 'Para acciones que ocurren ahora mismo o de forma temporal.',
    structure: 'sujeto + am / is / are + verbo-ing',
    examples: [
      { text: 'I am working right now.', highlight: 'am working', translation: 'Estoy trabajando ahora mismo.' },
      { text: 'She is reading a book.', highlight: 'is reading', translation: 'Ella está leyendo un libro.' },
      { text: 'They are playing outside.', highlight: 'are playing', translation: 'Están jugando afuera.' },
    ],
  },
  {
    slug: 'past-simple-en',
    language: 'EN',
    level: 'BEGINNER',
    name: 'Past Simple',
    when: 'Para acciones terminadas en un momento concreto del pasado.',
    structure: 'sujeto + verbo en pasado (regular: -ed / irregular: 2ª forma)',
    examples: [
      { text: 'I visited my grandma yesterday.', highlight: 'visited', translation: 'Visité a mi abuela ayer.' },
      { text: 'She went to Paris last year.', highlight: 'went', translation: 'Ella fue a París el año pasado.' },
      { text: "We didn't see the movie.", highlight: "didn't see", translation: 'No vimos la película.' },
    ],
  },

  // ── Spanish tenses (for English speakers) ──────────────────────────────────
  {
    slug: 'presente-es',
    language: 'ES',
    level: 'BEGINNER',
    name: 'Presente',
    when: 'For routines, habits and general truths.',
    structure: 'subject + conjugated verb (-o, -as, -a, -amos, -an)',
    examples: [
      { text: 'Trabajo desde casa.', highlight: 'Trabajo', translation: 'I work from home.' },
      { text: 'Ella trabaja en un hospital.', highlight: 'trabaja', translation: 'She works in a hospital.' },
      { text: 'No comemos carne.', highlight: 'comemos', translation: "We don't eat meat." },
    ],
  },
  {
    slug: 'preterito-indefinido-es',
    language: 'ES',
    level: 'BEGINNER',
    name: 'Pretérito indefinido',
    when: 'For completed actions at a specific time in the past.',
    structure: 'subject + preterite ending (-é, -aste, -ó, -amos, -aron)',
    examples: [
      { text: 'Ayer visité a mi abuela.', highlight: 'visité', translation: 'Yesterday I visited my grandma.' },
      { text: 'Ella fue a París el año pasado.', highlight: 'fue', translation: 'She went to Paris last year.' },
      { text: 'Comimos en un restaurante.', highlight: 'Comimos', translation: 'We ate at a restaurant.' },
    ],
  },
  {
    slug: 'futuro-simple-es',
    language: 'ES',
    level: 'BEGINNER',
    name: 'Futuro simple',
    when: 'For future plans and predictions.',
    structure: 'subject + infinitive + ending (-é, -ás, -á, -emos, -án)',
    examples: [
      { text: 'Mañana iré al médico.', highlight: 'iré', translation: "Tomorrow I'll go to the doctor." },
      { text: 'Ella llegará tarde.', highlight: 'llegará', translation: 'She will arrive late.' },
      { text: 'Viajaremos en verano.', highlight: 'Viajaremos', translation: "We'll travel in summer." },
    ],
  },
]
