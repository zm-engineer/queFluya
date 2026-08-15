import type { TopicPair } from '../types'

// Intermediate: talking about the weather — everyday small talk everywhere.
export const theWeather: TopicPair = {
  pairKey: 'the-weather',
  level: 'INTERMEDIATE',
  position: 26,

  en: {
    slug: 'the-weather',
    title: 'The Weather',
    description: 'Habla del tiempo y del pronóstico en inglés.',
    freeRecordingPrompt:
      'Describe el tiempo que hace hoy y el que crees que hará mañana. Di qué ropa te vas a poner.',
    studySections: [
      {
        title: 'El tiempo',
        intro:
          'La conversación más común que existe: describe el día de hoy y lee un pronóstico.',
        vocabulary: [
          { term: "it's sunny", translation: 'hace sol' },
          { term: "it's raining", translation: 'está lloviendo' },
          { term: "it's cold / hot", translation: 'hace frío / calor' },
          { term: 'cloudy', translation: 'nublado' },
          { term: 'windy', translation: 'hace viento' },
          { term: 'forecast', translation: 'pronóstico' },
          { term: 'to snow', translation: 'nevar' },
          { term: 'umbrella', translation: 'paraguas' },
        ],
        dialogue: [
          { speaker: 'A', text: "What's the weather like today?" },
          { speaker: 'B', text: "It's cloudy and a bit cold. Take a jacket." },
          { speaker: 'A', text: 'Is it going to rain?' },
          { speaker: 'B', text: 'The forecast says yes, this afternoon. Bring an umbrella.' },
          { speaker: 'A', text: "Okay, thanks. I hope it's sunny tomorrow." },
        ],
        practicePhrases: [
          "What's the weather like?",
          "It's really hot today.",
          'Do I need an umbrella?',
          "It's going to rain.",
        ],
      },
    ],
  },

  es: {
    slug: 'el-tiempo',
    title: 'El tiempo',
    description: 'Talk about the weather and the forecast in Spanish.',
    freeRecordingPrompt:
      "Describe today's weather and what you think it'll be like tomorrow. Say what you're going to wear.",
    studySections: [
      {
        title: 'The weather',
        intro:
          'The most common small talk there is — describe today and read a forecast.',
        vocabulary: [
          { term: 'hace sol', translation: "it's sunny" },
          { term: 'está lloviendo', translation: "it's raining" },
          { term: 'hace frío / calor', translation: "it's cold / hot" },
          { term: 'nublado', translation: 'cloudy' },
          { term: 'hace viento', translation: 'windy' },
          { term: 'el pronóstico', translation: 'forecast' },
          { term: 'nevar', translation: 'to snow' },
          { term: 'el paraguas', translation: 'umbrella' },
        ],
        dialogue: [
          { speaker: 'A', text: '¿Qué tiempo hace hoy?' },
          { speaker: 'B', text: 'Está nublado y hace un poco de frío. Coge una chaqueta.' },
          { speaker: 'A', text: '¿Va a llover?' },
          { speaker: 'B', text: 'El pronóstico dice que sí, esta tarde. Lleva un paraguas.' },
          { speaker: 'A', text: 'Vale, gracias. Espero que mañana haga sol.' },
        ],
        practicePhrases: [
          '¿Qué tiempo hace?',
          'Hoy hace mucho calor.',
          '¿Necesito paraguas?',
          'Va a llover.',
        ],
      },
    ],
  },
}
