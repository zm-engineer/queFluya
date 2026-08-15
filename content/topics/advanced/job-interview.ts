import type { TopicPair } from '../types'

// Advanced: job interview basics. The EN side is migrated from the legacy seed;
// the ES side (entrevista-de-trabajo) is newly authored here as its mirror —
// the legacy seed had no Spanish counterpart.
export const jobInterview: TopicPair = {
  pairKey: 'job-interview',
  level: 'ADVANCED',
  position: 40,

  en: {
    slug: 'job-interview-basics',
    title: 'Job Interview Basics',
    description:
      'Habla de tu experiencia, responde preguntas comunes y haz preguntas inteligentes, en inglés.',
    freeRecordingPrompt:
      "El entrevistador te dice: 'Tell me a bit about yourself.' Cuenta tu rol, años de experiencia, especialidad y un proyecto reciente.",
    studySections: [
      {
        title: 'Hablar de tu experiencia',
        intro:
          'En una entrevista te pedirán que cuentes tu trayectoria. Sé conciso y relevante.',
        vocabulary: [
          { term: "I've been working as...", translation: 'He estado trabajando como...' },
          { term: 'I led a team of...', translation: 'Lideré un equipo de...' },
          { term: "I'm responsible for...", translation: 'Soy responsable de...' },
          { term: 'I specialise in...', translation: 'Me especializo en...' },
        ],
        dialogue: [
          { speaker: 'Interviewer', text: 'Tell me a bit about yourself.' },
          {
            speaker: 'You',
            text: "Sure. I've been working as a backend engineer for five years, mostly with Node.js and Postgres. At my current company, I lead a team of three.",
          },
          { speaker: 'Interviewer', text: 'What kind of projects?' },
          {
            speaker: 'You',
            text: 'Mostly real-time systems — chat, notifications, that kind of thing.',
          },
        ],
        practicePhrases: [
          "I've been working as a [role] for [number] years.",
          'I specialise in [field].',
          "I'm currently responsible for [task].",
        ],
      },
    ],
  },

  es: {
    slug: 'entrevista-de-trabajo',
    title: 'Entrevista de trabajo',
    description:
      'Talk about your experience, answer common questions, and ask good ones in Spanish.',
    freeRecordingPrompt:
      "The interviewer says: 'Tell me a bit about yourself.' Talk about your role, years of experience, specialty, and a recent project.",
    studySections: [
      {
        title: 'Talking about your experience',
        intro:
          'Interviewers will ask you to walk them through your background. Keep it concise and relevant.',
        vocabulary: [
          { term: 'He trabajado como...', translation: "I've worked as..." },
          { term: 'Dirigí un equipo de...', translation: 'I led a team of...' },
          { term: 'Soy responsable de...', translation: "I'm responsible for..." },
          { term: 'Me especializo en...', translation: 'I specialise in...' },
        ],
        dialogue: [
          { speaker: 'Entrevistador', text: 'Cuéntame un poco sobre ti.' },
          {
            speaker: 'Tú',
            text: 'Claro. He trabajado como ingeniero de backend durante cinco años, sobre todo con Node.js y Postgres. En mi empresa actual dirijo un equipo de tres.',
          },
          { speaker: 'Entrevistador', text: '¿Qué tipo de proyectos?' },
          {
            speaker: 'Tú',
            text: 'Sobre todo sistemas en tiempo real: chat, notificaciones, ese tipo de cosas.',
          },
        ],
        practicePhrases: [
          'He trabajado como [puesto] durante [número] años.',
          'Me especializo en [campo].',
          'Ahora mismo soy responsable de [tarea].',
        ],
      },
    ],
  },
}
