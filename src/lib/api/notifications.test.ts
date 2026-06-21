import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as notifications from './notifications'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('notifications API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('getNotifications omits the query string when no params are given', async () => {
    await notifications.getNotifications()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/notifications')
  })

  it('getNotifications builds a query string from since', async () => {
    await notifications.getNotifications({ since: '2026-06-20T00:00:00Z' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/notifications?since=2026-06-20T00%3A00%3A00Z')
  })
})
