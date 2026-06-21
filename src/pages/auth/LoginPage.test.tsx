import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import { useAuth } from '@/lib/auth/context'
import { ApiError } from '@/lib/api/client'
import LoginPage from './LoginPage'

vi.mock('@/lib/auth/context')

function mockAuth(login: (email: string, password: string) => Promise<void>) {
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isLoading: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
  })
}

function renderLogin(state?: { email?: string; notice?: string }) {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
        <LoginPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockAuth(vi.fn().mockResolvedValue(undefined))
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
  })

  it('rejects a malformed email', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'not-an-email')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
  })

  it('clears validation errors once the form is valid', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.getByText('Email is required.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(screen.queryByText('Email is required.')).not.toBeInTheDocument()
  })

  it('links to the register page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register')
  })

  it('has a back link to the landing page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('calls login with the entered credentials on valid submit', async () => {
    const login = vi.fn().mockResolvedValue(undefined)
    mockAuth(login)
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => expect(login).toHaveBeenCalledWith('me@example.com', 'whatever'))
  })

  it('shows an invalid-credentials message with a sign-up link on a 401', async () => {
    mockAuth(vi.fn().mockRejectedValue(new ApiError(401, null)))
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByText(/Invalid email or password/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'No account yet? Sign up' })).toHaveAttribute('href', '/register')
  })

  it('shows a generic error message on a non-401 failure', async () => {
    mockAuth(vi.fn().mockRejectedValue(new Error('network down')))
    renderLogin()
    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'whatever')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('prefills the email and shows a notice when arriving from a 409 on RegisterPage', () => {
    renderLogin({ email: 'taken@example.com', notice: 'Log in with your existing account below.' })
    expect(screen.getByLabelText('Email')).toHaveValue('taken@example.com')
    expect(screen.getByText('Log in with your existing account below.')).toBeInTheDocument()
  })

  it('hides the notice once a login error appears', async () => {
    mockAuth(vi.fn().mockRejectedValue(new ApiError(401, null)))
    renderLogin({ email: 'taken@example.com', notice: 'Log in with your existing account below.' })
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    expect(await screen.findByText(/Invalid email or password/)).toBeInTheDocument()
    expect(screen.queryByText('Log in with your existing account below.')).not.toBeInTheDocument()
  })
})
