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
    description: 'Pide el menú, ordena con educación y paga la cuenta en inglés.',
    freeRecordingPrompt:
      'El camarero llega a tu mesa. Pídele recomendaciones, ordena un plato y una bebida, y al final pide la cuenta.',
    studySections: [
      {
        title: 'Pedir comida',
        intro: 'Cómo pedir educadamente.',
        vocabulary: [
          { term: 'Could I see the menu?', translation: '¿Me trae el menú?' },
          { term: 'What do you recommend?', translation: '¿Qué recomienda?' },
          { term: "I'll have...", translation: 'Tomaré...' },
          { term: 'Could I get...?', translation: '¿Podría pedir...?' },
          { term: 'for starters', translation: 'de primero' },
          { term: 'for the main course', translation: 'de segundo' },
          { term: 'Is it spicy?', translation: '¿Pica?' },
          { term: "I'm allergic to...", translation: 'Soy alérgico/a a...' },
          { term: 'a glass of water', translation: 'un vaso de agua' },
          { term: 'Anything to drink?', translation: '¿Algo de beber?' },
          { term: 'It was delicious', translation: 'Estaba delicioso' },
          { term: 'Could I have the bill?', translation: '¿Me trae la cuenta?' },
          { term: 'Is service included?', translation: '¿Está incluido el servicio?' },
          { term: 'Can I pay by card?', translation: '¿Puedo pagar con tarjeta?' },
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
    description: 'Order in Spanish: menu, dish, drink, and the bill.',
    freeRecordingPrompt:
      'The waiter comes to your table. Ask for recommendations, order a dish and a drink, and ask for the bill at the end.',
    studySections: [
      {
        title: 'Ordering food',
        intro: 'How to ask for what you want — politely.',
        vocabulary: [
          { term: '¿Me trae el menú?', translation: 'Could I see the menu?' },
          { term: '¿Qué me recomienda?', translation: 'What do you recommend?' },
          { term: 'Voy a pedir...', translation: "I'll have..." },
          { term: '¿Podría pedir...?', translation: 'Could I get...?' },
          { term: 'de primero', translation: 'for starters' },
          { term: 'de segundo', translation: 'for the main course' },
          { term: '¿Pica?', translation: 'Is it spicy?' },
          { term: 'Soy alérgico/a a...', translation: "I'm allergic to..." },
          { term: 'un vaso de agua', translation: 'a glass of water' },
          { term: '¿Algo de beber?', translation: 'Anything to drink?' },
          { term: 'Estaba delicioso', translation: 'It was delicious' },
          { term: '¿Me trae la cuenta?', translation: 'Could I have the bill?' },
          { term: '¿Está incluido el servicio?', translation: 'Is service included?' },
          { term: '¿Puedo pagar con tarjeta?', translation: 'Can I pay by card?' },
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
