import type { TopicPair } from '../types'

// Intermediate: describing symptoms at the doctor — genuinely useful abroad.
export const atTheDoctor: TopicPair = {
  pairKey: 'at-the-doctor',
  level: 'INTERMEDIATE',
  position: 22,

  en: {
    slug: 'at-the-doctor',
    title: 'At the Doctor',
    description: 'Describe symptoms and understand a doctor in English.',
    freeRecordingPrompt:
      'Estás en el médico. Explica cómo te sientes, qué te duele y desde cuándo.',
    studySections: [
      {
        title: 'En el médico',
        intro:
          "Explaining how you feel and what hurts. Important to know before you need it abroad.",
        vocabulary: [
          { term: 'it hurts', translation: 'me duele' },
          { term: 'headache', translation: 'dolor de cabeza' },
          { term: 'fever', translation: 'fiebre' },
          { term: 'cough', translation: 'tos' },
          { term: 'prescription', translation: 'receta' },
          { term: 'pain / painful', translation: 'dolor / doloroso' },
          { term: 'to feel sick', translation: 'sentirse mal' },
          { term: 'appointment', translation: 'cita' },
        ],
        dialogue: [
          { speaker: 'A', text: "What's the matter?" },
          { speaker: 'B', text: "I don't feel well. I have a headache and a bit of a fever." },
          { speaker: 'A', text: 'How long have you felt like this?' },
          { speaker: 'B', text: 'Since yesterday. And I have a cough too.' },
          { speaker: 'A', text: "Okay. I'll give you a prescription. Rest and drink water." },
        ],
        practicePhrases: [
          'I have an appointment at four.',
          'My throat hurts.',
          'I need to see a doctor.',
          'How often should I take it?',
        ],
      },
    ],
  },

  es: {
    slug: 'en-el-medico',
    title: 'En el médico',
    description: 'Describe síntomas y entiende al médico en español.',
    freeRecordingPrompt:
      "You're at the doctor. Explain how you feel, what hurts, and since when.",
    studySections: [
      {
        title: 'En el médico',
        intro:
          'Explicar cómo te sientes y qué te duele. Importante saberlo antes de necesitarlo fuera.',
        vocabulary: [
          { term: 'me duele', translation: 'it hurts' },
          { term: 'el dolor de cabeza', translation: 'headache' },
          { term: 'la fiebre', translation: 'fever' },
          { term: 'la tos', translation: 'cough' },
          { term: 'la receta', translation: 'prescription' },
          { term: 'el dolor', translation: 'pain' },
          { term: 'sentirse mal', translation: 'to feel sick' },
          { term: 'la cita', translation: 'appointment' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Qué le pasa?' },
          { speaker: 'B', text: 'No me siento bien. Tengo dolor de cabeza y un poco de fiebre.' },
          { speaker: 'A', text: '¿Desde cuándo se siente así?' },
          { speaker: 'B', text: 'Desde ayer. Y también tengo tos.' },
          { speaker: 'A', text: 'De acuerdo. Le doy una receta. Descanse y beba agua.' },
        ],
        practicePhrases: [
          'Tengo cita a las cuatro.',
          'Me duele la garganta.',
          'Necesito ver a un médico.',
          '¿Cada cuánto debo tomarlo?',
        ],
      },
    ],
  },
}
