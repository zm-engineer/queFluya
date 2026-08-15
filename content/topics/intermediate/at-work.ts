import type { TopicPair } from '../types'

// Intermediate: everyday office/work talk — meetings, deadlines, asking for help.
export const atWork: TopicPair = {
  pairKey: 'at-work',
  level: 'INTERMEDIATE',
  position: 21,

  en: {
    slug: 'at-work',
    title: 'At Work',
    description: 'Habla de tu trabajo, reuniones y plazos en inglés.',
    freeRecordingPrompt:
      'Habla de tu trabajo: qué haces, con quién trabajas y qué tienes pendiente esta semana.',
    studySections: [
      {
        title: 'En el trabajo',
        intro:
          'Cómo hablar de tu jornada: pedir ayuda, organizar horarios y gestionar plazos.',
        vocabulary: [
          { term: 'meeting', translation: 'reunión' },
          { term: 'deadline', translation: 'fecha límite / plazo' },
          { term: 'email', translation: 'correo' },
          { term: 'colleague / coworker', translation: 'compañero de trabajo' },
          { term: 'boss / manager', translation: 'jefe / jefa' },
          { term: 'to be busy', translation: 'estar ocupado' },
          { term: 'task / project', translation: 'tarea / proyecto' },
          { term: 'day off', translation: 'día libre' },
        ],
        dialogue: [
          { speaker: 'A', text: 'Do you have a minute? I need help with the report.' },
          { speaker: 'B', text: "Sure, but I'm a bit busy. Can we talk after the meeting?" },
          { speaker: 'A', text: "No problem. When's the deadline?" },
          { speaker: 'B', text: "Friday. Let's meet at 3 and finish it together." },
        ],
        practicePhrases: [
          'I have a meeting at ten.',
          'Can you send me the email?',
          "I'm working on it.",
          "I'll take a day off tomorrow.",
        ],
      },
    ],
  },

  es: {
    slug: 'en-el-trabajo',
    title: 'En el trabajo',
    description: 'Talk about your job, meetings and deadlines in Spanish.',
    freeRecordingPrompt:
      'Talk about your job: what you do, who you work with, and what you have to finish this week.',
    studySections: [
      {
        title: 'At work',
        intro:
          'How to talk about your work day: asking for help, scheduling, and handling deadlines.',
        vocabulary: [
          { term: 'la reunión', translation: 'meeting' },
          { term: 'la fecha límite / el plazo', translation: 'deadline' },
          { term: 'el correo', translation: 'email' },
          { term: 'el compañero de trabajo', translation: 'colleague / coworker' },
          { term: 'el jefe / la jefa', translation: 'boss / manager' },
          { term: 'estar ocupado/a', translation: 'to be busy' },
          { term: 'la tarea / el proyecto', translation: 'task / project' },
          { term: 'el día libre', translation: 'day off' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Tienes un minuto? Necesito ayuda con el informe.' },
          { speaker: 'B', text: 'Claro, pero estoy un poco ocupado. ¿Hablamos después de la reunión?' },
          { speaker: 'A', text: 'Sin problema. ¿Cuándo es la fecha límite?' },
          { speaker: 'B', text: 'El viernes. Quedamos a las 3 y lo terminamos juntos.' },
        ],
        practicePhrases: [
          'Tengo una reunión a las diez.',
          '¿Me puedes enviar el correo?',
          'Estoy en ello.',
          'Mañana me tomo un día libre.',
        ],
      },
    ],
  },
}
