import type { TopicPair } from '../types'

// Beginner: numbers + shopping/prices — one of the highest-utility everyday
// topics (you need it the first time you buy anything abroad).
export const numbersAndPrices: TopicPair = {
  pairKey: 'numbers-and-prices',
  level: 'BEGINNER',
  position: 5,

  en: {
    slug: 'numbers-and-prices',
    title: 'Numbers and Prices',
    description: 'Cuenta, di precios y paga cosas en inglés del día a día.',
    freeRecordingPrompt:
      'Imagina que compras algo en una tienda. Pregunta cuánto cuesta, di el precio en voz alta y decide si lo pagas con tarjeta o en efectivo.',
    studySections: [
      {
        title: 'Los números',
        intro:
          'Números que usas cada día: para contar, dar tu teléfono o decir cuántos. Di cada uno en voz alta.',
        vocabulary: [
          { term: 'one, two, three', translation: 'uno, dos, tres' },
          { term: 'four, five, six', translation: 'cuatro, cinco, seis' },
          { term: 'seven, eight, nine, ten', translation: 'siete, ocho, nueve, diez' },
          { term: 'eleven', translation: 'once' },
          { term: 'twelve', translation: 'doce' },
          { term: 'thirteen', translation: 'trece' },
          { term: 'fourteen, fifteen', translation: 'catorce, quince' },
          { term: 'sixteen, seventeen', translation: 'dieciséis, diecisiete' },
          { term: 'eighteen, nineteen', translation: 'dieciocho, diecinueve' },
          { term: 'twenty', translation: 'veinte' },
          { term: 'thirty, forty', translation: 'treinta, cuarenta' },
          { term: 'fifty, sixty', translation: 'cincuenta, sesenta' },
          { term: 'a hundred', translation: 'cien' },
          { term: 'a thousand', translation: 'mil' },
        ],
        dialogue: [
          { speaker: 'A', text: 'How many tickets do you need?' },
          { speaker: 'B', text: 'Two, please. One for me and one for my friend.' },
          { speaker: 'A', text: "That's twelve euros." },
        ],
        practicePhrases: [
          'Two coffees, please.',
          'My number is six, one, five…',
          'I need three tickets.',
        ],
      },
      {
        title: 'Precios y pagar',
        intro:
          'Pregunta cuánto cuesta algo, entiende el precio y paga. Aparece siempre que vas de compras.',
        vocabulary: [
          { term: 'How much is it?', translation: '¿Cuánto cuesta?' },
          { term: 'How much is this?', translation: '¿Cuánto vale esto?' },
          { term: 'expensive / cheap', translation: 'caro / barato' },
          { term: 'cash', translation: 'efectivo' },
          { term: 'card', translation: 'tarjeta' },
          { term: 'Can I pay by card?', translation: '¿Puedo pagar con tarjeta?' },
          { term: 'Do you take cards?', translation: '¿Aceptan tarjeta?' },
          { term: "it's on sale", translation: 'está en oferta' },
          { term: 'a discount', translation: 'un descuento' },
          { term: 'the total', translation: 'el total' },
          { term: 'the change', translation: 'el cambio (vuelta)' },
          { term: 'the receipt', translation: 'el recibo' },
          { term: 'Here you are', translation: 'Aquí tienes' },
          { term: 'Keep the change', translation: 'Quédate con el cambio' },
        ],
        dialogue: [
          { speaker: 'A', text: 'How much is this T-shirt?' },
          { speaker: 'B', text: "It's fifteen euros." },
          { speaker: 'A', text: 'OK, I’ll take it. Can I pay by card?' },
          { speaker: 'B', text: 'Of course. Here’s your receipt.' },
        ],
        practicePhrases: [
          'How much is it?',
          'Can I pay by card?',
          "That's too expensive.",
          'Here you are.',
        ],
      },
    ],
  },

  es: {
    slug: 'numeros-y-precios',
    title: 'Los números y los precios',
    description: 'Count, say prices and pay for things in everyday Spanish.',
    freeRecordingPrompt:
      "Imagine you're buying something at a shop. Ask how much it costs, say the price out loud, and decide whether to pay by card or cash.",
    studySections: [
      {
        title: 'Numbers',
        intro:
          'Numbers you use every day: to count, give your phone number, or say how many. Say each one out loud.',
        vocabulary: [
          { term: 'uno, dos, tres', translation: 'one, two, three' },
          { term: 'cuatro, cinco, seis', translation: 'four, five, six' },
          { term: 'siete, ocho, nueve, diez', translation: 'seven, eight, nine, ten' },
          { term: 'once', translation: 'eleven' },
          { term: 'doce', translation: 'twelve' },
          { term: 'trece', translation: 'thirteen' },
          { term: 'catorce, quince', translation: 'fourteen, fifteen' },
          { term: 'dieciséis, diecisiete', translation: 'sixteen, seventeen' },
          { term: 'dieciocho, diecinueve', translation: 'eighteen, nineteen' },
          { term: 'veinte', translation: 'twenty' },
          { term: 'treinta, cuarenta', translation: 'thirty, forty' },
          { term: 'cincuenta, sesenta', translation: 'fifty, sixty' },
          { term: 'cien', translation: 'a hundred' },
          { term: 'mil', translation: 'a thousand' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Cuántas entradas necesitas?' },
          { speaker: 'B', text: 'Dos, por favor. Una para mí y otra para mi amigo.' },
          { speaker: 'A', text: 'Son doce euros.' },
        ],
        practicePhrases: [
          'Dos cafés, por favor.',
          'Mi número es seis, uno, cinco…',
          'Necesito tres entradas.',
        ],
      },
      {
        title: 'Prices and paying',
        intro:
          'Ask how much something costs, understand the price, and pay. These come up every single time you shop.',
        vocabulary: [
          { term: '¿Cuánto cuesta?', translation: 'How much is it?' },
          { term: '¿Cuánto vale esto?', translation: 'How much is this?' },
          { term: 'caro / barato', translation: 'expensive / cheap' },
          { term: 'efectivo', translation: 'cash' },
          { term: 'tarjeta', translation: 'card' },
          { term: '¿Puedo pagar con tarjeta?', translation: 'Can I pay by card?' },
          { term: '¿Aceptan tarjeta?', translation: 'Do you take cards?' },
          { term: 'está en oferta', translation: "it's on sale" },
          { term: 'un descuento', translation: 'a discount' },
          { term: 'el total', translation: 'the total' },
          { term: 'el cambio (la vuelta)', translation: 'the change' },
          { term: 'el recibo', translation: 'the receipt' },
          { term: 'Aquí tienes', translation: 'Here you are' },
          { term: 'Quédate con el cambio', translation: 'Keep the change' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Cuánto cuesta esta camiseta?' },
          { speaker: 'B', text: 'Son quince euros.' },
          { speaker: 'A', text: 'Vale, me la llevo. ¿Puedo pagar con tarjeta?' },
          { speaker: 'B', text: 'Claro. Aquí tienes el recibo.' },
        ],
        practicePhrases: [
          '¿Cuánto cuesta?',
          '¿Puedo pagar con tarjeta?',
          'Es demasiado caro.',
          'Aquí tienes.',
        ],
      },
    ],
  },
}
