import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = `cards+${Date.now()}@fideliter.test`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_BUSINESS = 'Restaurant Test Cards'

// Helper : créer un compte et se connecter
async function registerAndLogin(page: Page) {
  await page.goto('/register')
  await page.getByPlaceholder(/nom de votre établissement/i).fill(TEST_BUSINESS)
  await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
  await page.getByPlaceholder(/minimum 6/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /créer mon compte/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
}

test.describe('Gestion des cartes fidélité', () => {

  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page)
  })

  test('Le dashboard affiche les stats correctement', async ({ page }) => {
    await expect(page.getByText('Tableau de bord')).toBeVisible()
    await expect(page.getByText('0').first()).toBeVisible() // 0 cartes au départ
  })

  test('La page des cartes s\'affiche avec état vide', async ({ page }) => {
    await page.goto('/cards')
    await expect(page.getByText('Mes cartes fidélité')).toBeVisible()
    await expect(page.getByText(/aucune carte/i)).toBeVisible()
  })

  test('Accès à la page de création de carte', async ({ page }) => {
    await page.goto('/cards/new')
    await expect(page.getByText('Nouvelle carte')).toBeVisible()
    await expect(page.getByPlaceholder(/nom de la carte/i)).toBeVisible()
  })

  test('Création d\'une carte à tampons', async ({ page }) => {
    await page.goto('/cards/new')

    // Remplir le formulaire
    await page.getByPlaceholder(/nom de la carte/i).fill('Carte Café Test')
    // Type tampons est sélectionné par défaut
    await expect(page.getByText('Tampons')).toBeVisible()
    // Remplir la récompense
    await page.getByPlaceholder(/1 café offert/i).fill('1 café offert après 10 tampons')

    // Soumettre
    await page.getByRole('button', { name: /créer la carte/i }).click()

    // Doit rediriger vers la page détail de la carte
    await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })
    await expect(page.getByText('Carte Café Test')).toBeVisible()
  })

  test('Création d\'une carte à points', async ({ page }) => {
    await page.goto('/cards/new')

    await page.getByPlaceholder(/nom de la carte/i).fill('Carte Points VIP')
    // Sélectionner Points
    await page.getByText('Points').click()
    await page.getByPlaceholder(/1 café offert/i).fill('-10% après 100 points')

    await page.getByRole('button', { name: /créer la carte/i }).click()

    await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })
    await expect(page.getByText('Carte Points VIP')).toBeVisible()
  })

  test('La carte créée apparaît dans la liste', async ({ page }) => {
    // Créer une carte
    await page.goto('/cards/new')
    await page.getByPlaceholder(/nom de la carte/i).fill('Carte Liste Test')
    await page.getByRole('button', { name: /créer la carte/i }).click()
    await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })

    // Aller sur la liste
    await page.goto('/cards')
    await expect(page.getByText('Carte Liste Test')).toBeVisible()
  })

  test('La page détail d\'une carte affiche le QR code d\'inscription', async ({ page }) => {
    // Créer une carte
    await page.goto('/cards/new')
    await page.getByPlaceholder(/nom de la carte/i).fill('Carte QR Test')
    await page.getByRole('button', { name: /créer la carte/i }).click()
    await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })

    // Cliquer sur l'onglet QR
    await page.getByText("QR d'inscription").click()
    await expect(page.getByText(/clients scannent ce qr/i)).toBeVisible()
  })

  test('Bouton copier le lien fonctionne sur la page carte', async ({ page }) => {
    await page.goto('/cards/new')
    await page.getByPlaceholder(/nom de la carte/i).fill('Carte Copie Test')
    await page.getByRole('button', { name: /créer la carte/i }).click()
    await expect(page).toHaveURL(/\/cards\/[a-f0-9-]+/, { timeout: 10000 })

    await page.getByText("QR d'inscription").click()
    await expect(page.getByRole('button', { name: /copier lien/i })).toBeVisible()
  })

  test('Erreur si nom de carte vide', async ({ page }) => {
    await page.goto('/cards/new')
    await page.getByRole('button', { name: /créer la carte/i }).click()
    // Le formulaire HTML5 devrait bloquer la soumission
    const nameInput = page.getByPlaceholder(/nom de la carte/i)
    await expect(nameInput).toBeFocused()
  })

})
