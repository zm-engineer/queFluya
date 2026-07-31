import { describe, expect, it } from 'vitest'
import { isSectionAccessible, isTandemUnlocked, sectionKind } from './topic-journey'
import type { TopicSection } from './topics'

const study = (phrases: string[] = ['a']): TopicSection => ({
  title: 'Estudio',
  intro: '',
  vocabulary: [{ term: 'x', translation: 'y' }],
  dialogue: [{ speaker: 'A', text: 'hi' }],
  practicePhrases: phrases,
})
const shadowing = (): TopicSection => ({
  title: 'Shadowing',
  intro: '',
  vocabulary: [],
  dialogue: [],
  practicePhrases: [],
  shadowing: true,
})
const recording = (): TopicSection => ({
  title: 'Grabación',
  intro: '',
  vocabulary: [],
  dialogue: [],
  practicePhrases: [],
  freeRecordingPrompt: 'habla',
})
const tandem = (): TopicSection => ({
  title: 'Conectar',
  intro: '',
  vocabulary: [],
  dialogue: [],
  practicePhrases: [],
  comingSoon: 'tandem',
})

describe('sectionKind', () => {
  it('classifies each section type', () => {
    expect(sectionKind(study())).toBe('study')
    expect(sectionKind(shadowing())).toBe('shadowing')
    expect(sectionKind(recording())).toBe('recording')
    expect(sectionKind(tandem())).toBe('tandem')
  })
})

describe('isTandemUnlocked', () => {
  const sections = [study(), shadowing(), recording(), tandem()]

  it('is locked until the phrase-practice section is completed', () => {
    expect(isTandemUnlocked(sections, new Set())).toBe(false)
    expect(isTandemUnlocked(sections, new Set([1, 2]))).toBe(false) // other sections, not practice
    expect(isTandemUnlocked(sections, new Set([0]))).toBe(true) // practice done
  })

  it('unlocks immediately when there is no phrase practice', () => {
    expect(isTandemUnlocked([study([]), tandem()], new Set())).toBe(true)
  })
})

describe('isSectionAccessible', () => {
  const sections = [study(), shadowing(), recording(), tandem()]

  it('allows any non-tandem section freely', () => {
    expect(isSectionAccessible(sections, 1, new Set())).toBe(true)
    expect(isSectionAccessible(sections, 2, new Set())).toBe(true)
  })

  it('gates the tandem section on practice completion', () => {
    expect(isSectionAccessible(sections, 3, new Set())).toBe(false)
    expect(isSectionAccessible(sections, 3, new Set([0]))).toBe(true)
  })
})
