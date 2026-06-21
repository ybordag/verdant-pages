import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as alerts from './alerts'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('alerts API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listAlerts fetches the alerts list', async () => {
    await alerts.listAlerts()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/alerts')
  })

  it('dismissAlert posts to the dismiss endpoint', async () => {
    await alerts.dismissAlert('alert-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/alerts/alert-1/dismiss', { method: 'POST' })
  })
})
