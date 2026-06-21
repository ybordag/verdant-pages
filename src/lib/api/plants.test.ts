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

  it('getPlant fetches a single plant by id', async () => {
    await plants.getPlant('plant-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1')
  })

  it('createPlant posts the plant payload', async () => {
    const data = { name: 'Cherry Tomato', source: 'seed' }
    await plants.createPlant(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('updatePlant patches the plant', async () => {
    await plants.updatePlant('plant-1', { status: 'producing' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'producing' }),
    })
  })

  it('createPlantBatch posts the batch payload', async () => {
    const data = { name: 'Basil', quantity: 6, source: 'seed' }
    await plants.createPlantBatch(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('batchUpdatePlants patches the batch filter payload', async () => {
    const data = { name: 'Sungold', new_status: 'producing' }
    await plants.batchUpdatePlants(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/batch', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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

  it('getPlantActivity builds a query string from params', async () => {
    await plants.getPlantActivity('plant-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1/activity?limit=5')
  })

  it('removePlant PATCHes with a reason query param', async () => {
    await plants.removePlant('plant-1', 'died')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1/remove?reason=died', { method: 'PATCH' })
  })

  it('deletePlant issues a DELETE', async () => {
    await plants.deletePlant('plant-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/plants/plant-1', { method: 'DELETE' })
  })

  it('getBatchActivity builds a query string from params', async () => {
    await plants.getBatchActivity('batch-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/batches/batch-1/activity?limit=5')
  })
})
