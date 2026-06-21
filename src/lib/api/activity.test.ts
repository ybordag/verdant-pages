import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as activity from './activity'
import * as client from './client'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('activity API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listActivity omits the query string when no params are given', async () => {
    await activity.listActivity()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/activity')
  })

  it('listActivity builds a query string from filters', async () => {
    await activity.listActivity({
      project_id: 'proj-1',
      subject_type: 'plant',
      event_type: 'plant_updated',
      category: 'garden',
      limit: 10,
    })
    expect(client.apiFetch).toHaveBeenCalledWith(
      '/api/v1/activity?project_id=proj-1&subject_type=plant&event_type=plant_updated&category=garden&limit=10',
    )
  })

  it('getActivityStats builds a query string from params', async () => {
    await activity.getActivityStats({
      since: '2026-06-01T00:00:00',
      before: '2026-06-21T00:00:00',
      event_types: 'plant_created,task_completed',
      group_by: 'week',
    })
    expect(client.apiFetch).toHaveBeenCalledWith(
      '/api/v1/activity/stats?since=2026-06-01T00%3A00%3A00&before=2026-06-21T00%3A00%3A00&event_types=plant_created%2Ctask_completed&group_by=week',
    )
  })
})
