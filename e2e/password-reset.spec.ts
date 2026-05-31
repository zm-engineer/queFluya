import { test, expect } from '@playwright/test'

test.describe('password reset surface', () => {
  test('forgot-password page renders the email form', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(
      page.getByRole('heading', { name: /recupera tu contraseña/i })
    ).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /enviar enlace/i })
    ).toBeVisible()
  })

  test('reset-password page renders two password fields', async ({ page }) => {
    await page.goto('/reset-password')
    await expect(
      page.getByRole('heading', { name: /nueva contraseña/i })
    ).toBeVisible()
    await expect(page.getByLabel(/^contraseña nueva$/i)).toBeVisible()
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible()
  })

  test('login page links to /forgot-password', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /olvidaste tu contraseña/i }).click()
    await expect(page).toHaveURL(/\/forgot-password$/)
  })
})
