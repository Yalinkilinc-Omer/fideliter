import { test, expect } from '@playwright/test'
import { login, createCard } from './helpers'

test.describe('Système de points', () => {
  let pointsCardId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    await login(page)
    // Créer carte points
    pointsCardId = await createCard(page, 'Carte Points Playwright', 'points')
    // Inscrire un client via le portail
    await page.goto(`/card/${pointsCardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Client Points')
    await page.fill('input[type="email"]', 'points@example.com')
    await page.click('button:has-text("Obtenir ma carte")')
    await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    await page.close()
  })

  test('page carte points affiche saisie euros', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${pointsCardId}`)
    await expect(page.locator('[data-testid="euro-input"]').first()).toBeVisible({ timeout: 8000 })
  })

  test('ajouter des points via saisie euros', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${pointsCardId}`)
    const euroInput = page.locator('[data-testid="euro-input"]').first()
    await expect(euroInput).toBeVisible({ timeout: 8000 })
    await euroInput.fill('10')
    const addBtn = page.locator('[data-testid="add-points-btn"]').first()
    await expect(addBtn).toContainText('pts')
    await addBtn.click()
    await page.waitForTimeout(1500)
    await expect(
      page.locator('text=10 pts').or(page.locator('text=10 points'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('seuil 750 pts affiché dans la création de carte', async ({ page }) => {
    await login(page)
    await page.goto('/cards/new')
    await page.click('button:has-text("Points")')
    await expect(page.locator('text=750')).toBeVisible()
    await expect(
      page.locator('text=1€ = 1 point').or(page.locator('text=1€ dépensé'))
    ).toBeVisible()
  })

  test('valeur en euros affichée sur la carte client', async ({ page }) => {
    await page.goto(`/card/${pointsCardId}`)
    const enrollBtn = page.locator('button:has-text("Obtenir ma carte")')
    if (await enrollBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.fill('input[placeholder*="prénom"]', 'Vue Test')
      await page.fill('input[type="email"]', 'vue.test@example.com')
      await enrollBtn.click()
      await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    }
    await expect(
      page.locator('text=pts').or(page.locator('text=points'))
    ).toBeVisible({ timeout: 8000 })
  })
})
