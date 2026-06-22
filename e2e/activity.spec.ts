import { expect, test } from '@playwright/test'
import { makeActivityEvents, mockAuthenticatedActivityApi } from './fixtures/activity'

test('activity feed lazy-loads older events for a busy user', async ({ page }) => {
  const events = makeActivityEvents(45)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 19', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).not.toBeVisible()

  const appScroller = page.locator('#root > div > div > main')
  await appScroller.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await expect.poll(() => requests.some((request) => request.before_timestamp === events[19].created_at)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 20', exact: true })).toBeVisible()

  await appScroller.evaluate((element) => element.scrollTo(0, element.scrollHeight))
  await expect.poll(() => requests.some((request) => request.before_timestamp === events[39].created_at)).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 44', exact: true })).toBeVisible()
})

test('activity filters query the backend and validate invalid date ranges', async ({ page }) => {
  const events = makeActivityEvents(30)
  const requests = await mockAuthenticatedActivityApi(page, events)

  await page.goto('/app/activity')
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()

  await expect(page.getByRole('listbox', { name: 'Category' })).not.toBeVisible()
  await expect.poll(() => requests.some((request) => request.category === 'incident')).toBe(true)
  await expect(page.getByRole('heading', { name: 'Activity event 2', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Activity event 0', exact: true })).not.toBeVisible()

  await page.getByRole('button', { name: 'Since' }).click()
  await page.getByRole('button', { name: 'Since 06/20/2026' }).click()
  await expect(page.getByRole('dialog', { name: 'Since calendar' })).not.toBeVisible()
  await expect.poll(() => requests.some((request) => request.since === '2026-06-20')).toBe(true)
  const requestCountBeforeInvalidRange = requests.length

  await page.getByRole('button', { name: 'Before' }).click()
  await page.getByRole('button', { name: 'Before 06/19/2026' }).click()

  await expect(page.getByText('Before must be after since.')).toBeVisible()
  await expect.poll(() => requests.length).toBe(requestCountBeforeInvalidRange)
})

test('activity ignores a slow initial response after the user changes filters', async ({ page }) => {
  const events = [
    ...makeActivityEvents(8).map((event) => ({ ...event, category: 'task', event_type: 'task_created' })),
    {
      ...makeActivityEvents(1)[0],
      id: 'race-incident',
      category: 'incident',
      event_type: 'incident_reported',
      summary: 'Incident filter result',
      subjects: [{ subject_type: 'incident', subject_id: 'race-incident', role: 'primary' }],
    },
  ]
  const requests = await mockAuthenticatedActivityApi(page, events, { delayFirstUnfilteredMs: 350 })

  await page.goto('/app/activity')
  await page.getByRole('button', { name: 'Category' }).click()
  await page.getByRole('option', { name: 'incident' }).click()

  await expect(page.getByText('Incident filter result')).toBeVisible()
  await expect.poll(() => requests.some((request) => !request.category)).toBe(true)
  await expect.poll(() => requests.some((request) => request.category === 'incident')).toBe(true)

  await page.waitForTimeout(450)
  await expect(page.getByText('Activity event 0')).not.toBeVisible()
})
