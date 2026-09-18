import { describe, expect, it } from 'vitest'
import {
  essentialBySlug,
  essentialsForLanguage,
  tenseBySlug,
  tensesForLanguage,
} from './essentials'

describe('essentialsForLanguage', () => {
  it('returns only sets for the given target language', () => {
    const en = essentialsForLanguage('EN')
    expect(en.length).toBeGreaterThan(0)
    expect(en.every((s) => s.language === 'EN')).toBe(true)

    const es = essentialsForLanguage('ES')
    expect(es.every((s) => s.language === 'ES')).toBe(true)
  })

  it('orders sets by kind (irregular-verbs before phrasal-verbs)', () => {
    const kinds = essentialsForLanguage('EN').map((s) => s.kind)
    expect(kinds.indexOf('irregular-verbs')).toBeLessThan(
      kinds.indexOf('phrasal-verbs')
    )
  })

  it('phrasal verbs only exist for English learners', () => {
    expect(essentialsForLanguage('EN').some((s) => s.kind === 'phrasal-verbs')).toBe(true)
    expect(essentialsForLanguage('ES').some((s) => s.kind === 'phrasal-verbs')).toBe(false)
  })

  it('gives real, non-empty items for the built sets', () => {
    const irregular = essentialsForLanguage('EN').find((s) => s.kind === 'irregular-verbs')
    expect(irregular?.items.length).toBeGreaterThan(10)
    expect(irregular?.items[0]).toHaveProperty('term')
    expect(irregular?.items[0]).toHaveProperty('translation')
  })

  it('every item has a valid level, spanning all three', () => {
    const valid = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
    for (const lang of ['EN', 'ES'] as const) {
      for (const set of essentialsForLanguage(lang)) {
        expect(set.items.every((i) => valid.includes(i.level))).toBe(true)
        const levels = new Set(set.items.map((i) => i.level))
        expect(levels.size).toBe(3)
      }
    }
  })
})

describe('essentialBySlug', () => {
  it('finds a set by slug', () => {
    expect(essentialBySlug('irregular-verbs-en')?.kind).toBe('irregular-verbs')
  })

  it('returns undefined for an unknown slug', () => {
    expect(essentialBySlug('nope')).toBeUndefined()
  })
})

describe('tensesForLanguage', () => {
  it('returns only tenses for the given target language', () => {
    expect(tensesForLanguage('EN').every((t) => t.language === 'EN')).toBe(true)
    expect(tensesForLanguage('ES').every((t) => t.language === 'ES')).toBe(true)
    expect(tensesForLanguage('EN').length).toBeGreaterThan(0)
  })

  it('every tense has when, structure and examples', () => {
    for (const tense of tensesForLanguage('EN')) {
      expect(tense.when).toBeTruthy()
      expect(tense.structure).toBeTruthy()
      expect(tense.examples.length).toBeGreaterThan(0)
    }
  })
})

describe('tenseBySlug', () => {
  it('finds a tense by slug', () => {
    expect(tenseBySlug('present-simple-en')?.name).toBe('Present Simple')
  })

  it('returns undefined for an unknown slug', () => {
    expect(tenseBySlug('nope')).toBeUndefined()
  })
})
