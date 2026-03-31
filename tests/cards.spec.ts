import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'test-playwright@fideliter.dev'
const TEST_PASSWORD = 'playwright123'
const BUSINESS_NAME = 'Café Playwright Test'

async function loginOrRegister(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')
  // If login fails, try register
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

test.describe('Cartes fidélité', () => {
  test.beforeEach(async ({ page }) => {
    await loginOrRegister(page)
  })

  test('page /cards accessible après connexion', async ({ page }) => {
    await page.goto('/cards')
    await expect(page.locator('h1')).toContainText('cartes')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('bouton Nouvelle carte visible sur /cards', async ({ page }) => {
    await page.goto('/cards')
    const btn = page.locator('a[href="/cards/new"]')
    await expect(btn).toBeVisible()
  })

  test('page /cards/new affiche le formulaire', async ({ page }) => {
    await page.goto('/cards/new')
    await expect(page.locator('h1')).toContainText('Nouvelle carte')
    await expect(page.locator('input[placeholder*="Carte"]')).toBeVisible()
    await expect(page.locator('text=Tampons')).toBeVisible()
    await expect(page.locator('text=Points')).toBeVisible()
  })

  test('création carte tampons', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Tampons')
    await page.click('button:has-text("Tampons")')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
    await expect(page.locator('h1')).toContainText('Carte Test Tampons')
  })

  test('création carte points avec seuil 750', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Points')
    await page.click('button:has-text("Points")')
    await expect(page.locator('text=750')).toBeVisible()
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
    await expect(page.locator('h1')).toContainText('Carte Test Points')
  })

  test('QR code inscription affiché sur la page carte', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte QR Test')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
    await page.click('text=QR inscription')
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible({ timeout: 5000 })
  })

  test('retour vers /cards depuis page carte', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Retour')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
    await page.click('a[href="/cards"]')
    await expect(page).toHaveURL(/\/cards$/)
  })
})
