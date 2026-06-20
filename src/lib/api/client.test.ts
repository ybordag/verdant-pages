import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, ApiError, getAccessToken, setAccessToken } from './client'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('apiFetch', () => {
  beforeEach(() => {
    setAccessToken(null)
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('location', { ...window.location, replace: vi.fn() })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('omits the Authorization header when no token is set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }))
    await apiFetch('/api/v1/garden/profile')
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options?.headers as Record<string, string>).Authorization).toBeUndefined()
  })

  it('attaches the Authorization header when a token is set', async () => {
    setAccessToken('tok-123')
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }))
    await apiFetch('/api/v1/garden/profile')
    const [, options] = vi.mocked(fetch).mock.calls[0]
    expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer tok-123')
  })

  it('throws ApiError with status and body on a non-2xx response', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'bad request' }, 400))
      .mockResolvedValueOnce(jsonResponse({ message: 'bad request' }, 400))
    await expect(apiFetch('/api/v1/tasks')).rejects.toMatchObject({
      status: 400,
      body: { message: 'bad request' },
    })
    await expect(apiFetch('/api/v1/tasks')).rejects.toBeInstanceOf(ApiError)
  })

  it('does not attempt a refresh on a 401 with no token attached (e.g. bad login credentials)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'invalid credentials' }, 401))
    await expect(apiFetch('/auth/login')).rejects.toMatchObject({ status: 401 })
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1)
  })

  it('on a 401 from an authenticated call, refreshes once and retries', async () => {
    setAccessToken('expired-tok')
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401)) // original call
      .mockResolvedValueOnce(jsonResponse({ access_token: 'new-tok' })) // refresh
      .mockResolvedValueOnce(jsonResponse({ id: '1' })) // retried call

    const result = await apiFetch('/api/v1/tasks')
    expect(result).toEqual({ id: '1' })
    expect(getAccessToken()).toBe('new-tok')
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(3)
  })

  it('clears the token and redirects to /login when refresh fails', async () => {
    setAccessToken('expired-tok')
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, 401)) // original call
      .mockResolvedValueOnce(jsonResponse({ message: 'invalid refresh' }, 401)) // refresh fails

    await expect(apiFetch('/api/v1/tasks')).rejects.toMatchObject({ status: 401 })
    expect(getAccessToken()).toBeNull()
    expect(window.location.replace).toHaveBeenCalledWith('/login')
  })
})
