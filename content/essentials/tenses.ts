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

  // ── English tenses — Intermediate ─────────────────────────────────────────
  {
    slug: 'present-perfect-en',
    language: 'EN',
    level: 'INTERMEDIATE',
    name: 'Present Perfect',
    when: 'Para experiencias, acciones pasadas con relevancia en el presente, o que aún continúan.',
    structure: 'sujeto + have / has + participio pasado',
    examples: [
      { text: 'I have finished my work.', highlight: 'have finished', translation: 'He terminado mi trabajo.' },
      { text: 'She has lived here for years.', highlight: 'has lived', translation: 'Ella ha vivido aquí durante años.' },
      { text: 'Have you ever been to Japan?', highlight: 'Have you ever been', translation: '¿Has estado alguna vez en Japón?' },
    ],
  },
  {
    slug: 'past-continuous-en',
    language: 'EN',
    level: 'INTERMEDIATE',
    name: 'Past Continuous',
    when: 'Para acciones en progreso en un momento concreto del pasado.',
    structure: 'sujeto + was / were + verbo-ing',
    examples: [
      { text: 'I was cooking when you called.', highlight: 'was cooking', translation: 'Estaba cocinando cuando llamaste.' },
      { text: 'They were watching TV.', highlight: 'were watching', translation: 'Estaban viendo la tele.' },
      { text: 'What were you doing?', highlight: 'were you doing', translation: '¿Qué estabas haciendo?' },
    ],
  },
  {
    slug: 'future-simple-en',
    language: 'EN',
    level: 'INTERMEDIATE',
    name: 'Future Simple (will)',
    when: 'Para predicciones, decisiones espontáneas y promesas.',
    structure: 'sujeto + will + verbo base',
    examples: [
      { text: 'I will call you tomorrow.', highlight: 'will call', translation: 'Te llamaré mañana.' },
      { text: 'It will rain later.', highlight: 'will rain', translation: 'Lloverá más tarde.' },
      { text: "She won't come to the party.", highlight: "won't come", translation: 'Ella no vendrá a la fiesta.' },
    ],
  },

  // ── English tenses — Advanced ─────────────────────────────────────────────
  {
    slug: 'past-perfect-en',
    language: 'EN',
    level: 'ADVANCED',
    name: 'Past Perfect',
    when: 'Para una acción que ocurrió antes de otra acción pasada.',
    structure: 'sujeto + had + participio pasado',
    examples: [
      { text: 'The train had left when we arrived.', highlight: 'had left', translation: 'El tren se había ido cuando llegamos.' },
      { text: 'I had never seen snow before.', highlight: 'had never seen', translation: 'Nunca había visto la nieve antes.' },
      { text: 'She had finished before noon.', highlight: 'had finished', translation: 'Había terminado antes del mediodía.' },
    ],
  },
  {
    slug: 'first-conditional-en',
    language: 'EN',
    level: 'ADVANCED',
    name: 'First Conditional',
    when: 'Para situaciones reales o probables en el futuro.',
    structure: 'if + presente, + will + verbo base',
    examples: [
      { text: 'If it rains, we will stay home.', highlight: 'will stay', translation: 'Si llueve, nos quedaremos en casa.' },
      { text: 'If you study, you will pass.', highlight: 'will pass', translation: 'Si estudias, aprobarás.' },
      { text: 'I will help you if I can.', highlight: 'will help', translation: 'Te ayudaré si puedo.' },
    ],
  },
  {
    slug: 'second-conditional-en',
    language: 'EN',
    level: 'ADVANCED',
    name: 'Second Conditional',
    when: 'Para situaciones hipotéticas o improbables en el presente o futuro.',
    structure: 'if + pasado simple, + would + verbo base',
    examples: [
      { text: 'If I had more time, I would travel.', highlight: 'would travel', translation: 'Si tuviera más tiempo, viajaría.' },
      { text: 'If I were you, I would say yes.', highlight: 'would say', translation: 'Si yo fuera tú, diría que sí.' },
      { text: 'What would you do?', highlight: 'would you do', translation: '¿Qué harías?' },
    ],
  },

  // ── Spanish tenses — Intermediate ─────────────────────────────────────────
  {
    slug: 'preterito-imperfecto-es',
    language: 'ES',
    level: 'INTERMEDIATE',
    name: 'Pretérito imperfecto',
    when: 'For habitual or ongoing actions in the past, and descriptions.',
    structure: 'subject + imperfect ending (-aba / -ía)',
    examples: [
      { text: 'Cuando era niño, jugaba mucho.', highlight: 'jugaba', translation: 'When I was a child, I played a lot.' },
      { text: 'Llovía toda la tarde.', highlight: 'Llovía', translation: 'It was raining all afternoon.' },
      { text: 'Ella siempre cantaba.', highlight: 'cantaba', translation: 'She always used to sing.' },
    ],
  },
  {
    slug: 'preterito-perfecto-es',
    language: 'ES',
    level: 'INTERMEDIATE',
    name: 'Pretérito perfecto',
    when: 'For recent past actions still connected to the present.',
    structure: 'subject + haber (he / has / ha…) + participle',
    examples: [
      { text: 'He terminado la tarea.', highlight: 'He terminado', translation: 'I have finished the homework.' },
      { text: '¿Has comido ya?', highlight: 'Has comido', translation: 'Have you eaten yet?' },
      { text: 'Hemos visto esa película.', highlight: 'Hemos visto', translation: 'We have seen that movie.' },
    ],
  },
  {
    slug: 'condicional-simple-es',
    language: 'ES',
    level: 'INTERMEDIATE',
    name: 'Condicional simple',
    when: 'For hypothetical situations, wishes and polite requests.',
    structure: 'subject + infinitive + ending (-ía)',
    examples: [
      { text: 'Me gustaría un café.', highlight: 'gustaría', translation: 'I would like a coffee.' },
      { text: 'Yo viajaría más.', highlight: 'viajaría', translation: 'I would travel more.' },
      { text: '¿Podrías ayudarme?', highlight: 'Podrías', translation: 'Could you help me?' },
    ],
  },

  // ── Spanish tenses — Advanced ─────────────────────────────────────────────
  {
    slug: 'presente-subjuntivo-es',
    language: 'ES',
    level: 'ADVANCED',
    name: 'Presente de subjuntivo',
    when: 'For wishes, doubts, emotions and after certain expressions.',
    structure: 'que + subjunctive (-e / -a endings)',
    examples: [
      { text: 'Espero que vengas.', highlight: 'vengas', translation: 'I hope you come.' },
      { text: 'Quiero que seas feliz.', highlight: 'seas', translation: 'I want you to be happy.' },
      { text: 'Es posible que llueva.', highlight: 'llueva', translation: 'It might rain.' },
    ],
  },
  {
    slug: 'preterito-pluscuamperfecto-es',
    language: 'ES',
    level: 'ADVANCED',
    name: 'Pretérito pluscuamperfecto',
    when: 'For an action that happened before another past action.',
    structure: 'subject + había + participle',
    examples: [
      { text: 'Ya había comido cuando llegaste.', highlight: 'había comido', translation: 'I had already eaten when you arrived.' },
      { text: 'Nunca había visto el mar.', highlight: 'había visto', translation: 'I had never seen the sea.' },
      { text: 'Ella había salido antes.', highlight: 'había salido', translation: 'She had left before.' },
    ],
  },
  {
    slug: 'imperativo-es',
    language: 'ES',
    level: 'ADVANCED',
    name: 'Imperativo',
    when: 'For giving orders, instructions and advice.',
    structure: 'affirmative: verb + -a / -e; negative: no + subjunctive',
    examples: [
      { text: 'Cierra la puerta, por favor.', highlight: 'Cierra', translation: 'Close the door, please.' },
      { text: 'No hables tan rápido.', highlight: 'No hables', translation: "Don't speak so fast." },
      { text: 'Ven aquí.', highlight: 'Ven', translation: 'Come here.' },
    ],
  },
]
