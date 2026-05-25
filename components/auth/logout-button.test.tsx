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

import { LogoutButton } from './logout-button'

describe('<LogoutButton />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock()
    mockReplace.mockClear()
    mockRefresh.mockClear()
    mockPush.mockClear()
  })

  it('renders the spanish logout label', () => {
    render(<LogoutButton />)
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i })
    ).toBeInTheDocument()
  })

  it('signs the user out and redirects to /login on click', async () => {
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(supabase.spies.signOut).toHaveBeenCalledTimes(1)
    expect(mockReplace).toHaveBeenCalledWith('/login')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('redirects after signOut resolves, not before', async () => {
    const user = userEvent.setup()
    render(<LogoutButton />)

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    const signOutOrder = supabase.spies.signOut.mock.invocationCallOrder[0]
    const replaceOrder = mockReplace.mock.invocationCallOrder[0]
    expect(signOutOrder).toBeLessThan(replaceOrder)
  })
})
