import type { TopicPair } from '../types'

// Beginner: parts of the body — essential for the doctor and describing how you
// feel.
export const bodyParts: TopicPair = {
  pairKey: 'body-parts',
  level: 'BEGINNER',
  position: 11,

  en: {
    slug: 'body-parts',
    title: 'Parts of the Body',
    description:
      'Aprende las partes del cuerpo en inglés, útiles en el médico y el día a día.',
    freeRecordingPrompt:
      'Di si te duele algo o cómo te sientes hoy, usando alguna parte del cuerpo.',
    studySections: [
      {
        title: 'El cuerpo',
        intro:
          'Las partes del cuerpo más comunes en inglés. Útiles para decir cómo te sientes o en el médico.',
        vocabulary: [
          { term: 'head', translation: 'cabeza' },
          { term: 'hair', translation: 'pelo' },
          { term: 'face', translation: 'cara' },
          { term: 'eye', translation: 'ojo' },
          { term: 'ear', translation: 'oreja' },
          { term: 'nose', translation: 'nariz' },
          { term: 'mouth', translation: 'boca' },
          { term: 'tooth', translation: 'diente' },
          { term: 'neck', translation: 'cuello' },
          { term: 'shoulder', translation: 'hombro' },
          { term: 'arm', translation: 'brazo' },
          { term: 'hand', translation: 'mano' },
          { term: 'finger', translation: 'dedo' },
          { term: 'leg', translation: 'pierna' },
          { term: 'foot', translation: 'pie' },
        ],
        dialogue: [
          { speaker: 'A', text: "What's wrong?" },
          { speaker: 'B', text: 'My head hurts.' },
          { speaker: 'A', text: 'You should rest.' },
        ],
        practicePhrases: [
          'My head hurts.',
          'I have two hands.',
          'Touch your nose.',
        ],
      },
    ],
  },

  es: {
    slug: 'el-cuerpo',
    title: 'El cuerpo',
    description:
      'Learn the parts of the body in Spanish — useful at the doctor and day to day.',
    freeRecordingPrompt:
      'Say if something hurts or how you feel today, using a part of the body.',
    studySections: [
      {
        title: 'The body',
        intro:
          'The most common parts of the body in Spanish. Handy for saying how you feel or at the doctor.',
        vocabulary: [
          { term: 'la cabeza', translation: 'head' },
          { term: 'el pelo', translation: 'hair' },
          { term: 'la cara', translation: 'face' },
          { term: 'el ojo', translation: 'eye' },
          { term: 'la oreja', translation: 'ear' },
          { term: 'la nariz', translation: 'nose' },
          { term: 'la boca', translation: 'mouth' },
          { term: 'el diente', translation: 'tooth' },
          { term: 'el cuello', translation: 'neck' },
          { term: 'el hombro', translation: 'shoulder' },
          { term: 'el brazo', translation: 'arm' },
          { term: 'la mano', translation: 'hand' },
          { term: 'el dedo', translation: 'finger' },
          { term: 'la pierna', translation: 'leg' },
          { term: 'el pie', translation: 'foot' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Qué te pasa?' },
          { speaker: 'B', text: 'Me duele la cabeza.' },
          { speaker: 'A', text: 'Deberías descansar.' },
        ],
        practicePhrases: [
          'Me duele la cabeza.',
          'Tengo dos manos.',
          'Tócate la nariz.',
        ],
      },
    ],
  },
}
