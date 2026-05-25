import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSupabaseMock } from '@/test/mocks/supabase'

const { mockReplace, mockRefresh, mockPush } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockRefresh: vi.fn(),
  mockPush: vi.fn(),
}))

let supabase: ReturnType<typeof createSupabaseMock>

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
    push: mockPush,
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

import OnboardingPage from './page'

async function completeStepOne(
  user: ReturnType<typeof userEvent.setup>,
  username: string
) {
  const input = await screen.findByPlaceholderText(/maria_g/i)
  await user.type(input, username)
  await user.click(screen.getByRole('button', { name: /continuar/i }))
}

describe('<OnboardingPage />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock({ user: { id: 'user-1' }, profile: null })
    mockReplace.mockClear()
    mockRefresh.mockClear()
    mockPush.mockClear()
  })

  it('redirects to /login when there is no session', async () => {
    supabase = createSupabaseMock({ user: null })
    render(<OnboardingPage />)

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login')
    })
  })

  it('redirects to /dashboard if a profile already exists', async () => {
    supabase = createSupabaseMock({
      user: { id: 'user-1' },
      profile: { id: 'p1' },
    })
    render(<OnboardingPage />)

    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('rejects usernames shorter than 3 characters', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)
    const input = await screen.findByPlaceholderText(/maria_g/i)
    await user.type(input, 'ab')

    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByText(/al menos 3 caracteres/i)).toBeInTheDocument()
    expect(supabase.spies.insert).not.toHaveBeenCalled()
  })

  it('rejects usernames with invalid characters', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)
    const input = await screen.findByPlaceholderText(/maria_g/i)
    await user.type(input, 'maría g')

    await user.click(screen.getByRole('button', { name: /continuar/i }))

    expect(
      await screen.findByText(/letras, números y guion bajo/i)
    ).toBeInTheDocument()
  })

  it('walks through all 3 steps and inserts the profile with computed target language', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await completeStepOne(user, 'maria_g')
    await user.click(await screen.findByRole('button', { name: /english/i }))
    await user.click(
      await screen.findByRole('button', { name: /intermedio/i })
    )

    await vi.waitFor(() => {
      expect(supabase.spies.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        username: 'maria_g',
        native_language: 'EN',
        target_language: 'ES',
        level: 'INTERMEDIATE',
      })
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('flips target language when native is ES', async () => {
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await completeStepOne(user, 'maria_g')
    await user.click(await screen.findByRole('button', { name: /español/i }))
    await user.click(
      await screen.findByRole('button', { name: /principiante/i })
    )

    await vi.waitFor(() => {
      expect(supabase.spies.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          native_language: 'ES',
          target_language: 'EN',
          level: 'BEGINNER',
        })
      )
    })
  })

  it('surfaces a friendly error when the username is already taken', async () => {
    supabase = createSupabaseMock({
      user: { id: 'user-1' },
      profile: null,
      insertError: { message: 'duplicate key', code: '23505' },
    })
    const user = userEvent.setup()
    render(<OnboardingPage />)

    await completeStepOne(user, 'maria_g')
    await user.click(await screen.findByRole('button', { name: /english/i }))
    await user.click(
      await screen.findByRole('button', { name: /avanzado/i })
    )

    expect(await screen.findByText(/ya está en uso/i)).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalledWith('/dashboard')
  })
})
