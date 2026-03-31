import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('page login affiche le formulaire', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Digital Fidélité')
    await expect(page.locator('h2')).toContainText('Connexion')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Se connecter')
  })

  test('lien vers inscription visible', async ({ page }) => {
    await page.goto('/login')
    const link = page.locator('a[href="/register"]')
    await expect(link).toBeVisible()
  })

  test('page inscription affiche le formulaire', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h2')).toContainText('Créer un compte')
    await expect(page.locator('input[placeholder*="tablissement"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login avec mauvais mot de passe affiche une erreur', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Invalid').or(page.locator('text=invalide').or(page.locator('[class*="red"]')))).toBeVisible({ timeout: 8000 })
  })

  test('/ redirige vers /login si non authentifié', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('/dashboard redirige vers /login si non authentifié', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('/cards redirige vers /login si non authentifié', async ({ page }) => {
    await page.goto('/cards')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })

  test('/notifications redirige vers /login si non authentifié', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
