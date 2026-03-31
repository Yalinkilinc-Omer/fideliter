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

test.describe('Système de points', () => {
  let pointsCardId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginOrRegister(page)
    // Créer carte points
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Points Playwright')
    await page.click('button:has-text("Points")')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/]+$/, { timeout: 12000 })
    pointsCardId = page.url().split('/cards/')[1]

    // Inscrire un client via portail
    await page.goto(`/card/${pointsCardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Client Points')
    await page.fill('input[type="email"]', 'points@example.com')
    await page.click('button:has-text("Obtenir ma carte")')
    await page.waitForURL(/\/card\/[^/]+$/, { timeout: 10000 })
    await page.close()
  })

  test('page carte points affiche saisie euros', async ({ page }) => {
    await loginOrRegister(page)
    await page.goto(`/cards/${pointsCardId}`)
    await expect(page.locator('[data-testid="euro-input"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('ajouter des points via saisie euros', async ({ page }) => {
    await loginOrRegister(page)
    await page.goto(`/cards/${pointsCardId}`)
    const euroInput = page.locator('[data-testid="euro-input"]').first()
    await expect(euroInput).toBeVisible({ timeout: 8000 })
    await euroInput.fill('10')
    const addBtn = page.locator('[data-testid="add-points-btn"]').first()
    await expect(addBtn).toContainText('10 pts')
    await addBtn.click()
    await page.waitForTimeout(2000)
    await expect(page.locator('text=10 pts').or(page.locator('text=10 points'))).toBeVisible({ timeout: 8000 })
  })

  test('seuil 750 pts affiché dans la création de carte', async ({ page }) => {
    await loginOrRegister(page)
    await page.goto('/cards/new')
    await page.click('button:has-text("Points")')
    await expect(page.locator('text=750')).toBeVisible()
    await expect(page.locator('text=1€ = 1 point').or(page.locator('text=1€ dépensé'))).toBeVisible()
  })

  test('valeur en euros affichée sur la carte client', async ({ page }) => {
    await page.goto(`/card/${pointsCardId}`)
    // Page inscription ou vue selon état
    const enrollBtn = page.locator('button:has-text("Obtenir ma carte")')
    if (await enrollBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.fill('input[placeholder*="prénom"]', 'Vue Test')
      await enrollBtn.click()
      await page.waitForURL(/\/card\/[^/]+$/, { timeout: 10000 })
    }
    // Sur la carte vue, les points et valeur euros doivent être visibles
    await expect(page.locator('text=pts').or(page.locator('text=points'))).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=1€ = 1 point').or(page.locator('text=valeur').or(page.locator('text=€')))).toBeVisible({ timeout: 8000 })
  })
})
