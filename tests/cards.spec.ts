import { test, expect } from '@playwright/test'
import { login, createCard } from './helpers'

test.describe('Cartes fidélité', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('page /cards accessible après connexion', async ({ page }) => {
    await page.goto('/cards')
    await expect(page.getByRole('heading', { name: /cartes/i })).toBeVisible()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('bouton Nouvelle carte visible sur /cards', async ({ page }) => {
    await page.goto('/cards')
    await expect(page.locator('a[href="/cards/new"]').first()).toBeVisible()
  })

  test('page /cards/new affiche le formulaire', async ({ page }) => {
    await page.goto('/cards/new')
    await expect(page.getByRole('heading', { name: /Nouvelle carte/i })).toBeVisible()
    await expect(page.locator('input[placeholder*="Carte"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Tampons/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Points/i })).toBeVisible()
  })

  test('création carte tampons', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Tampons')
    await page.getByRole('button', { name: /Tampons/i }).click()
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Carte Test Tampons/ })).toBeVisible()
  })

  test('création carte points avec seuil 750', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Points')
    await page.getByRole('button', { name: /Points/i }).click()
    await expect(page.locator('text=750 pts').first()).toBeVisible()
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Carte Test Points/ })).toBeVisible()
  })

  test('QR code inscription affiché sur la page carte', async ({ page }) => {
    const cardId = await createCard(page, 'Carte QR Test')
    // Attendre que le composant client soit hydraté
    await page.waitForLoadState('networkidle')
    // Cliquer sur l'onglet QR
    await page.getByRole('button', { name: /QR inscription/i }).click()
    // L'image QR ou le placeholder de chargement doit apparaître
    await expect(
      page.locator('img[alt="QR Code"]').or(page.locator('.animate-pulse'))
    ).toBeVisible({ timeout: 15000 })
  })

  test('retour vers /cards depuis page carte', async ({ page }) => {
    const cardId = await createCard(page, 'Carte Retour')
    await page.waitForLoadState('networkidle')
    await page.click('a[href="/cards"]')
    await expect(page).toHaveURL(/\/cards$/)
  })
})
