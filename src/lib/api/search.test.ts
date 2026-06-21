import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as search from './search'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('search API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('search builds a query string from q/types/limit', async () => {
    await search.search({ q: 'tomatoes', types: 'plant', limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/search?q=tomatoes&types=plant&limit=5')
  })

  it('search omits types/limit when not given', async () => {
    await search.search({ q: 'basil' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/search?q=basil')
  })
})
