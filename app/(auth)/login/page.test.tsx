import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSupabaseMock } from '@/test/mocks/supabase'

const { mockPush, mockRefresh, mockReplace } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockReplace: vi.fn(),
}))

let supabase: ReturnType<typeof createSupabaseMock>

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: mockReplace,
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

import LoginPage from './page'

function fillForm(email: string, password: string) {
  return async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByLabelText(/email/i), email)
    await user.type(screen.getByLabelText(/contraseña/i), password)
  }
}

describe('<LoginPage />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock({
      user: { id: 'user-1', email: 'maria@example.com' },
    })
    mockPush.mockClear()
    mockRefresh.mockClear()
  })

  it('renders the form with both inputs and a submit button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /iniciar sesión/i })
    ).toBeInTheDocument()
  })

  it('shows a validation error when fields are empty', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/completa todos los campos/i)
    ).toBeInTheDocument()
    expect(supabase.spies.signInWithPassword).not.toHaveBeenCalled()
  })

  it('does not submit when the email format is invalid', async () => {
    // The input has type="email", so the browser's native validation
    // blocks submission before our JS regex check runs. Either way,
    // signInWithPassword must not be called.
    const user = userEvent.setup()
    render(<LoginPage />)
    await fillForm('not-an-email', 'whatever')(user)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(supabase.spies.signInWithPassword).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to /dashboard on successful sign-in', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)
    await fillForm('maria@example.com', 'correct-password')(user)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(supabase.spies.signInWithPassword).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'correct-password',
    })
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('shows a friendly error when credentials are wrong', async () => {
    supabase = createSupabaseMock({ signInError: 'Invalid login credentials' })
    const user = userEvent.setup()
    render(<LoginPage />)
    await fillForm('maria@example.com', 'wrong-password')(user)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    expect(
      await screen.findByText(/credenciales incorrectas/i)
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('links to the register page', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /crear una cuenta/i })
    expect(link).toHaveAttribute('href', '/register')
  })

  it('links to the forgot-password page', () => {
    render(<LoginPage />)
    const link = screen.getByRole('link', { name: /olvidaste tu contraseña/i })
    expect(link).toHaveAttribute('href', '/forgot-password')
  })
})
