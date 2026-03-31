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

test.describe('Notifications push', () => {
  test.beforeEach(async ({ page }) => {
    await loginOrRegister(page)
  })

  test('page /notifications accessible', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('h1')).toContainText('Notifications')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('modèles rapides visibles', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('text=Menu -1€')).toBeVisible()
    await expect(page.locator('text=Café offert')).toBeVisible()
    await expect(page.locator('text=Double points')).toBeVisible()
  })

  test('cliquer un modèle remplit le formulaire', async ({ page }) => {
    await page.goto('/notifications')
    await page.click('text=Menu -1€')
    const titleInput = page.locator('input[placeholder*="Offre"]')
    await expect(titleInput).not.toBeEmpty({ timeout: 3000 })
  })

  test('formulaire envoi notification visible', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('text=Composer une notification')).toBeVisible()
    await expect(page.locator('input[placeholder*="Offre"]')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button:has-text("Envoyer")')).toBeVisible()
  })

  test('aperçu notification en temps réel', async ({ page }) => {
    await page.goto('/notifications')
    await page.fill('input[placeholder*="Offre"]', 'Test notification')
    await page.fill('textarea', 'Ceci est un test')
    await expect(page.locator('text=Aperçu notification')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('text=Test notification')).toBeVisible()
  })

  test('historique des notifications visible', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.locator('text=Historique')).toBeVisible()
  })

  test('lien notification dans sidebar dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const notifLink = page.locator('a[href="/notifications"]')
    await expect(notifLink).toBeVisible()
  })
})
