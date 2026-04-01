import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Auth flows', () => {

  test('page login affiche le formulaire', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h1')).toContainText('Digital Fidélité')
    await expect(page.locator('h2')).toContainText('Connexion')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Se connecter')
  })

  test('lien vers inscription visible depuis login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('a[href="/register"]')).toBeVisible()
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
    await expect(
      page.locator('text=Invalid').or(page.locator('text=invalide').or(page.locator('[class*="red"]')))
    ).toBeVisible({ timeout: 8000 })
  })

  // La page / est maintenant une landing page, pas un redirect vers /login
  test('/ affiche la landing page si non authentifié', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Fidélisez')
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
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

  test('connexion réussie avec le compte test', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/(dashboard|onboarding|cards)/)
  })
})
