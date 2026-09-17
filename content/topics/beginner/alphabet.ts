import type { TopicPair } from '../types'

// Beginner: the alphabet. The `term` is the letter (read aloud by TTS in the
// topic language, so you hear its real name); the `translation` is a spelled-out
// pronunciation hint in the learner's native language. Spelling out loud is a
// foundational skill for names, emails and addresses.
export const alphabet: TopicPair = {
  pairKey: 'alphabet',
  level: 'BEGINNER',
  position: 3,

  en: {
    slug: 'alphabet',
    title: 'The Alphabet',
    description: 'Aprende a decir y deletrear con el alfabeto en inglés.',
    freeRecordingPrompt:
      'Deletrea tu nombre y el de tu ciudad en inglés, letra por letra.',
    studySections: [
      {
        title: 'El alfabeto en inglés',
        intro:
          'Cómo se llaman las letras en inglés. Toca 🔊 para oír cada una; la pista entre paréntesis es solo una aproximación de cómo suena.',
        vocabulary: [
          { term: 'A', translation: 'ei' },
          { term: 'B', translation: 'bi' },
          { term: 'C', translation: 'si' },
          { term: 'D', translation: 'di' },
          { term: 'E', translation: 'i' },
          { term: 'F', translation: 'ef' },
          { term: 'G', translation: 'yi' },
          { term: 'H', translation: 'eich' },
          { term: 'I', translation: 'ai' },
          { term: 'J', translation: 'yei' },
          { term: 'K', translation: 'kei' },
          { term: 'L', translation: 'el' },
          { term: 'M', translation: 'em' },
          { term: 'N', translation: 'en' },
          { term: 'O', translation: 'ou' },
          { term: 'P', translation: 'pi' },
          { term: 'Q', translation: 'kiu' },
          { term: 'R', translation: 'ar' },
          { term: 'S', translation: 'es' },
          { term: 'T', translation: 'ti' },
          { term: 'U', translation: 'iu' },
          { term: 'V', translation: 'vi' },
          { term: 'W', translation: 'dábliu' },
          { term: 'X', translation: 'eks' },
          { term: 'Y', translation: 'uái' },
          { term: 'Z', translation: 'zi' },
        ],
        dialogue: [
          { speaker: 'A', text: 'How do you spell your name?' },
          { speaker: 'B', text: "It's Anna, with two n's." },
          { speaker: 'A', text: 'Got it, thanks.' },
        ],
        practicePhrases: [
          'How do you spell your name?',
          'Can you spell that, please?',
          'It starts with a B.',
        ],
      },
    ],
  },

  es: {
    slug: 'el-abecedario',
    title: 'El abecedario',
    description: 'Learn to say and spell using the Spanish alphabet.',
    freeRecordingPrompt:
      'Spell your name and your city in Spanish, letter by letter.',
    studySections: [
      {
        title: 'The Spanish alphabet',
        intro:
          'What the letters are called in Spanish. Tap 🔊 to hear each one; the hint in brackets is only a rough guide to how it sounds.',
        vocabulary: [
          { term: 'A', translation: 'ah' },
          { term: 'B', translation: 'beh' },
          { term: 'C', translation: 'seh' },
          { term: 'D', translation: 'deh' },
          { term: 'E', translation: 'eh' },
          { term: 'F', translation: 'EH-feh' },
          { term: 'G', translation: 'heh' },
          { term: 'H', translation: 'AH-cheh (silent)' },
          { term: 'I', translation: 'ee' },
          { term: 'J', translation: 'HOH-tah' },
          { term: 'K', translation: 'kah' },
          { term: 'L', translation: 'EH-leh' },
          { term: 'M', translation: 'EH-meh' },
          { term: 'N', translation: 'EH-neh' },
          { term: 'Ñ', translation: 'EH-nyeh' },
          { term: 'O', translation: 'oh' },
          { term: 'P', translation: 'peh' },
          { term: 'Q', translation: 'koo' },
          { term: 'R', translation: 'EH-reh' },
          { term: 'S', translation: 'EH-seh' },
          { term: 'T', translation: 'teh' },
          { term: 'U', translation: 'oo' },
          { term: 'V', translation: 'OO-veh' },
          { term: 'W', translation: 'OO-veh DOH-bleh' },
          { term: 'X', translation: 'EH-kees' },
          { term: 'Y', translation: 'yeh' },
          { term: 'Z', translation: 'SEH-tah' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Cómo se escribe tu nombre?' },
          { speaker: 'B', text: 'Es Ana, con una sola ene.' },
          { speaker: 'A', text: 'Perfecto, gracias.' },
        ],
        practicePhrases: [
          '¿Cómo se escribe tu nombre?',
          '¿Puedes deletrearlo, por favor?',
          'Empieza con be.',
        ],
      },
    ],
  },
}
