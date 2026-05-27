import { test, expect } from '@playwright/test'

test.describe('auth pages — public surface', () => {
  test('login form has email, password and links to register', async ({
    page,
  }) => {
    await page.goto('/login')

    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /iniciar sesión/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /crear una cuenta/i })
    ).toHaveAttribute('href', '/register')
  })

  test('register form has all four fields and links to login', async ({
    page,
  }) => {
    await page.goto('/register')

    await expect(page.getByLabel(/nombre completo/i)).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible()
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /crear cuenta/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /iniciar sesión/i })
    ).toHaveAttribute('href', '/login')
  })

  test('landing CTA buttons navigate to /register and /login', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('link', { name: /registrarme gratis/i }).click()
    await expect(page).toHaveURL(/\/register$/)

    await page.goto('/')
    await page
      .getByRole('link', { name: /iniciar sesión/i })
      .first()
      .click()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('register shows a validation error for empty submit', async ({
    page,
  }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: /crear cuenta/i }).click()
    await expect(
      page.getByText(/completa todos los campos/i)
    ).toBeVisible()
  })
})
