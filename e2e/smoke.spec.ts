import { expect, test } from '@playwright/test'

test('landing page renders hero and CTAs', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: /menos teoría/i })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /registrarme gratis/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /iniciar sesión/i }).first()).toBeVisible()
})
