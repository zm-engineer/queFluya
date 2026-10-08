import type { TopicPair } from '../types'

// Beginner: colours — basic descriptive vocabulary you use constantly.
export const colors: TopicPair = {
  pairKey: 'colors',
  level: 'BEGINNER',
  position: 4,

  en: {
    slug: 'colors',
    title: 'Colors',
    description: 'Aprende los colores en inglés para describir cosas del día a día.',
    freeRecordingPrompt:
      'Describe tres objetos a tu alrededor y di de qué color son.',
    studySections: [
      {
        title: 'Los colores',
        intro:
          'Los colores más comunes en inglés. Úsalos para describir objetos, ropa y todo lo que ves.',
        vocabulary: [
          { term: 'red', translation: 'rojo' },
          { term: 'blue', translation: 'azul' },
          { term: 'green', translation: 'verde' },
          { term: 'yellow', translation: 'amarillo' },
          { term: 'orange', translation: 'naranja' },
          { term: 'purple', translation: 'morado' },
          { term: 'pink', translation: 'rosa' },
          { term: 'brown', translation: 'marrón' },
          { term: 'black', translation: 'negro' },
          { term: 'white', translation: 'blanco' },
          { term: 'grey', translation: 'gris' },
          { term: 'light blue', translation: 'azul claro' },
          { term: 'dark green', translation: 'verde oscuro' },
          { term: 'gold', translation: 'dorado' },
          { term: 'silver', translation: 'plateado' },
        ],
        dialogue: [
          { speaker: 'A', text: "What's your favourite colour?" },
          { speaker: 'B', text: 'I like blue. And you?' },
          { speaker: 'A', text: 'I love green.' },
        ],
        practicePhrases: [
          'My car is red.',
          "What's your favourite colour?",
          'The sky is blue.',
        ],
      },
    ],
  },

  es: {
    slug: 'los-colores',
    title: 'Los colores',
    description: 'Learn the colours in Spanish to describe everyday things.',
    freeRecordingPrompt:
      'Describe three objects around you and say what colour they are.',
    studySections: [
      {
        title: 'Colours',
        intro:
          'The most common colours in Spanish. Use them to describe objects, clothes and everything you see. Note that colours change to match the noun (rojo / roja).',
        vocabulary: [
          { term: 'rojo', translation: 'red' },
          { term: 'azul', translation: 'blue' },
          { term: 'verde', translation: 'green' },
          { term: 'amarillo', translation: 'yellow' },
          { term: 'naranja', translation: 'orange' },
          { term: 'morado', translation: 'purple' },
          { term: 'rosa', translation: 'pink' },
          { term: 'marrón', translation: 'brown' },
          { term: 'negro', translation: 'black' },
          { term: 'blanco', translation: 'white' },
          { term: 'gris', translation: 'grey' },
          { term: 'azul claro', translation: 'light blue' },
          { term: 'verde oscuro', translation: 'dark green' },
          { term: 'dorado', translation: 'gold' },
          { term: 'plateado', translation: 'silver' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Cuál es tu color favorito?' },
          { speaker: 'B', text: 'Me gusta el azul. ¿Y tú?' },
          { speaker: 'A', text: 'Me encanta el verde.' },
        ],
        practicePhrases: [
          'Mi coche es rojo.',
          '¿Cuál es tu color favorito?',
          'El cielo es azul.',
        ],
      },
    ],
  },
}
