import type { TopicPair } from '../types'

// Intermediate: getting around a city by public transport — asking routes,
// buying tickets. (Beginner "directions" covers left/right; this is transport.)
export const gettingAround: TopicPair = {
  pairKey: 'getting-around',
  level: 'INTERMEDIATE',
  position: 27,

  en: {
    slug: 'getting-around',
    title: 'Getting Around the City',
    description: 'Use public transport and ask for routes in English.',
    freeRecordingPrompt:
      'Estás perdido en una ciudad. Pregunta cómo llegar a un sitio y qué transporte tomar.',
    studySections: [
      {
        title: 'Por la ciudad',
        intro:
          'Buses, trains and tickets — how to ask for a route and get to where you’re going.',
        vocabulary: [
          { term: 'bus / train / subway', translation: 'autobús / tren / metro' },
          { term: 'ticket', translation: 'billete / boleto' },
          { term: 'stop / station', translation: 'parada / estación' },
          { term: 'to take (transport)', translation: 'coger / tomar' },
          { term: 'How do I get to…?', translation: '¿cómo llego a…?' },
          { term: 'on foot / to walk', translation: 'a pie / andar' },
          { term: 'taxi', translation: 'taxi' },
          { term: 'map', translation: 'mapa' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Excuse me, how do I get to the museum?' },
          { speaker: 'B', text: "Take the number 5 bus. It's about ten minutes." },
          { speaker: 'A', text: "Where's the stop?" },
          { speaker: 'B', text: "Just around the corner. Or you can walk, it's not far." },
          { speaker: 'A', text: "I'll take the bus. Where can I buy a ticket?" },
        ],
        practicePhrases: [
          'How do I get to the center?',
          "Where's the nearest station?",
          'Which bus goes downtown?',
          'Is it far on foot?',
        ],
      },
    ],
  },

  es: {
    slug: 'por-la-ciudad',
    title: 'Por la ciudad',
    description: 'Usa el transporte público y pregunta rutas en español.',
    freeRecordingPrompt:
      'Estás perdido en una ciudad. Pregunta cómo llegar a un sitio y qué transporte tomar.',
    studySections: [
      {
        title: 'Por la ciudad',
        intro:
          'Autobuses, trenes y billetes: cómo preguntar una ruta y llegar a tu destino.',
        vocabulary: [
          { term: 'el autobús / el tren / el metro', translation: 'bus / train / subway' },
          { term: 'el billete / el boleto', translation: 'ticket' },
          { term: 'la parada / la estación', translation: 'stop / station' },
          { term: 'coger / tomar', translation: 'to take (transport)' },
          { term: '¿cómo llego a…?', translation: 'How do I get to…?' },
          { term: 'a pie / andar', translation: 'on foot / to walk' },
          { term: 'el taxi', translation: 'taxi' },
          { term: 'el mapa', translation: 'map' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Perdona, ¿cómo llego al museo?' },
          { speaker: 'B', text: 'Coge el autobús número 5. Son unos diez minutos.' },
          { speaker: 'A', text: '¿Dónde está la parada?' },
          { speaker: 'B', text: 'A la vuelta de la esquina. O puedes ir andando, no está lejos.' },
          { speaker: 'A', text: 'Cojo el autobús. ¿Dónde compro un billete?' },
        ],
        practicePhrases: [
          '¿Cómo llego al centro?',
          '¿Dónde está la estación más cercana?',
          '¿Qué autobús va al centro?',
          '¿Está lejos a pie?',
        ],
      },
    ],
  },
}
