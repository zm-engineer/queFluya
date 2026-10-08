import type { TopicPair } from '../types'

// Beginner: animals — pets, farm and a few wild ones. Common small talk.
export const animals: TopicPair = {
  pairKey: 'animals',
  level: 'BEGINNER',
  position: 10,

  en: {
    slug: 'animals',
    title: 'Animals',
    description: 'Aprende los nombres de los animales más comunes en inglés.',
    freeRecordingPrompt:
      'Habla de tu animal favorito o de una mascota: di cuál es y cómo es.',
    studySections: [
      {
        title: 'Los animales',
        intro:
          'Animales comunes en inglés: mascotas, de granja y algunos salvajes.',
        vocabulary: [
          { term: 'dog', translation: 'perro' },
          { term: 'cat', translation: 'gato' },
          { term: 'bird', translation: 'pájaro' },
          { term: 'fish', translation: 'pez' },
          { term: 'horse', translation: 'caballo' },
          { term: 'cow', translation: 'vaca' },
          { term: 'pig', translation: 'cerdo' },
          { term: 'chicken', translation: 'gallina / pollo' },
          { term: 'sheep', translation: 'oveja' },
          { term: 'rabbit', translation: 'conejo' },
          { term: 'mouse', translation: 'ratón' },
          { term: 'lion', translation: 'león' },
          { term: 'elephant', translation: 'elefante' },
          { term: 'bear', translation: 'oso' },
          { term: 'snake', translation: 'serpiente' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Do you have any pets?' },
          { speaker: 'B', text: 'Yes, I have a dog. And you?' },
          { speaker: 'A', text: 'I have two cats.' },
        ],
        practicePhrases: [
          'I have a dog.',
          'Do you have any pets?',
          'The cat is black.',
        ],
      },
    ],
  },

  es: {
    slug: 'los-animales',
    title: 'Los animales',
    description: 'Learn the names of the most common animals in Spanish.',
    freeRecordingPrompt:
      'Talk about your favourite animal or a pet: say which it is and what it is like.',
    studySections: [
      {
        title: 'Animals',
        intro:
          'Common animals in Spanish: pets, farm animals and some wild ones.',
        vocabulary: [
          { term: 'el perro', translation: 'dog' },
          { term: 'el gato', translation: 'cat' },
          { term: 'el pájaro', translation: 'bird' },
          { term: 'el pez', translation: 'fish' },
          { term: 'el caballo', translation: 'horse' },
          { term: 'la vaca', translation: 'cow' },
          { term: 'el cerdo', translation: 'pig' },
          { term: 'la gallina', translation: 'hen' },
          { term: 'la oveja', translation: 'sheep' },
          { term: 'el conejo', translation: 'rabbit' },
          { term: 'el ratón', translation: 'mouse' },
          { term: 'el león', translation: 'lion' },
          { term: 'el elefante', translation: 'elephant' },
          { term: 'el oso', translation: 'bear' },
          { term: 'la serpiente', translation: 'snake' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Tienes mascotas?' },
          { speaker: 'B', text: 'Sí, tengo un perro. ¿Y tú?' },
          { speaker: 'A', text: 'Tengo dos gatos.' },
        ],
        practicePhrases: [
          'Tengo un perro.',
          '¿Tienes mascotas?',
          'El gato es negro.',
        ],
      },
    ],
  },
}
