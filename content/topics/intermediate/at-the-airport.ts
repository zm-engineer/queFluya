import type { TopicPair } from '../types'

// Intermediate: navigating an airport — check-in, security, boarding. High-value
// travel vocabulary with a realistic check-in dialogue.
export const atTheAirport: TopicPair = {
  pairKey: 'at-the-airport',
  level: 'INTERMEDIATE',
  position: 20,

  en: {
    slug: 'at-the-airport',
    title: 'At the Airport',
    description: 'Check in, pass security and board your flight in English.',
    freeRecordingPrompt:
      'Estás facturando para un vuelo. Da tu destino, di cuántas maletas llevas y pregunta por la puerta de embarque.',
    studySections: [
      {
        title: 'En el aeropuerto',
        intro:
          'The words and phrases you need from check-in to the gate. You use these every time you fly.',
        vocabulary: [
          { term: 'boarding pass', translation: 'tarjeta de embarque' },
          { term: 'check-in desk', translation: 'mostrador de facturación' },
          { term: 'luggage / baggage', translation: 'equipaje' },
          { term: 'carry-on', translation: 'equipaje de mano' },
          { term: 'gate', translation: 'puerta (de embarque)' },
          { term: 'delayed / on time', translation: 'retrasado / a tiempo' },
          { term: 'passport', translation: 'pasaporte' },
          { term: 'security', translation: 'control de seguridad' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Good morning. Where are you flying today?' },
          { speaker: 'B', text: "To Madrid. Here's my passport." },
          { speaker: 'A', text: 'Are you checking any bags?' },
          { speaker: 'B', text: 'Just this one. Can I take my backpack as carry-on?' },
          { speaker: 'A', text: 'Of course. Your gate is B12 and boarding starts at 10:30.' },
        ],
        practicePhrases: [
          "Where's the check-in desk?",
          'Is the flight on time?',
          "I'd like a window seat, please.",
          'Which gate does it leave from?',
        ],
      },
    ],
  },

  es: {
    slug: 'en-el-aeropuerto',
    title: 'En el aeropuerto',
    description: 'Factura, pasa el control y embarca tu vuelo en español.',
    freeRecordingPrompt:
      "You're checking in for a flight. Give your destination, say how many bags you have, and ask about your gate.",
    studySections: [
      {
        title: 'En el aeropuerto',
        intro:
          'Las palabras y frases que necesitas desde la facturación hasta la puerta. Las usas cada vez que vuelas.',
        vocabulary: [
          { term: 'la tarjeta de embarque', translation: 'boarding pass' },
          { term: 'el mostrador de facturación', translation: 'check-in desk' },
          { term: 'el equipaje', translation: 'luggage / baggage' },
          { term: 'el equipaje de mano', translation: 'carry-on' },
          { term: 'la puerta (de embarque)', translation: 'gate' },
          { term: 'retrasado / a tiempo', translation: 'delayed / on time' },
          { term: 'el pasaporte', translation: 'passport' },
          { term: 'el control de seguridad', translation: 'security' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Buenos días. ¿A dónde vuela hoy?' },
          { speaker: 'B', text: 'A Madrid. Aquí tiene mi pasaporte.' },
          { speaker: 'A', text: '¿Factura alguna maleta?' },
          { speaker: 'B', text: 'Solo esta. ¿Puedo llevar la mochila como equipaje de mano?' },
          { speaker: 'A', text: 'Claro. Su puerta es la B12 y el embarque empieza a las 10:30.' },
        ],
        practicePhrases: [
          '¿Dónde está el mostrador de facturación?',
          '¿El vuelo va a tiempo?',
          'Quería un asiento de ventana, por favor.',
          '¿De qué puerta sale?',
        ],
      },
    ],
  },
}
