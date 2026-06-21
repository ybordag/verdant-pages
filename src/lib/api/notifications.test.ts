import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as stream from '@/lib/sse/stream'
import * as notifications from './notifications'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

vi.mock('@/lib/sse/stream', () => ({ consumeNotificationStream: vi.fn() }))

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

  it('streamNotifications delegates to consumeNotificationStream', () => {
    notifications.streamNotifications()
    expect(stream.consumeNotificationStream).toHaveBeenCalledWith(undefined)
  })

  it('streamNotifications forwards an AbortSignal when given', () => {
    const controller = new AbortController()
    notifications.streamNotifications(controller.signal)
    expect(stream.consumeNotificationStream).toHaveBeenCalledWith(controller.signal)
  })
})
