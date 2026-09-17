import type { TopicPair } from '../types'

// Intermediate: inviting, proposing and turning down plans — the language of a
// real social life.
export const makingPlans: TopicPair = {
  pairKey: 'making-plans',
  level: 'INTERMEDIATE',
  position: 23,

  en: {
    slug: 'making-plans',
    title: 'Making Plans',
    description: 'Invita, propón y organiza planes con la gente en inglés.',
    freeRecordingPrompt:
      'Invita a alguien a hacer algo el fin de semana: propón una actividad, un día y una hora.',
    studySections: [
      {
        title: 'Hacer planes',
        intro:
          'Proponer cosas que hacer, ponerse de acuerdo en una hora y decir que no con educación.',
        vocabulary: [
          { term: 'Are you free?', translation: '¿estás libre?' },
          { term: 'What are you up to?', translation: '¿qué haces?' },
          { term: 'to meet up', translation: 'quedar' },
          { term: 'How about…?', translation: '¿qué tal…?' },
          { term: 'Do you want to…?', translation: '¿quieres…?' },
          { term: 'it sounds good', translation: 'suena bien' },
          { term: "I'm in", translation: 'me apunto' },
          { term: "I can't make it", translation: 'no puedo ir' },
          { term: 'to cancel', translation: 'cancelar' },
          { term: 'to postpone', translation: 'aplazar' },
          { term: 'Where shall we meet?', translation: '¿dónde quedamos?' },
          { term: 'maybe / perhaps', translation: 'quizás' },
          { term: "let's…", translation: 'vamos a…' },
          { term: 'to be late / early', translation: 'llegar tarde / temprano' },
          { term: "it's on me", translation: 'invito yo' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Are you free this weekend?' },
          { speaker: 'B', text: 'I think so. What did you have in mind?' },
          { speaker: 'A', text: 'How about dinner on Saturday?' },
          { speaker: 'B', text: 'Sounds good! What time?' },
          { speaker: 'A', text: "Around eight. Let's meet at the restaurant." },
        ],
        practicePhrases: [
          'Do you want to come?',
          "I can't make it on Friday.",
          "Let's meet at seven.",
          'Maybe another day.',
        ],
      },
    ],
  },

  es: {
    slug: 'hacer-planes',
    title: 'Hacer planes',
    description: 'Invite, suggest and arrange plans with people in Spanish.',
    freeRecordingPrompt:
      'Invite someone to do something this weekend: suggest an activity, a day, and a time.',
    studySections: [
      {
        title: 'Making plans',
        intro:
          'Suggesting things to do, agreeing on a time, and saying no politely.',
        vocabulary: [
          { term: '¿estás libre?', translation: 'are you free?' },
          { term: '¿qué haces?', translation: 'what are you up to?' },
          { term: 'quedar', translation: 'to meet up' },
          { term: '¿qué tal…?', translation: 'how about…?' },
          { term: '¿quieres…?', translation: 'do you want to…?' },
          { term: 'suena bien', translation: 'it sounds good' },
          { term: 'me apunto', translation: "I'm in" },
          { term: 'no puedo ir', translation: "I can't make it" },
          { term: 'cancelar', translation: 'to cancel' },
          { term: 'aplazar', translation: 'to postpone' },
          { term: '¿dónde quedamos?', translation: 'where shall we meet?' },
          { term: 'quizás', translation: 'maybe / perhaps' },
          { term: 'vamos a…', translation: "let's…" },
          { term: 'llegar tarde / temprano', translation: 'to be late / early' },
          { term: 'invito yo', translation: "it's on me" },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Estás libre este fin de semana?' },
          { speaker: 'B', text: 'Creo que sí. ¿Qué tenías en mente?' },
          { speaker: 'A', text: '¿Qué tal cenar el sábado?' },
          { speaker: 'B', text: '¡Suena bien! ¿A qué hora?' },
          { speaker: 'A', text: 'Sobre las ocho. Quedamos en el restaurante.' },
        ],
        practicePhrases: [
          '¿Quieres venir?',
          'No puedo el viernes.',
          'Quedamos a las siete.',
          'Quizás otro día.',
        ],
      },
    ],
  },
}
