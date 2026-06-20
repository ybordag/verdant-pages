import { apiFetch, refreshAccessToken, setAccessToken } from './client'
import type { SessionResponse, TokenResponse } from '@/lib/types/cambium'

export async function login(email: string, password: string): Promise<SessionResponse> {
  const res = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setAccessToken(res.access_token)
  return getSession()
}

export async function register(email: string, password: string): Promise<SessionResponse> {
  const res = await apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setAccessToken(res.access_token)
  return getSession()
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } catch {
    // Fire-and-forget — the user's intent to log out should never be
    // blocked by a network blip. Local state is cleared regardless.
  }
  setAccessToken(null)
}

export async function tryRefreshToken(): Promise<boolean> {
  return refreshAccessToken()
}

export async function getSession(): Promise<SessionResponse> {
  return apiFetch<SessionResponse>('/auth/session')
}
