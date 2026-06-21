import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as incidents from './incidents'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('incidents API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listIncidents omits the query string when no params are given', async () => {
    await incidents.listIncidents()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents')
  })

  it('listIncidents builds a query string from params', async () => {
    await incidents.listIncidents({ status: 'reported', severity: 'high' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents?status=reported&severity=high')
  })

  it('getIncident fetches a single incident by id', async () => {
    await incidents.getIncident('inc-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1')
  })

  it('createIncident posts the incident payload', async () => {
    const data = { incident_type: 'pest', summary: 'Aphids on kale' }
    await incidents.createIncident(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('updateIncident patches the incident', async () => {
    await incidents.updateIncident('inc-1', { severity: 'critical' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1', {
      method: 'PATCH',
      body: JSON.stringify({ severity: 'critical' }),
    })
  })

  it('deleteIncident issues a DELETE', async () => {
    await incidents.deleteIncident('inc-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1', { method: 'DELETE' })
  })

  it('resolveIncident PATCHes with an empty body when no notes are given', async () => {
    await incidents.resolveIncident('inc-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/resolve', {
      method: 'PATCH',
      body: JSON.stringify({}),
    })
  })

  it('resolveIncident PATCHes with notes', async () => {
    await incidents.resolveIncident('inc-1', { notes: 'Treated and resolved' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/resolve', {
      method: 'PATCH',
      body: JSON.stringify({ notes: 'Treated and resolved' }),
    })
  })

  it('getIncidentTreatment fetches the latest treatment plan', async () => {
    await incidents.getIncidentTreatment('inc-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/treatment')
  })

  it('draftTreatmentPlan posts the thread id to trigger an AI draft', async () => {
    await incidents.draftTreatmentPlan('inc-1', 'thread-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/treatment', {
      method: 'POST',
      body: JSON.stringify({ thread_id: 'thread-1' }),
    })
  })

  it('createManualTreatmentPlan posts the plan payload', async () => {
    const data = { approach_summary: 'Spray with neem oil', follow_up_strategy: 'Recheck in 1 week' }
    await incidents.createManualTreatmentPlan('inc-1', data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/treatment/manual', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

  it('updateTreatmentPlan patches the plan', async () => {
    await incidents.updateTreatmentPlan('plan-1', { approach_summary: 'Updated approach' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/treatment-plans/plan-1', {
      method: 'PATCH',
      body: JSON.stringify({ approach_summary: 'Updated approach' }),
    })
  })

  it('deleteTreatmentPlan issues a DELETE', async () => {
    await incidents.deleteTreatmentPlan('plan-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/treatment-plans/plan-1', { method: 'DELETE' })
  })

  it('approveTreatmentPlan PATCHes the approve action', async () => {
    await incidents.approveTreatmentPlan('plan-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/treatment-plans/plan-1/approve', { method: 'PATCH' })
  })

  it('getIncidentActivity builds a query string from params', async () => {
    await incidents.getIncidentActivity('inc-1', { limit: 5 })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/incidents/inc-1/activity?limit=5')
  })
})
