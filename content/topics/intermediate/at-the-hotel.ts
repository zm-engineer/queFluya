import type { TopicPair } from '../types'

// Intermediate: checking into a hotel — reservations, rooms, amenities.
export const atTheHotel: TopicPair = {
  pairKey: 'at-the-hotel',
  level: 'INTERMEDIATE',
  position: 24,

  en: {
    slug: 'at-the-hotel',
    title: 'At the Hotel',
    description: 'Check in, ask about your room and amenities in English.',
    freeRecordingPrompt:
      'Llegas a un hotel. Di que tienes una reserva, pregunta por el desayuno y la hora de salida.',
    studySections: [
      {
        title: 'En el hotel',
        intro:
          'Everything from arriving with a booking to asking about breakfast and check-out.',
        vocabulary: [
          { term: 'reservation / booking', translation: 'reserva' },
          { term: 'single / double room', translation: 'habitación individual / doble' },
          { term: 'key / key card', translation: 'llave / tarjeta' },
          { term: 'check-in / check-out', translation: 'entrada / salida' },
          { term: 'breakfast included', translation: 'desayuno incluido' },
          { term: 'Wi-Fi password', translation: 'contraseña del wifi' },
          { term: 'towel', translation: 'toalla' },
          { term: 'front desk / reception', translation: 'recepción' },
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
    description: 'Haz el check-in y pregunta por tu habitación en español.',
    freeRecordingPrompt:
      'Llegas a un hotel. Di que tienes una reserva, pregunta por el desayuno y la hora de salida.',
    studySections: [
      {
        title: 'En el hotel',
        intro:
          'Desde llegar con una reserva hasta preguntar por el desayuno y la salida.',
        vocabulary: [
          { term: 'la reserva', translation: 'reservation / booking' },
          { term: 'la habitación individual / doble', translation: 'single / double room' },
          { term: 'la llave / la tarjeta', translation: 'key / key card' },
          { term: 'la entrada / la salida', translation: 'check-in / check-out' },
          { term: 'el desayuno incluido', translation: 'breakfast included' },
          { term: 'la contraseña del wifi', translation: 'Wi-Fi password' },
          { term: 'la toalla', translation: 'towel' },
          { term: 'la recepción', translation: 'front desk / reception' },
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
