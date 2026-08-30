import { describe, expect, it } from 'vitest'
import { targetFor, validateUsername } from './profile'

describe('validateUsername', () => {
  it('accepts a valid username', () => {
    expect(validateUsername('maria_g')).toBeNull()
    expect(validateUsername('abc')).toBeNull()
    expect(validateUsername('User_123')).toBeNull()
  })

  it('trims before measuring length', () => {
    expect(validateUsername('  ab  ')).toBe('short')
    expect(validateUsername('  abc  ')).toBeNull()
  })

  it('rejects names shorter than 3 characters', () => {
    expect(validateUsername('ab')).toBe('short')
    expect(validateUsername('')).toBe('short')
  })

  it('rejects disallowed characters', () => {
    expect(validateUsername('maria g')).toBe('chars')
    expect(validateUsername('maría')).toBe('chars')
    expect(validateUsername('a-b-c')).toBe('chars')
    expect(validateUsername('hey!')).toBe('chars')
  })
})

describe('targetFor', () => {
  it('is the opposite language', () => {
    expect(targetFor('EN')).toBe('ES')
    expect(targetFor('ES')).toBe('EN')
  })
})
