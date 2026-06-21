import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as triage from './triage'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('triage API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('runTriage posts the thread id', async () => {
    await triage.runTriage('thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/triage/run', {
      method: 'POST',
      body: JSON.stringify({ thread_id: 'thread-1' }),
    })
  })

  it('getLatestTriage fetches the latest snapshot', async () => {
    await triage.getLatestTriage()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/triage/latest')
  })

  it('getLatestTriage passes through a null response', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce(null)
    await expect(triage.getLatestTriage()).resolves.toBeNull()
  })
})
