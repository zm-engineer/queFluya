import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSupabaseMock } from '@/test/mocks/supabase'

let supabase: ReturnType<typeof createSupabaseMock>

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}))

import ForgotPasswordPage from './page'

describe('<ForgotPasswordPage />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock()
  })

  it('renders an email input and a submit button', () => {
    render(<ForgotPasswordPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviar enlace/i })
    ).toBeInTheDocument()
  })

  it('shows a validation error when email is empty', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)

    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(
      await screen.findByText(/introduce tu email/i)
    ).toBeInTheDocument()
    expect(supabase.spies.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('calls resetPasswordForEmail with the email and redirectTo pointing at /reset-password', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')

    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(supabase.spies.resetPasswordForEmail).toHaveBeenCalledTimes(1)
    expect(supabase.spies.resetPasswordForEmail).toHaveBeenCalledWith(
      'maria@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/reset-password'),
      })
    )
  })

  it('replaces the form with a confirmation message on success', async () => {
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')

    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(await screen.findByText(/revisa tu email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument()
  })

  it('shows an error when Supabase returns an error', async () => {
    supabase = createSupabaseMock({
      resetPasswordError: 'For security reasons...',
    })
    const user = userEvent.setup()
    render(<ForgotPasswordPage />)
    await user.type(screen.getByLabelText(/email/i), 'maria@example.com')

    await user.click(screen.getByRole('button', { name: /enviar enlace/i }))

    expect(
      await screen.findByText(/no se pudo enviar el enlace/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/revisa tu email/i)).not.toBeInTheDocument()
  })
})
