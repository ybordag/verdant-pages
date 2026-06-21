import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, ApiError, getAccessToken, setAccessToken, toQueryString } from './client'

describe('toQueryString', () => {
  it('returns an empty string for undefined params', () => {
    expect(toQueryString(undefined)).toBe('')
  })

  it('returns an empty string when all values are null/undefined', () => {
    expect(toQueryString({ a: undefined, b: null })).toBe('')
  })

  it('serializes string/number/boolean values', () => {
    expect(toQueryString({ q: 'tomatoes', limit: 5, available: true })).toBe('?q=tomatoes&limit=5&available=true')
  })

  it('omits individual null/undefined values while keeping the rest', () => {
    expect(toQueryString({ status: 'pending', project_id: undefined })).toBe('?status=pending')
  })
})

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

  it('shares one in-flight refresh across concurrent 401s instead of racing two refresh calls', async () => {
    setAccessToken('expired-tok')
    let refreshCalls = 0
    const seenOnce = new Set<string>()
    vi.mocked(fetch).mockImplementation(async (url) => {
      const u = String(url)
      if (u.endsWith('/auth/refresh')) {
        refreshCalls++
        // Simulate a real network round-trip so both 401s are in flight
        // before either refresh call resolves.
        await new Promise((r) => setTimeout(r, 5))
        return jsonResponse({ access_token: 'new-tok' })
      }
      // First hit per URL is the stale-token 401; the retry (after refresh) succeeds.
      if (!seenOnce.has(u)) {
        seenOnce.add(u)
        return jsonResponse({ message: 'expired' }, 401)
      }
      return jsonResponse({ ok: true, url: u })
    })

    // Two requests both hit the expired token at once.
    const [resultA, resultB] = await Promise.all([apiFetch('/api/v1/tasks'), apiFetch('/api/v1/garden/profile')])

    expect(refreshCalls).toBe(1)
    expect(resultA).toMatchObject({ ok: true })
    expect(resultB).toMatchObject({ ok: true })
    expect(getAccessToken()).toBe('new-tok')
  })
})
