import { test, expect } from '@playwright/test'

test.describe('proxy / route protection', () => {
  test('redirects unauthenticated users from /dashboard to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects unauthenticated users from /onboarding to /login', async ({
    page,
  }) => {
    await page.goto('/onboarding')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('lets unauthenticated users visit /login and /register', async ({
    page,
  }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { name: /bienvenido de vuelta/i })
    ).toBeVisible()

    await page.goto('/register')
    await expect(page).toHaveURL(/\/register$/)
    await expect(
      page.getByRole('heading', { name: /crea tu cuenta/i })
    ).toBeVisible()
  })
})
