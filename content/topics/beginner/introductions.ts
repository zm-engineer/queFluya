import type { TopicPair } from '../types'

// Beginner: introducing yourself — name, origin, a little about you. Migrated
// from the legacy hand-written seed into the typed pipeline.
export const introductions: TopicPair = {
  pairKey: 'introductions',
  level: 'BEGINNER',
  position: 2,

  en: {
    slug: 'introductions',
    title: 'Introductions',
    description: 'Preséntate en inglés: nombre, origen y algo sobre ti.',
    freeRecordingPrompt:
      'Preséntate a un extraño en 30 segundos. Di tu nombre, de dónde eres y algo breve sobre ti.',
    studySections: [
      {
        title: 'Presentándote',
        intro:
          'Después de saludar, lo normal es decir tu nombre y algo sobre ti.',
        vocabulary: [
          { term: 'My name is...', translation: 'Me llamo...' },
          { term: "I'm from...", translation: 'Soy de...' },
          { term: 'Nice to meet you', translation: 'Encantado/a de conocerte' },
          { term: 'What about you?', translation: '¿Y tú?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hi, my name is Sarah.' },
          { speaker: 'B', text: "Nice to meet you, Sarah. I'm Diego." },
          { speaker: 'A', text: 'Where are you from?' },
          { speaker: 'B', text: "I'm from Madrid. What about you?" },
        ],
        practicePhrases: [
          'Hi, my name is [your name].',
          "I'm from [your city].",
          'Nice to meet you.',
        ],
      },
    ],
  },

  es: {
    slug: 'presentaciones',
    title: 'Presentaciones',
    description:
      'Introduce yourself in Spanish: name, origin, a little about you.',
    freeRecordingPrompt:
      'Introduce yourself to a stranger in 30 seconds. Say your name, where you are from, and something brief about you.',
    studySections: [
      {
        title: 'Introducing yourself',
        intro: "How to say your name, where you're from, and what you do.",
        vocabulary: [
          { term: 'Me llamo...', translation: 'My name is...' },
          { term: 'Soy de...', translation: "I'm from..." },
          { term: 'Mucho gusto', translation: 'Nice to meet you' },
          { term: '¿Y tú?', translation: 'And you?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hola, me llamo Sara.' },
          { speaker: 'B', text: 'Mucho gusto, Sara. Yo soy Diego.' },
          { speaker: 'A', text: '¿De dónde eres?' },
          { speaker: 'B', text: 'Soy de Madrid. ¿Y tú?' },
        ],
        practicePhrases: [
          'Hola, me llamo [tu nombre].',
          'Soy de [tu ciudad].',
          'Mucho gusto.',
        ],
      },
    ],
  },
}
