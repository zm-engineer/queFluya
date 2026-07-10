import { describe, expect, it } from 'vitest'
import { buildPrompt } from './build-prompt'
import type { CorrectionContext } from './types'

const base: CorrectionContext = {
  topicTitle: 'Greetings and Introductions',
  topicDescription: 'Learn how to greet people and introduce yourself.',
  language: 'EN',
  vocabulary: [
    { term: 'Hi', translation: 'Hola (informal)' },
    { term: 'My name is...', translation: 'Me llamo...' },
  ],
  practicePhrases: ['Hi, how are you?', 'My name is [your name].'],
  freePrompt: 'Introduce yourself to a stranger in 30 seconds.',
  transcription: "Hi I'm Ziuling I'm from Spain",
}

describe('buildPrompt', () => {
  it('includes the topic title, description, and free prompt', () => {
    const prompt = buildPrompt(base)
    expect(prompt).toContain('Greetings and Introductions')
    expect(prompt).toContain('Learn how to greet people')
    expect(prompt).toContain('Introduce yourself to a stranger')
  })

  it('embeds every vocabulary term so the model can evaluate usage', () => {
    const prompt = buildPrompt(base)
    expect(prompt).toContain('Hi')
    expect(prompt).toContain('My name is...')
  })

  it('embeds every practice phrase for pattern reference', () => {
    const prompt = buildPrompt(base)
    expect(prompt).toContain('Hi, how are you?')
    expect(prompt).toContain('My name is [your name].')
  })

  it('embeds the verbatim transcription, distinct from the prompt', () => {
    const prompt = buildPrompt(base)
    expect(prompt).toContain("Hi I'm Ziuling I'm from Spain")
  })

  it('names the language so Claude evaluates against the right tongue', () => {
    expect(buildPrompt(base)).toMatch(/English/i)
    expect(buildPrompt({ ...base, language: 'ES' })).toMatch(/Spanish/i)
  })

  it('asks for JSON with the expected shape', () => {
    const prompt = buildPrompt(base)
    expect(prompt).toContain('corrected')
    expect(prompt).toContain('vocabUsed')
    expect(prompt).toContain('vocabSuggested')
    expect(prompt).toContain('grammarTips')
    expect(prompt).toContain('fluency')
  })
})
