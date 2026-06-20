import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Verdant Pages' })).toBeVisible()
})

test('app shell loads', async ({ page }) => {
  await page.goto('/app/today')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
})
