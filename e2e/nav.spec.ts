import { test, expect } from '@playwright/test'

// /app/* requires a real session now that ProtectedRoute does a real auth
// check — register a throwaway user via the UI before each test.
test.beforeEach(async ({ page }) => {
  const email = `nav-spec-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('Nav-spec-password1!')
  await page.getByLabel('Confirm password').fill('Nav-spec-password1!')
  await page.getByRole('button', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/app/today')
})

test('renders all 7 nav items', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Rhizome', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Today', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Tasks', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Calendar', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Projects', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Incidents', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Activity', exact: true })).toBeVisible()
})

test('clicking a nav item navigates and marks it active', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await nav.getByRole('link', { name: 'Tasks' }).click()
  await expect(page).toHaveURL('/app/tasks')
  await expect(nav.getByRole('link', { name: 'Tasks' })).toHaveCSS('color', /var\(--nav-accent\)|rgb/)
})

test('nav collapses to icon-only width', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav).toHaveAttribute('data-collapsed', 'false')
  await page.getByRole('button', { name: 'Collapse nav' }).click()
  await expect(nav).toHaveAttribute('data-collapsed', 'true')
})

test('collapsed state persists on reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Collapse nav' }).click()
  await page.reload()
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveAttribute('data-collapsed', 'true')
})

test('notification drawer opens and closes', async ({ page }) => {
  await page.getByRole('button', { name: 'Notifications' }).click()
  await expect(page.getByRole('dialog', { name: 'Notifications' })).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.getByRole('dialog', { name: 'Notifications' })).not.toBeVisible()
})
