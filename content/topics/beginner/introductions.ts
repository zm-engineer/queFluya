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
          { term: "What's your name?", translation: '¿Cómo te llamas?' },
          { term: 'Nice to meet you', translation: 'Encantado/a de conocerte' },
          { term: 'Pleased to meet you', translation: 'Un placer' },
          { term: "I'm from...", translation: 'Soy de...' },
          { term: 'Where are you from?', translation: '¿De dónde eres?' },
          { term: 'I live in...', translation: 'Vivo en...' },
          { term: "I'm ... years old", translation: 'Tengo ... años' },
          { term: 'How old are you?', translation: '¿Cuántos años tienes?' },
          { term: 'What do you do?', translation: '¿A qué te dedicas?' },
          { term: 'I work as a...', translation: 'Trabajo de...' },
          { term: "I'm a student", translation: 'Soy estudiante' },
          { term: 'This is my friend...', translation: 'Este/a es mi amigo/a...' },
          { term: 'How are you?', translation: '¿Qué tal?' },
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
          { term: '¿Cómo te llamas?', translation: "What's your name?" },
          { term: 'Mucho gusto', translation: 'Nice to meet you' },
          { term: 'Un placer', translation: 'Pleased to meet you' },
          { term: 'Soy de...', translation: "I'm from..." },
          { term: '¿De dónde eres?', translation: 'Where are you from?' },
          { term: 'Vivo en...', translation: 'I live in...' },
          { term: 'Tengo ... años', translation: "I'm ... years old" },
          { term: '¿Cuántos años tienes?', translation: 'How old are you?' },
          { term: '¿A qué te dedicas?', translation: 'What do you do?' },
          { term: 'Trabajo de...', translation: 'I work as a...' },
          { term: 'Soy estudiante', translation: "I'm a student" },
          { term: 'Este/a es mi amigo/a...', translation: 'This is my friend...' },
          { term: '¿Qué tal?', translation: 'How are you?' },
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
