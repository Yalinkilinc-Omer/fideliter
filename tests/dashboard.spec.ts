import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'test-playwright@fideliter.dev'
const TEST_PASSWORD = 'playwright123'
const BUSINESS_NAME = 'Café Playwright Test'

async function loginOrRegister(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(2000)
  if (page.url().includes('/login')) {
    await page.goto('/register')
    await page.fill('input[placeholder*="tablissement"]', BUSINESS_NAME)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  } else {
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  }
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginOrRegister(page)
  })

  test('dashboard affiche les stats', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Cartes').or(page.locator('text=cartes'))).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Clients').or(page.locator('text=clients'))).toBeVisible()
    await expect(page.locator('text=Notification').or(page.locator('text=notification'))).toBeVisible()
  })

  test('sidebar contient les liens de navigation', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
    await expect(page.locator('a[href="/cards"]')).toBeVisible()
    await expect(page.locator('a[href="/notifications"]')).toBeVisible()
  })

  test('bouton créer une carte visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/cards/new"]').or(page.locator('text=Créer une carte'))).toBeVisible()
  })

  test('bouton envoyer offre visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('text=Envoyer une offre').or(page.locator('a[href="/notifications"]'))).toBeVisible()
  })

  test('nav Mes cartes fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/cards"]')
    await expect(page).toHaveURL(/\/cards$/)
    await expect(page.locator('h1')).toContainText('cartes')
  })

  test('nav Notifications fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/notifications"]')
    await expect(page).toHaveURL(/\/notifications$/)
    await expect(page.locator('h1')).toContainText('Notifications')
  })

  test('déconnexion fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('text=Déconnexion')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
