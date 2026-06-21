import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as weather from './weather'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('weather API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('getLatestWeather fetches the latest snapshot', async () => {
    await weather.getLatestWeather()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/latest')
  })

  it('getLatestWeather passes through a null response', async () => {
    vi.mocked(client.apiFetch).mockResolvedValueOnce(null)
    await expect(weather.getLatestWeather()).resolves.toBeNull()
  })

  it('refreshWeather posts with no body', async () => {
    await weather.refreshWeather()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/refresh', { method: 'POST' })
  })

  it('listWeatherImpactedTasks omits the query string when no params are given', async () => {
    await weather.listWeatherImpactedTasks()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/tasks/impacted')
  })

  it('listWeatherImpactedTasks builds a query string from project_id', async () => {
    await weather.listWeatherImpactedTasks({ project_id: 'proj-1' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/tasks/impacted?project_id=proj-1')
  })

  it('approveWeatherChangeset PATCHes the changeset endpoint', async () => {
    await weather.approveWeatherChangeset('cs-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/changesets/cs-1/approve', { method: 'PATCH' })
  })

  it('draftWeatherTasks posts the thread id', async () => {
    await weather.draftWeatherTasks('thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/weather/tasks/draft', {
      method: 'POST',
      body: JSON.stringify({ thread_id: 'thread-1' }),
    })
  })
})
