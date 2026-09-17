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
      'Entra en un restaurante, menciona si tienes reserva y consigue mesa, en inglés.',
    freeRecordingPrompt:
      'Entras a un restaurante con un amigo. Saluda al host, di si tienes reserva, pide una mesa y elige dónde sentarte.',
    studySections: [
      {
        title: 'Conseguir una mesa',
        intro:
          'Lo que necesitas para entrar y sentarte.',
        vocabulary: [
          { term: 'A table for two, please', translation: 'Una mesa para dos, por favor' },
          { term: 'Do you have a reservation?', translation: '¿Tienen reserva?' },
          { term: 'I have a reservation under...', translation: 'Tengo una reserva a nombre de...' },
          { term: "We don't have a reservation", translation: 'No tenemos reserva' },
          { term: "We're a party of four", translation: 'Somos cuatro' },
          { term: 'Inside or outside?', translation: '¿Adentro o afuera?' },
          { term: 'a table by the window', translation: 'una mesa junto a la ventana' },
          { term: 'Can we sit outside?', translation: '¿Podemos sentarnos fuera?' },
          { term: 'How long is the wait?', translation: '¿Cuánto hay que esperar?' },
          { term: 'Could we wait at the bar?', translation: '¿Podemos esperar en la barra?' },
          { term: 'Follow me, please', translation: 'Síganme, por favor' },
          { term: 'Is this table OK?', translation: '¿Les parece bien esta mesa?' },
          { term: 'a high chair', translation: 'una trona' },
          { term: 'Could we get another chair?', translation: '¿Nos trae otra silla?' },
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
      'Walk into a restaurant in Spanish: reservation, table, where to sit.',
    freeRecordingPrompt:
      'You walk into a restaurant with a friend. Greet the host, say whether you have a reservation, ask for a table, and choose where to sit.',
    studySections: [
      {
        title: 'Getting a table',
        intro: 'These phrases will help you walk into a restaurant and get seated.',
        vocabulary: [
          { term: 'Una mesa para dos, por favor', translation: 'A table for two, please' },
          { term: '¿Tienen reserva?', translation: 'Do you have a reservation?' },
          { term: 'Tengo una reserva a nombre de...', translation: 'I have a reservation under...' },
          { term: 'No tenemos reserva', translation: "We don't have a reservation" },
          { term: 'Somos cuatro', translation: "We're a party of four" },
          { term: '¿Adentro o en la terraza?', translation: 'Inside or on the terrace?' },
          { term: 'una mesa junto a la ventana', translation: 'a table by the window' },
          { term: '¿Podemos sentarnos fuera?', translation: 'Can we sit outside?' },
          { term: '¿Cuánto hay que esperar?', translation: 'How long is the wait?' },
          { term: '¿Podemos esperar en la barra?', translation: 'Could we wait at the bar?' },
          { term: 'Síganme, por favor', translation: 'Follow me, please' },
          { term: '¿Les parece bien esta mesa?', translation: 'Is this table OK?' },
          { term: 'una trona', translation: 'a high chair' },
          { term: '¿Nos trae otra silla?', translation: 'Could we get another chair?' },
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
