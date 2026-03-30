import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = `notif+${Date.now()}@fideliter.test`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_BUSINESS = 'Pizza Test Notifs'

async function setup(page: Page) {
  await page.goto('/register')
  await page.getByPlaceholder(/nom de votre établissement/i).fill(TEST_BUSINESS)
  await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
  await page.getByPlaceholder(/minimum 6/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /créer mon compte/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  // Créer une carte
  await page.goto('/cards/new')
  await page.getByPlaceholder(/nom de la carte/i).fill('Carte Pizza Test')
  await page.getByRole('button', { name: /créer la carte/i }).click()
  await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })
}

test.describe('Notifications push', () => {

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('La page notifications s\'affiche correctement', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByText('Notifications push')).toBeVisible()
    await expect(page.getByText('Modèles rapides')).toBeVisible()
    await expect(page.getByText('Composer une notification')).toBeVisible()
    await expect(page.getByText('Historique')).toBeVisible()
  })

  test('Les modèles rapides sont disponibles', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByText('Menu -1€')).toBeVisible()
    await expect(page.getByText('Café offert')).toBeVisible()
    await expect(page.getByText('Promo weekend')).toBeVisible()
    await expect(page.getByText('Double points')).toBeVisible()
    await expect(page.getByText('Nouveau menu')).toBeVisible()
    await expect(page.getByText('Récompense')).toBeVisible()
  })

  test('Un modèle rapide remplit le formulaire', async ({ page }) => {
    await page.goto('/notifications')
    await page.getByText('Menu -1€').click()
    await expect(page.getByPlaceholder(/offre du jour/i)).toHaveValue(/offre/i)
    await expect(page.locator('textarea')).toHaveValue(/menu/i)
  })

  test('La carte créée apparaît dans le sélecteur', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByRole('combobox')).toContainText('Carte Pizza Test')
  })

  test('L\'aperçu de notification s\'affiche en temps réel', async ({ page }) => {
    await page.goto('/notifications')
    await page.getByPlaceholder(/offre du jour/i).fill('Test titre')
    await expect(page.getByText('Test titre')).toBeVisible()
    await page.locator('textarea').fill('Test message')
    await expect(page.getByText('Test message')).toBeVisible()
  })

  test('Envoi notification avec 0 client retourne 0 envoyés', async ({ page }) => {
    await page.goto('/notifications')
    await page.getByPlaceholder(/offre du jour/i).fill('Test offre')
    await page.locator('textarea').fill('Test message promo')
    await page.getByRole('button', { name: /envoyer la notification/i }).click()

    // Avec 0 clients, on attend un retour de 0 envoyés
    await expect(page.locator('.bg-emerald-50, .bg-red-50').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/0 client/i)).toBeVisible()
  })

  test('Compteur de caractères du titre fonctionne', async ({ page }) => {
    await page.goto('/notifications')
    await page.getByPlaceholder(/offre du jour/i).fill('Bonjour')
    await expect(page.getByText(/7\/60/)).toBeVisible()
  })

  test('Compteur de caractères du message fonctionne', async ({ page }) => {
    await page.goto('/notifications')
    await page.locator('textarea').fill('Hello world')
    await expect(page.getByText(/11\/160/)).toBeVisible()
  })

  test('Historique vide au départ', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page.getByText('Aucune notification envoyée')).toBeVisible()
  })

  test('Historique se met à jour après envoi', async ({ page }) => {
    await page.goto('/notifications')
    await page.getByText('Café offert').click()
    await page.getByRole('button', { name: /envoyer la notification/i }).click()
    await expect(page.locator('.bg-emerald-50, .bg-red-50').first()).toBeVisible({ timeout: 10000 })

    // L'historique doit maintenant afficher la notification
    await expect(page.getByText('Café offert !')).toBeVisible()
  })

})
