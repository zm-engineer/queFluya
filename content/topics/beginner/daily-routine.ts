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
    description: 'Describe your typical day with everyday verbs.',
    freeRecordingPrompt:
      'Cuenta tu día normal de principio a fin: a qué hora te levantas, qué haces y cuándo te acuestas.',
    studySections: [
      {
        title: 'La rutina diaria',
        intro:
          'The verbs you use to describe an ordinary day. Perfect for practising the present tense.',
        vocabulary: [
          { term: 'wake up / get up', translation: 'despertarse / levantarse' },
          { term: 'have breakfast', translation: 'desayunar' },
          { term: 'go to work', translation: 'ir al trabajo' },
          { term: 'have lunch', translation: 'comer / almorzar' },
          { term: 'come home', translation: 'volver a casa' },
          { term: 'have dinner', translation: 'cenar' },
          { term: 'go to bed', translation: 'acostarse' },
          { term: 'every day', translation: 'todos los días' },
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
    description: 'Describe tu día típico con verbos del día a día.',
    freeRecordingPrompt:
      'Describe your normal day from start to finish: what time you get up, what you do, and when you go to bed.',
    studySections: [
      {
        title: 'La rutina diaria',
        intro:
          'Los verbos para describir un día normal. Perfecto para practicar el presente.',
        vocabulary: [
          { term: 'despertarse / levantarse', translation: 'wake up / get up' },
          { term: 'desayunar', translation: 'have breakfast' },
          { term: 'ir al trabajo', translation: 'go to work' },
          { term: 'comer / almorzar', translation: 'have lunch' },
          { term: 'volver a casa', translation: 'come home' },
          { term: 'cenar', translation: 'have dinner' },
          { term: 'acostarse', translation: 'go to bed' },
          { term: 'todos los días', translation: 'every day' },
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
