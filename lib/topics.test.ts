import { describe, it, expect, vi } from 'vitest'
import { getTopicBySlug, getTopicsForUser } from './topics'

type AnySupabase = Parameters<typeof getTopicsForUser>[0]

function createListMock(rows: unknown[], error: { message: string } | null = null) {
  const order = vi.fn(async () => ({ data: rows, error }))
  const eq = vi.fn(() => ({ order }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return { client: { from } as unknown as AnySupabase, spies: { from, select, eq, order } }
}

describe('getTopicsForUser', () => {
  it('queries the topics table filtered by target language and ordered by position', async () => {
    const rows = [
      {
        slug: 'a',
        title: 'A',
        description: 'd-a',
        language: 'EN',
        level: 'BEGINNER',
        position: 1,
      },
      {
        slug: 'b',
        title: 'B',
        description: 'd-b',
        language: 'EN',
        level: 'INTERMEDIATE',
        position: 2,
      },
    ]
    const mock = createListMock(rows)

    const result = await getTopicsForUser(mock.client, { targetLanguage: 'EN' })

    expect(mock.spies.from).toHaveBeenCalledWith('topics')
    expect(mock.spies.eq).toHaveBeenCalledWith('language', 'EN')
    expect(mock.spies.order).toHaveBeenCalledWith('position', { ascending: true })
    expect(result).toEqual(rows)
  })

  it('returns an empty array when Supabase returns an error', async () => {
    const mock = createListMock([], { message: 'boom' })

    const result = await getTopicsForUser(mock.client, { targetLanguage: 'EN' })

    expect(result).toEqual([])
  })
})

function createDetailMock(
  row: unknown | null,
  error: { message: string } | null = null
) {
  const maybeSingle = vi.fn(async () => ({ data: row, error }))
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select }))
  return {
    client: { from } as unknown as AnySupabase,
    spies: { from, select, eq, maybeSingle },
  }
}

describe('getTopicBySlug', () => {
  it('returns the topic row when found', async () => {
    const row = {
      slug: 'greetings-and-introductions',
      title: 'Greetings',
      description: 'desc',
      language: 'EN',
      level: 'BEGINNER',
      position: 1,
      content: { sections: [] },
    }
    const mock = createDetailMock(row)

    const result = await getTopicBySlug(mock.client, row.slug)

    expect(mock.spies.from).toHaveBeenCalledWith('topics')
    expect(mock.spies.eq).toHaveBeenCalledWith('slug', row.slug)
    expect(result).toEqual(row)
  })

  it('returns null when the slug does not exist', async () => {
    const mock = createDetailMock(null)
    expect(await getTopicBySlug(mock.client, 'missing')).toBeNull()
  })

  it('returns null when Supabase returns an error', async () => {
    const mock = createDetailMock(null, { message: 'denied' })
    expect(await getTopicBySlug(mock.client, 'any')).toBeNull()
  })
})
