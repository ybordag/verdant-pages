import { test, expect } from '@playwright/test'

test('landing page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Verdant Pages' })).toBeVisible()
})

test('app shell loads once registered', async ({ page }) => {
  // /app/* requires a real session now that ProtectedRoute does a real auth
  // check — register a throwaway user via the UI to reach the shell.
  const email = `smoke-${Date.now()}@example.com`
  await page.goto('/register')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('Smoke-test-password1!')
  await page.getByLabel('Confirm password').fill('Smoke-test-password1!')
  await page.getByRole('button', { name: 'Sign Up' }).click()

  await expect(page).toHaveURL('/app/today')
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
})
