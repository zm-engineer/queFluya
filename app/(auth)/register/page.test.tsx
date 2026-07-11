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

import RegisterPage from './page'

type FillOptions = {
  name?: string
  email?: string
  password?: string
  confirm?: string
}

async function fill(
  user: ReturnType<typeof userEvent.setup>,
  { name, email, password, confirm }: FillOptions
) {
  if (name !== undefined) {
    await user.type(screen.getByLabelText(/nombre completo/i), name)
  }
  if (email !== undefined) {
    await user.type(screen.getByLabelText(/^email$/i), email)
  }
  if (password !== undefined) {
    await user.type(screen.getByLabelText(/^contraseña$/i), password)
  }
  if (confirm !== undefined) {
    await user.type(screen.getByLabelText(/confirmar contraseña/i), confirm)
  }
}

describe('<RegisterPage />', () => {
  beforeEach(() => {
    supabase = createSupabaseMock({
      user: { id: 'new-user', email: 'maria@example.com' },
    })
    mockPush.mockClear()
  })

  it('renders all four fields and a submit button', () => {
    render(<RegisterPage />)
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /crear cuenta/i })
    ).toBeInTheDocument()
  })

  it('blocks submit and shows an error when fields are empty', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/completa todos los campos/i)
    ).toBeInTheDocument()
    expect(supabase.spies.signUp).not.toHaveBeenCalled()
  })

  it('rejects passwords shorter than 8 characters', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await fill(user, {
      name: 'María García',
      email: 'maria@example.com',
      password: 'short',
      confirm: 'short',
    })

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/al menos 8 caracteres/i)
    ).toBeInTheDocument()
    expect(supabase.spies.signUp).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await fill(user, {
      name: 'María García',
      email: 'maria@example.com',
      password: 'longenough1',
      confirm: 'different12',
    })

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/no coinciden/i)
    ).toBeInTheDocument()
    expect(supabase.spies.signUp).not.toHaveBeenCalled()
  })

  it('calls signUp with email, password and full_name on valid submission', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await fill(user, {
      name: 'María García',
      email: 'maria@example.com',
      password: 'longenough1',
      confirm: 'longenough1',
    })

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(supabase.spies.signUp).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'longenough1',
      options: {
        emailRedirectTo: expect.stringContaining('/login'),
        data: { full_name: 'María García' },
      },
    })
  })

  it('shows the confirmation screen after a successful signUp', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    await fill(user, {
      name: 'María García',
      email: 'maria@example.com',
      password: 'longenough1',
      confirm: 'longenough1',
    })

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/revisa tu email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /volver al inicio de sesión/i })
    ).toBeInTheDocument()
  })

  it('shows a friendly error when the email is already registered', async () => {
    supabase = createSupabaseMock({
      signUpError: 'User already registered',
    })
    const user = userEvent.setup()
    render(<RegisterPage />)
    await fill(user, {
      name: 'María García',
      email: 'maria@example.com',
      password: 'longenough1',
      confirm: 'longenough1',
    })

    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(
      await screen.findByText(/ya está registrado/i)
    ).toBeInTheDocument()
    expect(screen.queryByText(/revisa tu email/i)).not.toBeInTheDocument()
  })
})
