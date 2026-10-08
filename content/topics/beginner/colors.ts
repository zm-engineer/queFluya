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
          { term: 'red', translation: 'rojo', image: '/vocab/1F534.svg' },
          { term: 'blue', translation: 'azul', image: '/vocab/1F535.svg' },
          { term: 'green', translation: 'verde', image: '/vocab/1F7E2.svg' },
          { term: 'yellow', translation: 'amarillo', image: '/vocab/1F7E1.svg' },
          { term: 'orange', translation: 'naranja', image: '/vocab/1F7E0.svg' },
          { term: 'purple', translation: 'morado', image: '/vocab/1F7E3.svg' },
          { term: 'pink', translation: 'rosa', image: '/vocab/1FA77.svg' },
          { term: 'brown', translation: 'marrón', image: '/vocab/1F7E4.svg' },
          { term: 'black', translation: 'negro', image: '/vocab/26AB.svg' },
          { term: 'white', translation: 'blanco', image: '/vocab/26AA.svg' },
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
          { term: 'rojo', translation: 'red', image: '/vocab/1F534.svg' },
          { term: 'azul', translation: 'blue', image: '/vocab/1F535.svg' },
          { term: 'verde', translation: 'green', image: '/vocab/1F7E2.svg' },
          { term: 'amarillo', translation: 'yellow', image: '/vocab/1F7E1.svg' },
          { term: 'naranja', translation: 'orange', image: '/vocab/1F7E0.svg' },
          { term: 'morado', translation: 'purple', image: '/vocab/1F7E3.svg' },
          { term: 'rosa', translation: 'pink', image: '/vocab/1FA77.svg' },
          { term: 'marrón', translation: 'brown', image: '/vocab/1F7E4.svg' },
          { term: 'negro', translation: 'black', image: '/vocab/26AB.svg' },
          { term: 'blanco', translation: 'white', image: '/vocab/26AA.svg' },
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
