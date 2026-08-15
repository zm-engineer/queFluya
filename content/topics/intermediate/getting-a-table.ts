import type { TopicPair } from '../types'

// Intermediate: walking into a restaurant and getting seated. Migrated from the
// legacy hand-written seed into the typed pipeline.
export const gettingATable: TopicPair = {
  pairKey: 'getting-a-table',
  level: 'INTERMEDIATE',
  position: 10,

  en: {
    slug: 'getting-a-table',
    title: 'Getting a Table',
    description:
      'Walk into a restaurant, mention your reservation (or lack of it), and get seated.',
    freeRecordingPrompt:
      'Entras a un restaurante con un amigo. Saluda al host, di si tienes reserva, pide una mesa y elige dónde sentarte.',
    studySections: [
      {
        title: 'Conseguir una mesa',
        intro:
          'These phrases will help you walk into a restaurant and get seated.',
        vocabulary: [
          { term: 'A table for two, please', translation: 'Una mesa para dos, por favor' },
          { term: 'Do you have a reservation?', translation: '¿Tienen reserva?' },
          { term: 'Inside or outside?', translation: '¿Adentro o afuera?' },
        ],
        dialogue: [
          { speaker: 'Host', text: 'Hi there! Do you have a reservation?' },
          { speaker: 'Guest', text: "No, we don't. Do you have a table for two?" },
          { speaker: 'Host', text: 'Sure, follow me. Inside or outside?' },
          { speaker: 'Guest', text: 'Outside, please.' },
        ],
        practicePhrases: [
          'A table for two, please.',
          "We don't have a reservation.",
          'Outside, please.',
        ],
      },
    ],
  },

  es: {
    slug: 'conseguir-mesa',
    title: 'Conseguir una mesa',
    description:
      'Entrar en un restaurante en español: reserva, mesa, dónde sentarte.',
    freeRecordingPrompt:
      'You walk into a restaurant with a friend. Greet the host, say whether you have a reservation, ask for a table, and choose where to sit.',
    studySections: [
      {
        title: 'Conseguir una mesa',
        intro: 'Lo que necesitas para entrar y sentarte.',
        vocabulary: [
          { term: 'Una mesa para dos, por favor', translation: 'A table for two, please' },
          { term: '¿Tienen reserva?', translation: 'Do you have a reservation?' },
          { term: 'Adentro o en la terraza', translation: 'Inside or on the terrace' },
        ],
        dialogue: [
          { speaker: 'Anfitrión', text: '¡Hola! ¿Tienen reserva?' },
          { speaker: 'Cliente', text: 'No, no tenemos. ¿Hay mesa para dos?' },
          { speaker: 'Anfitrión', text: 'Sí, claro. ¿Adentro o en la terraza?' },
          { speaker: 'Cliente', text: 'En la terraza, por favor.' },
        ],
        practicePhrases: [
          'Una mesa para dos, por favor.',
          'No tenemos reserva.',
          'En la terraza, por favor.',
        ],
      },
    ],
  },
}
