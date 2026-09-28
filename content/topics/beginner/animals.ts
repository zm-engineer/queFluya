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
          { term: 'dog', translation: 'perro', image: '/vocab/dog.svg' },
          { term: 'cat', translation: 'gato', image: '/vocab/cat.svg' },
          { term: 'bird', translation: 'pájaro', image: '/vocab/bird.svg' },
          { term: 'fish', translation: 'pez', image: '/vocab/fish.svg' },
          { term: 'horse', translation: 'caballo', image: '/vocab/horse.svg' },
          { term: 'cow', translation: 'vaca', image: '/vocab/cow.svg' },
          { term: 'pig', translation: 'cerdo', image: '/vocab/pig.svg' },
          { term: 'chicken', translation: 'gallina / pollo', image: '/vocab/chicken.svg' },
          { term: 'sheep', translation: 'oveja', image: '/vocab/sheep.svg' },
          { term: 'rabbit', translation: 'conejo', image: '/vocab/rabbit.svg' },
          { term: 'mouse', translation: 'ratón', image: '/vocab/mouse.svg' },
          { term: 'lion', translation: 'león', image: '/vocab/lion.svg' },
          { term: 'elephant', translation: 'elefante', image: '/vocab/elephant.svg' },
          { term: 'bear', translation: 'oso', image: '/vocab/bear.svg' },
          { term: 'snake', translation: 'serpiente', image: '/vocab/snake.svg' },
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
          { term: 'el perro', translation: 'dog', image: '/vocab/dog.svg' },
          { term: 'el gato', translation: 'cat', image: '/vocab/cat.svg' },
          { term: 'el pájaro', translation: 'bird', image: '/vocab/bird.svg' },
          { term: 'el pez', translation: 'fish', image: '/vocab/fish.svg' },
          { term: 'el caballo', translation: 'horse', image: '/vocab/horse.svg' },
          { term: 'la vaca', translation: 'cow', image: '/vocab/cow.svg' },
          { term: 'el cerdo', translation: 'pig', image: '/vocab/pig.svg' },
          { term: 'la gallina', translation: 'hen', image: '/vocab/chicken.svg' },
          { term: 'la oveja', translation: 'sheep', image: '/vocab/sheep.svg' },
          { term: 'el conejo', translation: 'rabbit', image: '/vocab/rabbit.svg' },
          { term: 'el ratón', translation: 'mouse', image: '/vocab/mouse.svg' },
          { term: 'el león', translation: 'lion', image: '/vocab/lion.svg' },
          { term: 'el elefante', translation: 'elephant', image: '/vocab/elephant.svg' },
          { term: 'el oso', translation: 'bear', image: '/vocab/bear.svg' },
          { term: 'la serpiente', translation: 'snake', image: '/vocab/snake.svg' },
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
