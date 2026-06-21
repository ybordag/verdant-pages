import type { TokenResponse } from '@/lib/types/cambium'

export const BASE = import.meta.env.VITE_CAMBIUM_URL ?? ''

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
}
export const getAccessToken = () => accessToken

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, body: unknown) {
    super(`API ${status}`)
    this.status = status
    this.body = body
  }
}

// Raw refresh call, kept here (not in auth.ts) to avoid a circular import:
// apiFetch needs to call this on 401, and auth.ts's apiFetch-based functions
// need to import apiFetch from this module. auth.ts's exported
// tryRefreshToken() is a thin wrapper around this.
//
// Concurrent callers share one in-flight refresh instead of each firing
// their own POST /auth/refresh: the refresh token rotates on every use, so
// two simultaneous refreshes would race and the loser would fail, forcing a
// spurious logout even though the session was fine. This happens for real —
// e.g. several components 401 at once right as the access token expires.
let refreshInFlight: Promise<boolean> | null = null

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    try {
      const res = await fetch(BASE + '/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        setAccessToken(null)
        return false
      }
      const data = (await res.json()) as TokenResponse
      setAccessToken(data.access_token)
      return true
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

// Builds a query string from a params object, skipping null/undefined values
// and coercing booleans/numbers to strings (Cambium/Rhizome query params are
// always plain strings).
export function toQueryString<T extends object>(params?: T): string {
  if (!params) return ''
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null,
  )
  if (entries.length === 0) return ''
  const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))
  return `?${qs.toString()}`
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, skipRefresh = false): Promise<T> {
  const token = accessToken

  const res = await fetch(BASE + path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Only an authenticated call (token was attached) can mean "session expired" —
  // a 401 with no token attached is a credentials failure (e.g. bad login),
  // which callers handle themselves via ApiError.
  if (res.status === 401 && token && !skipRefresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) return apiFetch(path, options, true)
    setAccessToken(null)
    window.location.replace('/login')
    throw new ApiError(401, null)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body)
  }

  return res.json() as Promise<T>
}
