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

async function createCard(page: import('@playwright/test').Page, name: string, type: 'stamps' | 'points' = 'stamps') {
  await page.goto('/cards/new')
  await page.fill('input[placeholder*="Carte"]', name)
  if (type === 'points') await page.click('button:has-text("Points")')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
  return page.url().split('/cards/')[1]
}

test.describe('Portail client', () => {
  let cardId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginOrRegister(page)
    cardId = await createCard(page, 'Carte Client Test', 'stamps')
    await page.close()
  })

  test('page /card/[id] affiche le formulaire inscription', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    await expect(page.locator('text=Rejoindre le programme')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('button:has-text("Obtenir ma carte")')).toBeVisible()
  })

  test('inscription client sur la carte', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Jean Test')
    await page.fill('input[type="email"]', 'jean.test@example.com')
    await page.click('button:has-text("Obtenir ma carte")')
    await page.waitForURL(/\/card\/[^/]+$/, { timeout: 10000 })
    await expect(page.locator('text=Jean Test').or(page.locator('text=tampons').or(page.locator('text=0/')))).toBeVisible({ timeout: 8000 })
  })

  test('bouton QR code client visible', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Marie Test')
    await page.click('button:has-text("Obtenir ma carte")')
    await page.waitForURL(/\/card\/[^/]+$/, { timeout: 10000 })
    await expect(page.locator('text=mon QR code')).toBeVisible({ timeout: 8000 })
  })

  test('carte invalide retourne 404', async ({ page }) => {
    await page.goto('/card/00000000-0000-0000-0000-000000000000')
    await expect(page.locator('text=404').or(page.locator('text=not found').or(page.locator('text=trouvé')))).toBeVisible({ timeout: 8000 })
  })
})
