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
          { term: 'face', translation: 'cara', image: '/vocab/1F642.svg' },
          { term: 'eye', translation: 'ojo', image: '/vocab/1F441.svg' },
          { term: 'ear', translation: 'oreja', image: '/vocab/1F442.svg' },
          { term: 'nose', translation: 'nariz', image: '/vocab/1F443.svg' },
          { term: 'mouth', translation: 'boca', image: '/vocab/1F444.svg' },
          { term: 'tooth', translation: 'diente', image: '/vocab/1F9B7.svg' },
          { term: 'neck', translation: 'cuello' },
          { term: 'shoulder', translation: 'hombro' },
          { term: 'arm', translation: 'brazo', image: '/vocab/1F4AA.svg' },
          { term: 'hand', translation: 'mano', image: '/vocab/270B.svg' },
          { term: 'finger', translation: 'dedo', image: '/vocab/1F446.svg' },
          { term: 'leg', translation: 'pierna', image: '/vocab/1F9B5.svg' },
          { term: 'foot', translation: 'pie', image: '/vocab/1F9B6.svg' },
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
          { term: 'la cara', translation: 'face', image: '/vocab/1F642.svg' },
          { term: 'el ojo', translation: 'eye', image: '/vocab/1F441.svg' },
          { term: 'la oreja', translation: 'ear', image: '/vocab/1F442.svg' },
          { term: 'la nariz', translation: 'nose', image: '/vocab/1F443.svg' },
          { term: 'la boca', translation: 'mouth', image: '/vocab/1F444.svg' },
          { term: 'el diente', translation: 'tooth', image: '/vocab/1F9B7.svg' },
          { term: 'el cuello', translation: 'neck' },
          { term: 'el hombro', translation: 'shoulder' },
          { term: 'el brazo', translation: 'arm', image: '/vocab/1F4AA.svg' },
          { term: 'la mano', translation: 'hand', image: '/vocab/270B.svg' },
          { term: 'el dedo', translation: 'finger', image: '/vocab/1F446.svg' },
          { term: 'la pierna', translation: 'leg', image: '/vocab/1F9B5.svg' },
          { term: 'el pie', translation: 'foot', image: '/vocab/1F9B6.svg' },
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
