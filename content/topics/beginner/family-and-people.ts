import type { TopicPair } from '../types'

// Beginner: family members — one of the first things you talk about when you
// meet someone.
export const familyAndPeople: TopicPair = {
  pairKey: 'family-and-people',
  level: 'BEGINNER',
  position: 7,

  en: {
    slug: 'family-and-people',
    title: 'Family and People',
    description: 'Habla de tu familia y de la gente que te rodea, en inglés.',
    freeRecordingPrompt:
      'Presenta a tu familia: di quiénes son y algo de cada uno (nombre, edad o dónde viven).',
    studySections: [
      {
        title: 'La familia',
        intro:
          'Las personas más cercanas. Perfecto para romper el hielo cuando conoces a alguien.',
        vocabulary: [
          { term: 'mother / father', translation: 'madre / padre' },
          { term: 'parents', translation: 'padres' },
          { term: 'sister / brother', translation: 'hermana / hermano' },
          { term: 'son / daughter', translation: 'hijo / hija' },
          { term: 'wife / husband', translation: 'esposa / esposo (marido)' },
          { term: 'friend', translation: 'amigo / amiga' },
          { term: 'children / kids', translation: 'hijos / niños' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Do you have any brothers or sisters?' },
          { speaker: 'B', text: 'Yes, I have one sister. And you?' },
          { speaker: 'A', text: 'I have two brothers.' },
          { speaker: 'B', text: 'Nice. Are they older or younger?' },
        ],
        practicePhrases: [
          'This is my sister.',
          'I have two kids.',
          'Do you have any brothers or sisters?',
        ],
      },
    ],
  },

  es: {
    slug: 'la-familia',
    title: 'La familia',
    description: 'Talk about your family and the people around you, in Spanish.',
    freeRecordingPrompt:
      'Introduce your family: say who they are and something about each one (name, age, or where they live).',
    studySections: [
      {
        title: 'Family',
        intro:
          'The people closest to you. Great for small talk when you meet someone new.',
        vocabulary: [
          { term: 'madre / padre', translation: 'mother / father' },
          { term: 'los padres', translation: 'parents' },
          { term: 'hermana / hermano', translation: 'sister / brother' },
          { term: 'hijo / hija', translation: 'son / daughter' },
          { term: 'esposa / esposo (marido)', translation: 'wife / husband' },
          { term: 'amigo / amiga', translation: 'friend' },
          { term: 'los hijos / los niños', translation: 'children / kids' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Tienes hermanos?' },
          { speaker: 'B', text: 'Sí, tengo una hermana. ¿Y tú?' },
          { speaker: 'A', text: 'Tengo dos hermanos.' },
          { speaker: 'B', text: 'Qué bien. ¿Son mayores o menores?' },
        ],
        practicePhrases: [
          'Esta es mi hermana.',
          'Tengo dos hijos.',
          '¿Tienes hermanos?',
        ],
      },
    ],
  },
}
