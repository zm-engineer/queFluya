import { describe, it, expect } from 'vitest'
import { comparePhrase } from './diff'

describe('comparePhrase', () => {
  it('returns all words as match for an exact transcription', () => {
    const result = comparePhrase('Hello world', 'Hello world')

    expect(result.words).toEqual([
      { text: 'Hello', state: 'match' },
      { text: 'world', state: 'match' },
    ])
    expect(result.matchCount).toBe(2)
    expect(result.totalExpected).toBe(2)
    expect(result.score).toBe(100)
  })

  it('ignores case differences', () => {
    const result = comparePhrase('Hello World', 'hello WORLD')
    expect(result.words.every((w) => w.state === 'match')).toBe(true)
    expect(result.score).toBe(100)
  })

  it('strips punctuation when comparing', () => {
    const result = comparePhrase("Hi, how are you?", 'hi how are you')
    expect(result.words.map((w) => w.state)).toEqual([
      'match',
      'match',
      'match',
      'match',
    ])
    expect(result.score).toBe(100)
  })

  it('flags a substituted word as mistake', () => {
    const result = comparePhrase('Good morning', 'Good evening')
    expect(result.words).toEqual([
      { text: 'Good', state: 'match' },
      { text: 'morning', state: 'mistake' },
    ])
    expect(result.matchCount).toBe(1)
    expect(result.score).toBe(50)
  })

  it('flags an extra spoken word after the expected sequence', () => {
    const result = comparePhrase('Hello world', 'Hello world today')
    expect(result.words).toEqual([
      { text: 'Hello', state: 'match' },
      { text: 'world', state: 'match' },
      { text: 'today', state: 'extra' },
    ])
    expect(result.matchCount).toBe(2)
    expect(result.totalExpected).toBe(2)
    expect(result.score).toBe(100)
  })

  it('flags a missing expected word', () => {
    const result = comparePhrase('I am happy', 'I happy')
    expect(result.words).toEqual([
      { text: 'I', state: 'match' },
      { text: 'am', state: 'missing' },
      { text: 'happy', state: 'match' },
    ])
    expect(result.matchCount).toBe(2)
    expect(result.totalExpected).toBe(3)
    expect(result.score).toBe(67)
  })

  it('returns all-missing for empty actual', () => {
    const result = comparePhrase('Hello world', '')
    expect(result.words).toEqual([
      { text: 'Hello', state: 'missing' },
      { text: 'world', state: 'missing' },
    ])
    expect(result.score).toBe(0)
  })

  it('returns all-extra for empty expected', () => {
    const result = comparePhrase('', 'Hi there')
    expect(result.words).toEqual([
      { text: 'Hi', state: 'extra' },
      { text: 'there', state: 'extra' },
    ])
    expect(result.totalExpected).toBe(0)
    expect(result.score).toBe(0)
  })

  it('returns empty result when both are empty', () => {
    const result = comparePhrase('', '')
    expect(result.words).toEqual([])
    expect(result.score).toBe(0)
  })

  it('treats [bracketed] placeholders as wildcards that match any single word', () => {
    const result = comparePhrase(
      'Hi, my name is [your name].',
      'Hi my name is Ziuling'
    )
    // Five expected tokens (Hi, my, name, is, [your name].), all should match.
    expect(result.matchCount).toBe(5)
    expect(result.totalExpected).toBe(5)
    expect(result.score).toBe(100)
    // The placeholder retains its original display text.
    const placeholder = result.words.find((w) => w.text.includes('['))
    expect(placeholder?.state).toBe('match')
  })

  it('marks an unfilled placeholder as missing when the user skips the slot', () => {
    const result = comparePhrase(
      'Hi, my name is [your name].',
      'Hi my name is'
    )
    const placeholder = result.words.find((w) => w.text.includes('['))
    expect(placeholder?.state).toBe('missing')
    expect(result.matchCount).toBe(4)
    expect(result.totalExpected).toBe(5)
  })

  it('handles multiple placeholders in one phrase', () => {
    const result = comparePhrase(
      "I'll have the [dish] with [drink].",
      "I'll have the pizza with water"
    )
    expect(result.score).toBe(100)
    expect(result.matchCount).toBe(6)
  })
})
