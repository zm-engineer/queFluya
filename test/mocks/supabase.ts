import { vi } from 'vitest'

type AuthResult<T = unknown> = { data: T; error: { message: string } | null }

type ProfileRow = {
  id: string
  user_id: string
  username: string
  native_language: 'EN' | 'ES'
  target_language: 'EN' | 'ES'
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

type MockUser = { id: string; email?: string }

export type SupabaseMockOptions = {
  user?: MockUser | null
  profile?: Partial<ProfileRow> | null
  signInError?: string
  signUpError?: string
  resetPasswordError?: string
  updateUserError?: string
  insertError?: { message: string; code?: string }
}

export function createSupabaseMock(opts: SupabaseMockOptions = {}) {
  const user = opts.user ?? null
  const profile = opts.profile ?? null

  const signInWithPassword = vi.fn(
    async (): Promise<AuthResult<{ user: MockUser | null }>> => ({
      data: { user },
      error: opts.signInError ? { message: opts.signInError } : null,
    })
  )

  const signUp = vi.fn(
    async (): Promise<AuthResult<{ user: MockUser | null }>> => ({
      data: { user },
      error: opts.signUpError ? { message: opts.signUpError } : null,
    })
  )

  const signOut = vi.fn(async () => ({ error: null }))

  const resetPasswordForEmail = vi.fn(async () => ({
    data: {},
    error: opts.resetPasswordError
      ? { message: opts.resetPasswordError }
      : null,
  }))

  const updateUser = vi.fn(
    async (): Promise<AuthResult<{ user: MockUser | null }>> => ({
      data: { user },
      error: opts.updateUserError ? { message: opts.updateUserError } : null,
    })
  )

  const getUser = vi.fn(async (): Promise<AuthResult<{ user: MockUser | null }>> => ({
    data: { user },
    error: null,
  }))

  const maybeSingle = vi.fn(async () => ({ data: profile, error: null }))
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq, maybeSingle }))
  const insert = vi.fn(async () => ({
    data: null,
    error: opts.insertError ?? null,
  }))

  const from = vi.fn(() => ({ select, insert, eq, maybeSingle }))

  const client = {
    auth: {
      signInWithPassword,
      signUp,
      signOut,
      getUser,
      resetPasswordForEmail,
      updateUser,
    },
    from,
  }

  return {
    client,
    spies: {
      signInWithPassword,
      signUp,
      signOut,
      getUser,
      resetPasswordForEmail,
      updateUser,
      from,
      select,
      insert,
      eq,
      maybeSingle,
    },
  }
}

export type SupabaseMock = ReturnType<typeof createSupabaseMock>
