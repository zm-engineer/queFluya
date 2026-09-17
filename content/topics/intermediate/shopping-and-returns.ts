import type { TopicPair } from '../types'

// Intermediate: shopping for clothes — sizes, trying on, returns and exchanges.
export const shoppingAndReturns: TopicPair = {
  pairKey: 'shopping-and-returns',
  level: 'INTERMEDIATE',
  position: 25,

  en: {
    slug: 'shopping-and-returns',
    title: 'Shopping and Returns',
    description: 'Compra ropa, pruébatela y devuélvela en inglés.',
    freeRecordingPrompt:
      'Estás en una tienda de ropa. Pregunta por una talla, di que te la quieres probar y que quieres devolver algo.',
    studySections: [
      {
        title: 'De compras',
        intro:
          'Tallas, probadores y cómo devolver o cambiar algo que no te queda bien.',
        vocabulary: [
          { term: 'Can I help you?', translation: '¿te ayudo?' },
          { term: 'size', translation: 'talla' },
          { term: 'to try on', translation: 'probarse' },
          { term: 'fitting room', translation: 'probador' },
          { term: 'Do you have this in...?', translation: '¿lo tienes en...?' },
          { term: 'too big / small', translation: 'demasiado grande / pequeño' },
          { term: "it doesn't fit", translation: 'no me queda bien' },
          { term: 'it suits you', translation: 'te queda bien' },
          { term: 'on sale / discount', translation: 'en oferta / descuento' },
          { term: 'the cash register', translation: 'la caja' },
          { term: 'receipt', translation: 'recibo / ticket' },
          { term: 'to return / exchange', translation: 'devolver / cambiar' },
          { term: 'a refund', translation: 'un reembolso' },
          { term: "I'd like to return this", translation: 'quería devolver esto' },
          { term: 'Can I pay by card?', translation: '¿puedo pagar con tarjeta?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hi, can I help you?' },
          { speaker: 'B', text: 'Yes, can I try these on? What size is this?' },
          { speaker: 'A', text: 'It’s a medium. The fitting rooms are over there.' },
          { speaker: 'B', text: 'Thanks. Actually, it doesn’t fit. Can I exchange it for a large?' },
          { speaker: 'A', text: 'Of course. Do you have the receipt?' },
        ],
        practicePhrases: [
          'Can I try this on?',
          'Do you have it in a smaller size?',
          "I'd like to return this.",
          'Is this on sale?',
        ],
      },
    ],
  },

  es: {
    slug: 'de-compras',
    title: 'De compras',
    description: 'Buy clothes, try things on and return them in Spanish.',
    freeRecordingPrompt:
      "You're in a clothes shop. Ask about a size, say you want to try it on, and that you want to return something.",
    studySections: [
      {
        title: 'Shopping',
        intro:
          'Sizes, fitting rooms, and how to return or exchange something that doesn’t fit.',
        vocabulary: [
          { term: '¿te ayudo?', translation: 'Can I help you?' },
          { term: 'la talla', translation: 'size' },
          { term: 'probarse', translation: 'to try on' },
          { term: 'el probador', translation: 'fitting room' },
          { term: '¿lo tienes en...?', translation: 'Do you have this in...?' },
          { term: 'demasiado grande / pequeño', translation: 'too big / small' },
          { term: 'no me queda bien', translation: "it doesn't fit" },
          { term: 'te queda bien', translation: 'it suits you' },
          { term: 'en oferta / con descuento', translation: 'on sale / discount' },
          { term: 'la caja', translation: 'the cash register' },
          { term: 'el recibo / el ticket', translation: 'receipt' },
          { term: 'devolver / cambiar', translation: 'to return / exchange' },
          { term: 'un reembolso', translation: 'a refund' },
          { term: 'quería devolver esto', translation: "I'd like to return this" },
          { term: '¿puedo pagar con tarjeta?', translation: 'Can I pay by card?' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hola, ¿te ayudo?' },
          { speaker: 'B', text: 'Sí, ¿me puedo probar esto? ¿Qué talla es?' },
          { speaker: 'A', text: 'Es una mediana. Los probadores están allí.' },
          { speaker: 'B', text: 'Gracias. La verdad es que no me queda bien. ¿Lo puedo cambiar por una grande?' },
          { speaker: 'A', text: 'Claro. ¿Tienes el ticket?' },
        ],
        practicePhrases: [
          '¿Me puedo probar esto?',
          '¿Lo tienes en una talla más pequeña?',
          'Quería devolver esto.',
          '¿Esto está en oferta?',
        ],
      },
    ],
  },
}
