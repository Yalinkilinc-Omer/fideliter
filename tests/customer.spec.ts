import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = `customer+${Date.now()}@fideliter.test`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_BUSINESS = 'Boutique Test Client'

async function createCardAndGetId(page: Page): Promise<string> {
  await page.goto('/register')
  await page.getByPlaceholder(/nom de votre établissement/i).fill(TEST_BUSINESS)
  await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
  await page.getByPlaceholder(/minimum 6/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /créer mon compte/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  // Créer une carte
  await page.goto('/cards/new')
  await page.getByPlaceholder(/nom de la carte/i).fill('Carte Client Test')
  await page.getByRole('button', { name: /créer la carte/i }).click()
  await expect(page).toHaveURL(/\/cards\/([a-f0-9-]+)/, { timeout: 10000 })

  const url = page.url()
  const match = url.match(/\/cards\/([a-f0-9-]+)/)
  return match ? match[1] : ''
}

test.describe('Portail client', () => {

  test('Page d\'inscription client s\'affiche pour une carte valide', async ({ page }) => {
    const cardId = await createCardAndGetId(page)
    expect(cardId).toBeTruthy()

    // Ouvrir la page client (sans être connecté comme business)
    await page.context().clearCookies()
    await page.goto(`/card/${cardId}`)

    await expect(page.getByText('Rejoindre le programme')).toBeVisible()
    await expect(page.getByText('Carte Client Test')).toBeVisible()
    await expect(page.getByText(TEST_BUSINESS)).toBeVisible()
    await expect(page.getByText(/Inscrivez-vous/i)).toBeVisible()
  })

  test('Inscription client sur la carte', async ({ page }) => {
    const cardId = await createCardAndGetId(page)

    await page.context().clearCookies()
    await page.goto(`/card/${cardId}`)

    // Remplir le formulaire d'inscription
    await page.getByPlaceholder(/votre prénom/i).fill('Marie')
    await page.getByPlaceholder(/votre email/i).fill('marie@test.com')
    await page.getByRole('button', { name: /obtenir ma carte/i }).click()

    // Doit rediriger vers la vue de la carte client avec un ID différent
    await expect(page).toHaveURL(/\/card\/[a-f0-9-]+/, { timeout: 10000 })
    // La carte est maintenant affichée avec les infos client
    await expect(page.getByText('Carte Client Test')).toBeVisible()
  })

  test('La carte client affiche les tampons à 0 au départ', async ({ page }) => {
    const cardId = await createCardAndGetId(page)

    await page.context().clearCookies()
    await page.goto(`/card/${cardId}`)

    await page.getByPlaceholder(/votre prénom/i).fill('Jean')
    await page.getByRole('button', { name: /obtenir ma carte/i }).click()
    await expect(page).toHaveURL(/\/card\/[a-f0-9-]+/, { timeout: 10000 })

    // 0 tampons au départ sur 10
    await expect(page.getByText(/0.*10/)).toBeVisible()
  })

  test('Page 404 pour un ID de carte inexistant', async ({ page }) => {
    await page.goto('/card/00000000-0000-0000-0000-000000000000')
    await expect(page).toHaveURL(/\/card\//)
    // Next.js notFound() doit afficher la page 404
    await expect(page.locator('body')).toContainText(/404|not found/i)
  })

  test('Le bouton notifications push est visible sur la carte client', async ({ page }) => {
    const cardId = await createCardAndGetId(page)

    await page.context().clearCookies()
    await page.goto(`/card/${cardId}`)
    await page.getByPlaceholder(/votre prénom/i).fill('Sophie')
    await page.getByRole('button', { name: /obtenir ma carte/i }).click()
    await expect(page).toHaveURL(/\/card\/[a-f0-9-]+/, { timeout: 10000 })

    await expect(page.getByText(/activer les notifications/i)).toBeVisible()
  })

  test('Le QR code client peut être affiché', async ({ page }) => {
    const cardId = await createCardAndGetId(page)

    await page.context().clearCookies()
    await page.goto(`/card/${cardId}`)
    await page.getByRole('button', { name: /obtenir ma carte/i }).click()
    await expect(page).toHaveURL(/\/card\/[a-f0-9-]+/, { timeout: 10000 })

    // Afficher le QR code
    await page.getByText(/afficher mon qr code/i).click()
    await expect(page.getByText(/montrez ce qr au commerce/i)).toBeVisible()
  })

})
