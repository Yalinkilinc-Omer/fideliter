import { test, expect } from '@playwright/test'
import { login, createCard } from './helpers'

test.describe.serial('Portail client', () => {
  let cardId: string

  test('création de la carte pour les tests client', async ({ page }) => {
    await login(page)
    cardId = await createCard(page, 'Carte Client Test', 'stamps')
    expect(cardId).toBeTruthy()
  })

  test('page /card/[id] affiche le formulaire inscription', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    await expect(page.locator('text=Rejoindre le programme')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('button:has-text("Obtenir ma carte")')).toBeVisible()
  })

  test('inscription client sur la carte', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Jean Test')
    await page.fill('input[type="email"]', 'jean.test@example.com')
    await page.click('button:has-text("Obtenir ma carte")')
    await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    await expect(
      page.locator('text=Jean Test').or(page.locator('text=tampons').or(page.locator('text=0/')))
    ).toBeVisible({ timeout: 8000 })
  })

  test('bouton QR code client visible après inscription', async ({ page }) => {
    await page.goto(`/card/${cardId}`)
    const enrollBtn = page.locator('button:has-text("Obtenir ma carte")')
    if (await enrollBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.fill('input[placeholder*="prénom"]', 'Marie Test')
      await page.fill('input[type="email"]', 'marie.test@example.com')
      await enrollBtn.click()
      await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    }
    await expect(
      page.locator('text=Afficher mon QR code').or(page.locator('[data-testid="customer-qr"]'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('carte invalide retourne 404', async ({ page }) => {
    await page.goto('/card/00000000-0000-0000-0000-000000000000')
    await expect(
      page.locator('text=404').or(page.locator('text=not found').or(page.locator('text=trouvé')))
    ).toBeVisible({ timeout: 8000 })
  })
})
