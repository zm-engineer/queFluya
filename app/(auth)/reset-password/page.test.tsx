import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSupabaseMock } from '@/test/mocks/supabase'

const { mockPush, mockReplace, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockRefresh: vi.fn(),
}))

let supabase: ReturnType<typeof createSupabaseMock>

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

import ResetPasswordPage from './page'

describe('<ResetPasswordPage />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  it('renders two password fields and a submit button', () => {
    render(<ResetPasswordPage />)
    expect(screen.getByLabelText(/^contraseña nueva$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /guardar/i })
    ).toBeInTheDocument()
  })

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await user.type(screen.getByLabelText(/^contraseña nueva$/i), 'short')
    await user.type(screen.getByLabelText(/confirmar contraseña/i), 'short')

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(
      await screen.findByText(/debe tener al menos 8 caracteres/i)
    ).toBeInTheDocument()
    expect(supabase.spies.updateUser).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await user.type(
      screen.getByLabelText(/^contraseña nueva$/i),
      'longenough1'
    )
    await user.type(
      screen.getByLabelText(/confirmar contraseña/i),
      'different12'
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(await screen.findByText(/no coinciden/i)).toBeInTheDocument()
    expect(supabase.spies.updateUser).not.toHaveBeenCalled()
  })

  it('calls updateUser with the new password and redirects to /login on success', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await user.type(
      screen.getByLabelText(/^contraseña nueva$/i),
      'longenough1'
    )
    await user.type(
      screen.getByLabelText(/confirmar contraseña/i),
      'longenough1'
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(supabase.spies.updateUser).toHaveBeenCalledWith({
      password: 'longenough1',
    })
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('shows a friendly error when Supabase rejects the update', async () => {
    supabase = createSupabaseMock({
      updateUserError: 'Auth session missing',
    })
    const user = userEvent.setup()
    render(<ResetPasswordPage />)
    await user.type(
      screen.getByLabelText(/^contraseña nueva$/i),
      'longenough1'
    )
    await user.type(
      screen.getByLabelText(/confirmar contraseña/i),
      'longenough1'
    )

    await user.click(screen.getByRole('button', { name: /guardar/i }))

    expect(
      await screen.findByText(/no se pudo actualizar/i)
    ).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
