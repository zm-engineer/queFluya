import { describe, expect, it } from 'vitest'
import { parseResponse } from './parse-response'

describe('parseResponse', () => {
  it('parses a well-formed JSON response', () => {
    const raw = JSON.stringify({
      corrected: 'Hi, my name is Ziuling and I am from Spain.',
      vocabUsed: ['Hi', 'My name is...'],
      vocabSuggested: ['Nice to meet you'],
      grammarTips: ['Add commas between clauses.'],
      fluency: 'Decent rhythm, a bit fast.',
    })

    const result = parseResponse(raw)

    expect(result).toEqual({
      corrected: 'Hi, my name is Ziuling and I am from Spain.',
      vocabUsed: ['Hi', 'My name is...'],
      vocabSuggested: ['Nice to meet you'],
      grammarTips: ['Add commas between clauses.'],
      fluency: 'Decent rhythm, a bit fast.',
    })
  })

  it('strips Markdown code fences if Claude wraps the JSON in them', () => {
    const raw = '```json\n{"corrected":"x","vocabUsed":[],"vocabSuggested":[],"grammarTips":[],"fluency":"ok"}\n```'
    const result = parseResponse(raw)
    expect(result?.corrected).toBe('x')
  })

  it('coerces missing arrays to empty arrays', () => {
    const raw = JSON.stringify({
      corrected: 'something',
      fluency: 'ok',
    })
    const result = parseResponse(raw)
    expect(result).toEqual({
      corrected: 'something',
      vocabUsed: [],
      vocabSuggested: [],
      grammarTips: [],
      fluency: 'ok',
    })
  })

  it('returns null when the input is not valid JSON', () => {
    expect(parseResponse('not json at all')).toBeNull()
  })

  it('returns null when required string fields are missing', () => {
    const raw = JSON.stringify({ vocabUsed: [], vocabSuggested: [] })
    expect(parseResponse(raw)).toBeNull()
  })

  it('filters non-string entries from the arrays', () => {
    const raw = JSON.stringify({
      corrected: 'x',
      vocabUsed: ['Hi', 42, null, 'Bye'],
      vocabSuggested: [],
      grammarTips: [],
      fluency: 'ok',
    })
    const result = parseResponse(raw)
    expect(result?.vocabUsed).toEqual(['Hi', 'Bye'])
  })
})
