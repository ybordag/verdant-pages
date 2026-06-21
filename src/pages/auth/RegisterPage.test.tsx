import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { useAuth } from '@/lib/auth/context'
import { ApiError } from '@/lib/api/client'
import RegisterPage from './RegisterPage'

vi.mock('@/lib/auth/context')

const VALID_PASSWORD = 'Longenough1!'

function mockAuth(register: (email: string, password: string) => Promise<void>) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    login: vi.fn(),
    register,
    logout: vi.fn(),
  })
}

function renderRegister() {
  render(
    <ThemeProvider>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockAuth(vi.fn().mockResolvedValue(undefined))
  })

  it('renders email, password, and confirm password fields', () => {
    renderRegister()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
  })

  it('rejects a password that does not meet all requirements', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'short')
    await userEvent.type(screen.getByLabelText('Confirm password'), 'short')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('Password does not meet all requirements below.')).toBeInTheDocument()
  })

  it('rejects mismatched passwords', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    await userEvent.type(screen.getByLabelText('Confirm password'), 'different')
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
  })

  it('passes validation with matching passwords that meet all requirements', async () => {
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    await userEvent.type(screen.getByLabelText('Confirm password'), VALID_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument()
    expect(screen.queryByText('Password does not meet all requirements below.')).not.toBeInTheDocument()
  })

  it('links to the login page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
  })

  it('has a back link to the landing page', () => {
    renderRegister()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('calls register with the entered credentials on valid submit', async () => {
    const register = vi.fn().mockResolvedValue(undefined)
    mockAuth(register)
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    await userEvent.type(screen.getByLabelText('Confirm password'), VALID_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    await waitFor(() => expect(register).toHaveBeenCalledWith('me@example.com', VALID_PASSWORD))
  })

  it('shows an email-taken message with a link to login on a 409', async () => {
    mockAuth(vi.fn().mockRejectedValue(new ApiError(409, null)))
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    await userEvent.type(screen.getByLabelText('Confirm password'), VALID_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(await screen.findByText(/already exists/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log in instead' })).toHaveAttribute('href', '/login')
  })

  it('shows a generic error message on a non-409 failure', async () => {
    mockAuth(vi.fn().mockRejectedValue(new Error('network down')))
    renderRegister()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    await userEvent.type(screen.getByLabelText('Confirm password'), VALID_PASSWORD)
    await userEvent.click(screen.getByRole('button', { name: 'Sign Up' }))
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('shows the strength meter requirements and marks them met as the password is typed', async () => {
    renderRegister()
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument()
    expect(screen.getByText('Letters and numbers')).toBeInTheDocument()
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument()
    expect(screen.getByText('One special character')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Password'), VALID_PASSWORD)
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })
})
