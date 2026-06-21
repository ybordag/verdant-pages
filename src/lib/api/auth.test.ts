import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import { getSession, login, logout, register, tryRefreshToken } from './auth'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return {
    ...actual,
    apiFetch: vi.fn(),
    refreshAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
  }
})

const session = { user_id: '1', email: 'me@example.com', preferred_provider: null, preferred_model: null }

describe('auth API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue(session)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('login posts credentials, stores the token, then fetches the session', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ access_token: 'tok-123' }).mockResolvedValueOnce(session)
    const result = await login('me@example.com', 'pw')
    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'me@example.com', password: 'pw' }),
    })
    expect(client.setAccessToken).toHaveBeenCalledWith('tok-123')
    expect(client.apiFetch).toHaveBeenNthCalledWith(2, '/auth/session')
    expect(result).toEqual(session)
  })

  it('register posts credentials, stores the token, then fetches the session', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce({ access_token: 'tok-456' }).mockResolvedValueOnce(session)
    const result = await register('me@example.com', 'pw')
    expect(client.apiFetch).toHaveBeenNthCalledWith(1, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: 'me@example.com', password: 'pw' }),
    })
    expect(client.setAccessToken).toHaveBeenCalledWith('tok-456')
    expect(result).toEqual(session)
  })

  it('logout calls the endpoint and clears the token', async () => {
    await logout()
    expect(client.apiFetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
    expect(client.setAccessToken).toHaveBeenCalledWith(null)
  })

  it('logout clears the token even when the network call fails', async () => {
    vi.mocked(client.apiFetch).mockRejectedValueOnce(new Error('network down'))
    await expect(logout()).resolves.toBeUndefined()
    expect(client.setAccessToken).toHaveBeenCalledWith(null)
  })

  it('tryRefreshToken delegates to refreshAccessToken', async () => {
    vi.mocked(client.refreshAccessToken).mockResolvedValueOnce(true)
    await expect(tryRefreshToken()).resolves.toBe(true)
    expect(client.refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('getSession fetches the session endpoint', async () => {
    await expect(getSession()).resolves.toEqual(session)
    expect(client.apiFetch).toHaveBeenCalledWith('/auth/session')
  })
})
