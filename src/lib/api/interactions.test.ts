import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as interactions from './interactions'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('interactions API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('getPendingInteraction fetches the pending interaction', async () => {
    await interactions.getPendingInteraction()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/interactions/pending')
  })

  it('listRecentInteractions builds a query string from limit', async () => {
    await interactions.listRecentInteractions({ limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/interactions/recent?limit=5')
  })

  it('getInteraction fetches a single interaction by id', async () => {
    await interactions.getInteraction('int-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/interactions/int-1')
  })

  it('resolveInteraction posts the resolution payload', async () => {
    await interactions.resolveInteraction('int-1', { action: 'confirm', notes: 'looks good' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/interactions/int-1/resolve', {
      method: 'POST',
      body: JSON.stringify({ action: 'confirm', notes: 'looks good' }),
    })
  })
})
