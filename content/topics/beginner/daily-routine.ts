import type { TopicPair } from '../types'

// Beginner: daily routine — lots of everyday verbs plus present-tense practice,
// and an easy topic to talk about with a tandem partner.
export const dailyRoutine: TopicPair = {
  pairKey: 'daily-routine',
  level: 'BEGINNER',
  position: 9,

  en: {
    slug: 'daily-routine',
    title: 'Daily Routine',
    description: 'Describe tu día típico con verbos del día a día, en inglés.',
    freeRecordingPrompt:
      'Cuenta tu día normal de principio a fin: a qué hora te levantas, qué haces y cuándo te acuestas.',
    studySections: [
      {
        title: 'La rutina diaria',
        intro:
          'Los verbos para describir un día normal. Perfecto para practicar el presente.',
        vocabulary: [
          { term: 'wake up / get up', translation: 'despertarse / levantarse', image: '/vocab/23F0.svg' },
          { term: 'take a shower', translation: 'ducharse', image: '/vocab/1F6BF.svg' },
          { term: 'get dressed', translation: 'vestirse', image: '/vocab/1F455.svg' },
          { term: 'brush my teeth', translation: 'lavarse los dientes', image: '/vocab/1FAA5.svg' },
          { term: 'have breakfast', translation: 'desayunar', image: '/vocab/1F963.svg' },
          { term: 'go to work', translation: 'ir al trabajo' },
          { term: 'start work', translation: 'empezar a trabajar' },
          { term: 'have lunch', translation: 'comer / almorzar', image: '/vocab/1F96A.svg' },
          { term: 'finish work', translation: 'terminar de trabajar' },
          { term: 'come home', translation: 'volver a casa', image: '/vocab/1F3E0.svg' },
          { term: 'have dinner', translation: 'cenar', image: '/vocab/1F35D.svg' },
          { term: 'watch TV', translation: 'ver la tele', image: '/vocab/1F4FA.svg' },
          { term: 'relax', translation: 'relajarse', image: '/vocab/1F60C.svg' },
          { term: 'go to bed', translation: 'acostarse', image: '/vocab/1F6CF.svg' },
          { term: 'every day', translation: 'todos los días', image: '/vocab/1F4C5.svg' },
        ],
        dialogue: [
          { speaker: 'A', text: 'What time do you get up?' },
          { speaker: 'B', text: 'I get up at seven. Then I have breakfast and go to work.' },
          { speaker: 'A', text: 'And what do you do in the evening?' },
          { speaker: 'B', text: 'I have dinner and go to bed early.' },
        ],
        practicePhrases: [
          'I get up at seven.',
          'I go to work by bus.',
          'I go to bed late.',
        ],
      },
    ],
  },

  es: {
    slug: 'la-rutina-diaria',
    title: 'La rutina diaria',
    description: 'Describe your typical day with everyday verbs, in Spanish.',
    freeRecordingPrompt:
      'Describe your normal day from start to finish: what time you get up, what you do, and when you go to bed.',
    studySections: [
      {
        title: 'Daily routine',
        intro:
          'The verbs you use to describe an ordinary day. Perfect for practising the present tense.',
        vocabulary: [
          { term: 'despertarse / levantarse', translation: 'wake up / get up', image: '/vocab/23F0.svg' },
          { term: 'ducharse', translation: 'take a shower', image: '/vocab/1F6BF.svg' },
          { term: 'vestirse', translation: 'get dressed', image: '/vocab/1F455.svg' },
          { term: 'lavarse los dientes', translation: 'brush my teeth', image: '/vocab/1FAA5.svg' },
          { term: 'desayunar', translation: 'have breakfast', image: '/vocab/1F963.svg' },
          { term: 'ir al trabajo', translation: 'go to work' },
          { term: 'empezar a trabajar', translation: 'start work' },
          { term: 'comer / almorzar', translation: 'have lunch', image: '/vocab/1F96A.svg' },
          { term: 'terminar de trabajar', translation: 'finish work' },
          { term: 'volver a casa', translation: 'come home', image: '/vocab/1F3E0.svg' },
          { term: 'cenar', translation: 'have dinner', image: '/vocab/1F35D.svg' },
          { term: 'ver la tele', translation: 'watch TV', image: '/vocab/1F4FA.svg' },
          { term: 'relajarse', translation: 'relax', image: '/vocab/1F60C.svg' },
          { term: 'acostarse', translation: 'go to bed', image: '/vocab/1F6CF.svg' },
          { term: 'todos los días', translation: 'every day', image: '/vocab/1F4C5.svg' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿A qué hora te levantas?' },
          { speaker: 'B', text: 'Me levanto a las siete. Luego desayuno y voy al trabajo.' },
          { speaker: 'A', text: '¿Y qué haces por la noche?' },
          { speaker: 'B', text: 'Ceno y me acuesto temprano.' },
        ],
        practicePhrases: [
          'Me levanto a las siete.',
          'Voy al trabajo en autobús.',
          'Me acuesto tarde.',
        ],
      },
    ],
  },
}
