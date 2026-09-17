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
    description: 'Usa el transporte público y pregunta rutas en inglés.',
    freeRecordingPrompt:
      'Estás perdido en una ciudad. Pregunta cómo llegar a un sitio y qué transporte tomar.',
    studySections: [
      {
        title: 'Por la ciudad',
        intro:
          'Autobuses, trenes y billetes: cómo preguntar una ruta y llegar a tu destino.',
        vocabulary: [
          { term: 'bus / train / subway', translation: 'autobús / tren / metro' },
          { term: 'ticket', translation: 'billete / boleto' },
          { term: 'a single / return ticket', translation: 'billete de ida / ida y vuelta' },
          { term: 'stop / station', translation: 'parada / estación' },
          { term: 'platform', translation: 'andén' },
          { term: 'to take (transport)', translation: 'coger / tomar' },
          { term: 'to get off', translation: 'bajarse' },
          { term: 'to change (lines)', translation: 'hacer transbordo' },
          { term: 'the next stop', translation: 'la próxima parada' },
          { term: 'How do I get to…?', translation: '¿cómo llego a…?' },
          { term: 'How much is the fare?', translation: '¿cuánto cuesta el billete?' },
          { term: 'on foot / to walk', translation: 'a pie / andar' },
          { term: 'taxi', translation: 'taxi' },
          { term: 'the timetable', translation: 'el horario' },
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
    description: 'Use public transport and ask for routes in Spanish.',
    freeRecordingPrompt:
      'You are lost in a city. Ask how to get somewhere and what transport to take.',
    studySections: [
      {
        title: 'Around the city',
        intro:
          'Buses, trains and tickets — how to ask for a route and get to where you’re going.',
        vocabulary: [
          { term: 'el autobús / el tren / el metro', translation: 'bus / train / subway' },
          { term: 'el billete / el boleto', translation: 'ticket' },
          { term: 'billete de ida / ida y vuelta', translation: 'a single / return ticket' },
          { term: 'la parada / la estación', translation: 'stop / station' },
          { term: 'el andén', translation: 'platform' },
          { term: 'coger / tomar', translation: 'to take (transport)' },
          { term: 'bajarse', translation: 'to get off' },
          { term: 'hacer transbordo', translation: 'to change (lines)' },
          { term: 'la próxima parada', translation: 'the next stop' },
          { term: '¿cómo llego a…?', translation: 'How do I get to…?' },
          { term: '¿cuánto cuesta el billete?', translation: 'How much is the fare?' },
          { term: 'a pie / andar', translation: 'on foot / to walk' },
          { term: 'el taxi', translation: 'taxi' },
          { term: 'el horario', translation: 'the timetable' },
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
