import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('renders the wordmark and tagline', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Verdant Pages' })).toBeVisible()
  await expect(page.getByText(/Plan, tend, and track your garden/)).toBeVisible()
})

test('Login and Sign Up navigate to the auth pages', async ({ page }) => {
  await page.getByRole('link', { name: 'Login' }).click()
  await expect(page).toHaveURL('/login')
  await page.goBack()
  await page.getByRole('link', { name: 'Sign Up' }).click()
  await expect(page).toHaveURL('/register')
})

test('theme toggle switches theme from the landing page', async ({ page }) => {
  await expect(page.getByRole('switch', { name: 'Toggle theme' })).toHaveAttribute('aria-checked', 'false')
  await page.getByRole('switch', { name: 'Toggle theme' }).click()
  await expect(page.getByRole('switch', { name: 'Toggle theme' })).toHaveAttribute('aria-checked', 'true')
})

test('GitHub link points at the repo', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/ybordag/verdant-pages',
  )
})
