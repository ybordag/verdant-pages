import { StrictMode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './context'
import * as authApi from '@/lib/api/auth'

vi.mock('@/lib/api/auth')
vi.mock('@/routes/router', () => ({ router: { navigate: vi.fn() } }))

const session = { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null }

function Probe() {
  const { user, isLoading, login, register, logout } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={() => login('me@example.com', 'pw')}>login</button>
      <button onClick={() => register('me@example.com', 'pw')}>register</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.mocked(authApi.tryRefreshToken).mockResolvedValue(false)
    vi.mocked(authApi.getSession).mockResolvedValue(session)
    vi.mocked(authApi.login).mockResolvedValue(session)
    vi.mocked(authApi.register).mockResolvedValue(session)
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('attempts a silent refresh on mount and leaves user null when it fails', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('user')).toHaveTextContent('none')
  })

  it('populates user from getSession when silent refresh succeeds', async () => {
    vi.mocked(authApi.tryRefreshToken).mockResolvedValue(true)
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('me@example.com'))
  })

  it('login sets the user', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('me@example.com'))
  })

  it('register sets the user', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByRole('button', { name: 'register' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('me@example.com'))
  })

  it('logout clears the user', async () => {
    vi.mocked(authApi.tryRefreshToken).mockResolvedValue(true)
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('me@example.com'))
    await userEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'))
  })

  it('only calls tryRefreshToken once on mount even under StrictMode double-invocation', async () => {
    // /auth/refresh rotates the refresh-token cookie on every call — firing
    // it twice from a double-invoked mount effect races one rotation
    // against the other's revoke. Regression test for that StrictMode bug.
    render(
      <StrictMode>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </StrictMode>,
    )
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(authApi.tryRefreshToken).toHaveBeenCalledTimes(1)
  })

  it('throws when useAuth is used outside the provider', () => {
    function Bare() {
      useAuth()
      return null
    }
    expect(() => render(<Bare />)).toThrow('useAuth must be used within AuthProvider')
  })
})
