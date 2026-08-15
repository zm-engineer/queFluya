import type { TopicPair } from '../types'

// Beginner: asking for and giving directions — survival vocabulary the first
// time you're lost in a new city.
export const directions: TopicPair = {
  pairKey: 'directions',
  level: 'BEGINNER',
  position: 8,

  en: {
    slug: 'directions',
    title: 'Directions',
    description: 'Pregunta y da indicaciones sencillas por la calle, en inglés.',
    freeRecordingPrompt:
      'Alguien te pregunta cómo llegar a un sitio. Dale indicaciones: recto, giros y alguna referencia.',
    studySections: [
      {
        title: 'Cómo llegar',
        intro:
          'Pregunta dónde está algo y sigue indicaciones sencillas. Esencial cuando te pierdes.',
        vocabulary: [
          { term: 'Where is…?', translation: '¿Dónde está…?' },
          { term: 'How do I get to…?', translation: '¿Cómo llego a…?' },
          { term: 'straight ahead', translation: 'todo recto' },
          { term: 'turn left / right', translation: 'gira a la izquierda / derecha' },
          { term: 'next to / near', translation: 'al lado de / cerca de' },
          { term: 'on the corner', translation: 'en la esquina' },
          { term: "it's far / close", translation: 'está lejos / cerca' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Excuse me, how do I get to the station?' },
          { speaker: 'B', text: 'Go straight ahead and turn left. It’s next to the bank.' },
          { speaker: 'A', text: 'Is it far?' },
          { speaker: 'B', text: 'No, it’s close. Five minutes.' },
        ],
        practicePhrases: [
          'Where is the bathroom?',
          'How do I get to the center?',
          'Turn right at the corner.',
        ],
      },
    ],
  },

  es: {
    slug: 'como-llegar',
    title: 'Cómo llegar',
    description: 'Ask for and give simple directions on the street, in Spanish.',
    freeRecordingPrompt:
      'Someone asks you how to get somewhere. Give directions: straight ahead, turns, and a landmark.',
    studySections: [
      {
        title: 'Getting there',
        intro:
          'Ask where something is and follow simple directions. Essential when you get lost.',
        vocabulary: [
          { term: '¿Dónde está…?', translation: 'Where is…?' },
          { term: '¿Cómo llego a…?', translation: 'How do I get to…?' },
          { term: 'todo recto', translation: 'straight ahead' },
          { term: 'gira a la izquierda / derecha', translation: 'turn left / right' },
          { term: 'al lado de / cerca de', translation: 'next to / near' },
          { term: 'en la esquina', translation: 'on the corner' },
          { term: 'está lejos / cerca', translation: "it's far / close" },
        ],
        dialogue: [
          { speaker: 'A', text: 'Perdona, ¿cómo llego a la estación?' },
          { speaker: 'B', text: 'Ve todo recto y gira a la izquierda. Está al lado del banco.' },
          { speaker: 'A', text: '¿Está lejos?' },
          { speaker: 'B', text: 'No, está cerca. Cinco minutos.' },
        ],
        practicePhrases: [
          '¿Dónde está el baño?',
          '¿Cómo llego al centro?',
          'Gira a la derecha en la esquina.',
        ],
      },
    ],
  },
}
