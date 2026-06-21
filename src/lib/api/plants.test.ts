import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as plants from './plants'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('plants API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listPlants omits the query string when no params are given', async () => {
    await plants.listPlants()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants')
  })

  it('listPlants builds a query string from params', async () => {
    await plants.listPlants({ status: 'active', bed_id: 'bed-1' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants?status=active&bed_id=bed-1')
  })

  it('getPlantCareState fetches care state', async () => {
    await plants.getPlantCareState('plant-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1/care/state')
  })

  it('recordPlantCare posts the care payload', async () => {
    await plants.recordPlantCare('plant-1', { care_type: 'pruned' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1/care', {
      method: 'POST',
      body: JSON.stringify({ care_type: 'pruned' }),
    })
  })

  it('removePlant PATCHes with a reason query param', async () => {
    await plants.removePlant('plant-1', 'died')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1/remove?reason=died', { method: 'PATCH' })
  })

  it('deletePlant issues a DELETE', async () => {
    await plants.deletePlant('plant-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1', { method: 'DELETE' })
  })
})
