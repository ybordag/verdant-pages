import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as garden from './garden'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('garden API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('getGardenProfile fetches the profile', async () => {
    await garden.getGardenProfile()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/profile')
  })

  it('updateGardenProfile patches the profile', async () => {
    await garden.updateGardenProfile({ climate_zone: '9b' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/profile', {
      method: 'PATCH',
      body: JSON.stringify({ climate_zone: '9b' }),
    })
  })

  it('listBeds builds a query string from params', async () => {
    await garden.listBeds({ available: true })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds?available=true')
  })

  it('listBeds omits the query string when no params are given', async () => {
    await garden.listBeds()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds')
  })

  it('getBed fetches a single bed by id', async () => {
    await garden.getBed('bed-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1')
  })

  it('createBed posts the bed payload', async () => {
    await garden.createBed({ name: 'Courtyard Bed' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds', {
      method: 'POST',
      body: JSON.stringify({ name: 'Courtyard Bed' }),
    })
  })

  it('updateBed patches the bed', async () => {
    await garden.updateBed('bed-1', { sunlight: 'full sun' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1', {
      method: 'PATCH',
      body: JSON.stringify({ sunlight: 'full sun' }),
    })
  })

  it('deleteBed issues a DELETE', async () => {
    await garden.deleteBed('bed-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1', { method: 'DELETE' })
  })

  it('getBedCareState fetches care state', async () => {
    await garden.getBedCareState('bed-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1/care/state')
  })

  it('recordBedCare posts the care payload', async () => {
    await garden.recordBedCare('bed-1', { care_type: 'watered' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1/care', {
      method: 'POST',
      body: JSON.stringify({ care_type: 'watered' }),
    })
  })

  it('getBedActivity builds a query string from params', async () => {
    await garden.getBedActivity('bed-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/beds/bed-1/activity?limit=5')
  })

  it('listContainers builds a query string from params', async () => {
    await garden.listContainers({ available: false })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers?available=false')
  })

  it('getContainer fetches a single container by id', async () => {
    await garden.getContainer('container-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1')
  })

  it('createContainer posts the container payload', async () => {
    const data = { name: 'Big Pot', container_type: 'pot', size_gallons: 10, location: 'patio' }
    await garden.createContainer(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('updateContainer patches the container', async () => {
    await garden.updateContainer('container-1', { location: 'greenhouse' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1', {
      method: 'PATCH',
      body: JSON.stringify({ location: 'greenhouse' }),
    })
  })

  it('deleteContainer issues a DELETE', async () => {
    await garden.deleteContainer('container-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1', { method: 'DELETE' })
  })

  it('getContainerCareState fetches care state', async () => {
    await garden.getContainerCareState('container-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1/care/state')
  })

  it('recordContainerCare posts the care payload', async () => {
    await garden.recordContainerCare('container-1', { care_type: 'fertilized' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1/care', {
      method: 'POST',
      body: JSON.stringify({ care_type: 'fertilized' }),
    })
  })

  it('getContainerActivity builds a query string from params', async () => {
    await garden.getContainerActivity('container-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/containers/container-1/activity?limit=5')
  })

  it('getLocations URL-encodes the location and fetches', async () => {
    await garden.getLocations('back yard')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/garden/locations/back%20yard')
  })
})
