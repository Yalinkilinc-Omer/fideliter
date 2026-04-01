import { test, expect } from '@playwright/test'
import { login, createCard } from './helpers'

test.describe('Cartes fidélité', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('page /cards accessible après connexion', async ({ page }) => {
    await page.goto('/cards')
    await expect(page.getByRole('heading', { name: /cartes/ })).toBeVisible()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('bouton Nouvelle carte visible sur /cards', async ({ page }) => {
    await page.goto('/cards')
    const createCardLink = page.locator('a[href="/cards/new"]').first()
    await expect(createCardLink).toBeVisible()
  })

  test('page /cards/new affiche le formulaire', async ({ page }) => {
    await page.goto('/cards/new')
    await expect(page.getByRole('heading', { name: /Nouvelle carte/ })).toBeVisible()
    await expect(page.locator('input[placeholder*="Carte"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Tampons/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Points/ })).toBeVisible()
  })

  test('création carte tampons', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Tampons')
    await page.click('button:has-text("Tampons")')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Carte Test Tampons/ })).toBeVisible()
  })

  test('création carte points avec seuil 750', async ({ page }) => {
    await page.goto('/cards/new')
    await page.fill('input[placeholder*="Carte"]', 'Carte Test Points')
    await page.click('button:has-text("Points")')
    await expect(page.getByText('750 pts', { exact: true }).first()).toBeVisible()
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { name: /Carte Test Points/ })).toBeVisible()
  })

  test('QR code inscription affiché sur la page carte', async ({ page }) => {
    const cardId = await createCard(page, 'Carte QR Test')
    await page.goto(`/cards/${cardId}`)
    await page.click('text=QR inscription')
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible({ timeout: 8000 })
  })

  test('retour vers /cards depuis page carte', async ({ page }) => {
    const cardId = await createCard(page, 'Carte Retour')
    await page.goto(`/cards/${cardId}`)
    await page.click('a[href="/cards"]')
    await expect(page).toHaveURL(/\/cards$/)
  })
})
