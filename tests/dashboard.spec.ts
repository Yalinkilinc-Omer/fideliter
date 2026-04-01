import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
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
    await expect(
      page.locator('a[href="/cards/new"]').or(page.locator('text=Créer une carte'))
    ).toBeVisible()
  })

  test('bouton envoyer offre visible', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(
      page.locator('text=Envoyer une offre').or(page.locator('a[href="/notifications"]'))
    ).toBeVisible()
  })

  test('nav Mes cartes fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/cards"]')
    await expect(page).toHaveURL(/\/cards$/)
    await expect(page.getByRole('heading', { name: /cartes/ })).toBeVisible()
  })

  test('nav Notifications fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('a[href="/notifications"]')
    await expect(page).toHaveURL(/\/notifications$/)
    await expect(page.getByRole('heading', { name: /Notifications/ })).toBeVisible()
  })

  test('déconnexion fonctionne', async ({ page }) => {
    await page.goto('/dashboard')
    await page.click('text=Déconnexion')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
  })
})
