import type { TopicPair } from '../types'

// Intermediate: checking into a hotel — reservations, rooms, amenities.
export const atTheHotel: TopicPair = {
  pairKey: 'at-the-hotel',
  level: 'INTERMEDIATE',
  position: 24,

  en: {
    slug: 'at-the-hotel',
    title: 'At the Hotel',
    description: 'Haz el check-in y pregunta por tu habitación en inglés.',
    freeRecordingPrompt:
      'Llegas a un hotel. Di que tienes una reserva, pregunta por el desayuno y la hora de salida.',
    studySections: [
      {
        title: 'En el hotel',
        intro:
          'Desde llegar con una reserva hasta preguntar por el desayuno y la salida.',
        vocabulary: [
          { term: 'reservation / booking', translation: 'reserva' },
          { term: 'to book a room', translation: 'reservar una habitación' },
          { term: 'single / double room', translation: 'habitación individual / doble' },
          { term: 'a room with a view', translation: 'habitación con vistas' },
          { term: 'key / key card', translation: 'llave / tarjeta' },
          { term: 'check-in / check-out', translation: 'entrada / salida' },
          { term: 'breakfast included', translation: 'desayuno incluido' },
          { term: 'Wi-Fi password', translation: 'contraseña del wifi' },
          { term: 'air conditioning', translation: 'aire acondicionado' },
          { term: 'towel', translation: 'toalla' },
          { term: 'an extra bed', translation: 'una cama extra' },
          { term: 'the elevator / lift', translation: 'el ascensor' },
          { term: 'front desk / reception', translation: 'recepción' },
          { term: "it doesn't work", translation: 'no funciona' },
          { term: 'a complaint', translation: 'una queja' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hi, I have a reservation under García.' },
          { speaker: 'B', text: 'Welcome. A double room for two nights, right?' },
          { speaker: 'A', text: "That's right. Is breakfast included?" },
          { speaker: 'B', text: "Yes, from 7 to 10. Here's your key card. Room 305." },
          { speaker: 'A', text: "Great. What's the Wi-Fi password?" },
        ],
        practicePhrases: [
          'I have a reservation.',
          'What time is check-out?',
          'Could I have an extra towel?',
          'Is breakfast included?',
        ],
      },
    ],
  },

  es: {
    slug: 'en-el-hotel',
    title: 'En el hotel',
    description: 'Check in, ask about your room and amenities in Spanish.',
    freeRecordingPrompt:
      'You arrive at a hotel. Say you have a reservation, and ask about breakfast and check-out time.',
    studySections: [
      {
        title: 'At the hotel',
        intro:
          'Everything from arriving with a booking to asking about breakfast and check-out.',
        vocabulary: [
          { term: 'la reserva', translation: 'reservation / booking' },
          { term: 'reservar una habitación', translation: 'to book a room' },
          { term: 'la habitación individual / doble', translation: 'single / double room' },
          { term: 'la habitación con vistas', translation: 'a room with a view' },
          { term: 'la llave / la tarjeta', translation: 'key / key card' },
          { term: 'la entrada / la salida', translation: 'check-in / check-out' },
          { term: 'el desayuno incluido', translation: 'breakfast included' },
          { term: 'la contraseña del wifi', translation: 'Wi-Fi password' },
          { term: 'el aire acondicionado', translation: 'air conditioning' },
          { term: 'la toalla', translation: 'towel' },
          { term: 'una cama extra', translation: 'an extra bed' },
          { term: 'el ascensor', translation: 'the elevator / lift' },
          { term: 'la recepción', translation: 'front desk / reception' },
          { term: 'no funciona', translation: "it doesn't work" },
          { term: 'una queja', translation: 'a complaint' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Hola, tengo una reserva a nombre de García.' },
          { speaker: 'B', text: 'Bienvenido. Una habitación doble para dos noches, ¿verdad?' },
          { speaker: 'A', text: 'Así es. ¿El desayuno está incluido?' },
          { speaker: 'B', text: 'Sí, de 7 a 10. Aquí tiene su tarjeta. Habitación 305.' },
          { speaker: 'A', text: 'Genial. ¿Cuál es la contraseña del wifi?' },
        ],
        practicePhrases: [
          'Tengo una reserva.',
          '¿A qué hora es la salida?',
          '¿Me puede dar una toalla más?',
          '¿El desayuno está incluido?',
        ],
      },
    ],
  },
}
