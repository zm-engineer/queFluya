import type { TopicPair } from '../types'

// Beginner: telling and asking the time — needed for appointments, transport,
// opening hours. One focused study unit.
export const tellingTheTime: TopicPair = {
  pairKey: 'telling-the-time',
  level: 'BEGINNER',
  position: 6,

  en: {
    slug: 'telling-the-time',
    title: 'Telling the Time',
    description: 'Pregunta y di la hora en inglés del día a día.',
    freeRecordingPrompt:
      'Pregunta la hora y queda con alguien: di a qué hora os veis y dónde.',
    studySections: [
      {
        title: 'La hora',
        intro:
          'Cómo preguntar la hora y decirla. La necesitas para citas, autobuses y horarios.',
        vocabulary: [
          { term: 'What time is it?', translation: '¿Qué hora es?' },
          { term: "It's one o'clock", translation: 'Es la una' },
          { term: "It's three o'clock", translation: 'Son las tres (en punto)' },
          { term: 'half past four', translation: 'las cuatro y media' },
          { term: 'quarter past five', translation: 'las cinco y cuarto' },
          { term: 'quarter to six', translation: 'las seis menos cuarto' },
          { term: 'ten past two', translation: 'las dos y diez' },
          { term: 'twenty to nine', translation: 'las nueve menos veinte' },
          { term: 'in the morning', translation: 'por la mañana' },
          { term: 'in the afternoon', translation: 'por la tarde' },
          { term: 'at night', translation: 'por la noche' },
          { term: 'noon / midnight', translation: 'mediodía / medianoche' },
          { term: 'early / late', translation: 'temprano / tarde' },
          { term: 'on time', translation: 'a tiempo' },
          { term: 'What time does it open?', translation: '¿A qué hora abre?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Excuse me, what time is it?' },
          { speaker: 'B', text: "It's quarter past ten." },
          { speaker: 'A', text: 'Thanks. What time does the shop open?' },
          { speaker: 'B', text: 'At half past ten.' },
        ],
        practicePhrases: [
          'What time is it?',
          "It's half past two.",
          'See you at eight.',
        ],
      },
    ],
  },

  es: {
    slug: 'la-hora',
    title: '¿Qué hora es?',
    description: 'Ask and tell the time in everyday Spanish.',
    freeRecordingPrompt:
      "Ask the time and make plans with someone: say what time you'll meet and where.",
    studySections: [
      {
        title: 'Telling the time',
        intro:
          'How to ask for the time and say it. You need this for meetings, buses and opening hours.',
        vocabulary: [
          { term: '¿Qué hora es?', translation: 'What time is it?' },
          { term: 'Es la una', translation: "It's one o'clock" },
          { term: 'Son las tres (en punto)', translation: "It's three o'clock" },
          { term: 'las cuatro y media', translation: 'half past four' },
          { term: 'las cinco y cuarto', translation: 'quarter past five' },
          { term: 'las seis menos cuarto', translation: 'quarter to six' },
          { term: 'las dos y diez', translation: 'ten past two' },
          { term: 'las nueve menos veinte', translation: 'twenty to nine' },
          { term: 'por la mañana', translation: 'in the morning' },
          { term: 'por la tarde', translation: 'in the afternoon' },
          { term: 'por la noche', translation: 'at night' },
          { term: 'mediodía / medianoche', translation: 'noon / midnight' },
          { term: 'temprano / tarde', translation: 'early / late' },
          { term: 'a tiempo', translation: 'on time' },
          { term: '¿A qué hora abre?', translation: 'What time does it open?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Perdona, ¿qué hora es?' },
          { speaker: 'B', text: 'Son las diez y cuarto.' },
          { speaker: 'A', text: 'Gracias. ¿A qué hora abre la tienda?' },
          { speaker: 'B', text: 'A las diez y media.' },
        ],
        practicePhrases: [
          '¿Qué hora es?',
          'Son las dos y media.',
          'Nos vemos a las ocho.',
        ],
      },
    ],
  },
}
