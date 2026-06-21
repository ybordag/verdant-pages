import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as calendar from './calendar'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('calendar API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listAnnotations builds a query string from since/before', async () => {
    await calendar.listAnnotations({ since: '2026-06-01', before: '2026-07-01' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/calendar/annotations?since=2026-06-01&before=2026-07-01')
  })

  it('createAnnotation posts the annotation payload', async () => {
    const data = { date: '2026-06-20', content: 'First frost expected' }
    await calendar.createAnnotation(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/calendar/annotations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('updateAnnotation PATCHes the annotation payload', async () => {
    await calendar.updateAnnotation('ann-1', { content: 'updated' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/calendar/annotations/ann-1', {
      method: 'PATCH',
      body: JSON.stringify({ content: 'updated' }),
    })
  })

  it('deleteAnnotation issues a DELETE', async () => {
    await calendar.deleteAnnotation('ann-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/calendar/annotations/ann-1', { method: 'DELETE' })
  })
})
