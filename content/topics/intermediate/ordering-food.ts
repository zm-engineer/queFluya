import type { TopicPair } from '../types'

// Intermediate: ordering food and paying the bill. Migrated from the legacy
// hand-written seed into the typed pipeline.
export const orderingFood: TopicPair = {
  pairKey: 'ordering-food',
  level: 'INTERMEDIATE',
  position: 11,

  en: {
    slug: 'ordering-food',
    title: 'Ordering Food',
    description: 'Ask for the menu, order politely, and pay the bill in English.',
    freeRecordingPrompt:
      'El camarero llega a tu mesa. Pídele recomendaciones, ordena un plato y una bebida, y al final pide la cuenta.',
    studySections: [
      {
        title: 'Pedir comida',
        intro: 'How to ask for what you want — politely.',
        vocabulary: [
          { term: "I'll have...", translation: 'Tomaré...' },
          { term: 'Could I get...?', translation: '¿Podría pedir...?' },
          { term: 'What do you recommend?', translation: '¿Qué recomienda?' },
          { term: 'The bill, please', translation: 'La cuenta, por favor' },
        ],
        dialogue: [
          { speaker: 'Server', text: 'Are you ready to order?' },
          { speaker: 'Guest', text: 'Yes. What do you recommend?' },
          { speaker: 'Server', text: 'The grilled salmon is excellent.' },
          { speaker: 'Guest', text: "Great, I'll have that. And a glass of water, please." },
        ],
        practicePhrases: [
          'Could I get the menu, please?',
          "I'll have the [dish name].",
          'The bill, please.',
        ],
      },
    ],
  },

  es: {
    slug: 'pedir-comida',
    title: 'Pedir comida',
    description: 'Pide en español: menú, plato, bebida y la cuenta.',
    freeRecordingPrompt:
      'The waiter comes to your table. Ask for recommendations, order a dish and a drink, and ask for the bill at the end.',
    studySections: [
      {
        title: 'Pedir la comida',
        intro: 'Cómo pedir educadamente.',
        vocabulary: [
          { term: 'Voy a pedir...', translation: "I'll have..." },
          { term: '¿Qué me recomienda?', translation: 'What do you recommend?' },
          { term: 'La cuenta, por favor', translation: 'The bill, please' },
        ],
        dialogue: [
          { speaker: 'Camarero', text: '¿Listos para pedir?' },
          { speaker: 'Cliente', text: 'Sí. ¿Qué me recomienda?' },
          { speaker: 'Camarero', text: 'El salmón a la parrilla está muy bueno.' },
          { speaker: 'Cliente', text: 'Perfecto, voy a pedirlo. Y un vaso de agua, por favor.' },
        ],
        practicePhrases: [
          '¿Me trae el menú, por favor?',
          'Voy a pedir el [plato].',
          'La cuenta, por favor.',
        ],
      },
    ],
  },
}
