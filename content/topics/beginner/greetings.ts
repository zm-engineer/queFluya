import type { TopicPair } from '../types'

// Beginner: the very first topic — greeting people. Migrated from the legacy
// hand-written seed (supabase/topics_setup.sql) into the typed pipeline.
export const greetings: TopicPair = {
  pairKey: 'greetings',
  level: 'BEGINNER',
  position: 1,

  en: {
    slug: 'greetings',
    title: 'Greetings',
    description: 'Learn how to greet people in everyday English situations.',
    freeRecordingPrompt:
      'Saluda a alguien y pregúntale cómo está. Usa los saludos que aprendiste.',
    studySections: [
      {
        title: 'Saludos básicos',
        intro:
          'These are the most common ways to greet someone in English. Pay attention to how casual or formal each one feels.',
        vocabulary: [
          { term: 'Hi', translation: 'Hola (informal)' },
          { term: 'Hello', translation: 'Hola (neutro)' },
          { term: 'Good morning', translation: 'Buenos días' },
          { term: 'Good afternoon', translation: 'Buenas tardes' },
          { term: 'Good evening', translation: 'Buenas noches (al llegar)' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hi, how are you?' },
          { speaker: 'B', text: "I'm good, thanks. And you?" },
          { speaker: 'A', text: 'Pretty good.' },
        ],
        practicePhrases: [
          'Hi, how are you?',
          'Good morning, nice to see you.',
          "I'm doing well, thank you.",
        ],
      },
    ],
  },

  es: {
    slug: 'saludos',
    title: 'Saludos',
    description:
      'Aprende a saludar en distintas situaciones del día a día en español.',
    freeRecordingPrompt:
      'Greet someone and ask how they are. Use the greetings you learned.',
    studySections: [
      {
        title: 'Saludos básicos',
        intro:
          'Estos son los saludos más comunes en español. Fíjate en cuán formal o informal suena cada uno.',
        vocabulary: [
          { term: 'Hola', translation: 'Hi' },
          { term: 'Buenos días', translation: 'Good morning' },
          { term: 'Buenas tardes', translation: 'Good afternoon' },
          { term: '¿Cómo estás?', translation: 'How are you? (informal)' },
          { term: '¿Cómo está usted?', translation: 'How are you? (formal)' },
        ],
        dialogue: [
          { speaker: 'A', text: '¡Hola! ¿Cómo estás?' },
          { speaker: 'B', text: 'Bien, gracias. ¿Y tú?' },
          { speaker: 'A', text: 'Muy bien también.' },
        ],
        practicePhrases: [
          'Hola, ¿cómo estás?',
          'Buenos días.',
          'Estoy bien, gracias.',
        ],
      },
    ],
  },
}
