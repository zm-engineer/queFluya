import { test, expect } from '@playwright/test'

test.describe('topics access', () => {
  test('redirects unauthenticated users from /topics/anything to /login', async ({
    page,
  }) => {
    await page.goto('/topics/greetings-and-introductions')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects unauthenticated users from /topics/nonexistent to /login', async ({
    page,
  }) => {
    await page.goto('/topics/does-not-exist')
    await expect(page).toHaveURL(/\/login$/)
  })
})
