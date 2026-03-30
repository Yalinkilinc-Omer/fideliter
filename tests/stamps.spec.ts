import { test, expect, Page } from '@playwright/test'

const TEST_EMAIL = `stamps+${Date.now()}@fideliter.test`
const TEST_PASSWORD = 'TestPassword123!'

async function setupWithCustomer(page: Page): Promise<{ cardId: string; customerCardId: string }> {
  // Créer le compte business
  await page.goto('/register')
  await page.getByPlaceholder(/nom de votre établissement/i).fill('Boulangerie Test')
  await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
  await page.getByPlaceholder(/minimum 6/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /créer mon compte/i }).click()
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

  // Créer une carte
  await page.goto('/cards/new')
  await page.getByPlaceholder(/nom de la carte/i).fill('Carte Boulangerie')
  await page.getByRole('button', { name: /créer la carte/i }).click()
  await expect(page).toHaveURL(/\/cards\/([a-f0-9-]+)/, { timeout: 10000 })
  const cardUrl = page.url()
  const cardId = cardUrl.match(/\/cards\/([a-f0-9-]+)/)?.[1] || ''

  // Inscrire un client depuis un autre contexte (pas connecté)
  const customerPage = await page.context().newPage()
  await customerPage.goto(`/card/${cardId}`)
  await customerPage.getByPlaceholder(/votre prénom/i).fill('Pierre')
  await customerPage.getByRole('button', { name: /obtenir ma carte/i }).click()
  await expect(customerPage).toHaveURL(/\/card\/([a-f0-9-]+)/, { timeout: 10000 })
  const customerUrl = customerPage.url()
  const customerCardId = customerUrl.match(/\/card\/([a-f0-9-]+)/)?.[1] || ''
  await customerPage.close()

  return { cardId, customerCardId }
}

test.describe('Tampons et points', () => {

  test('Un client inscrit apparaît dans la liste', async ({ page }) => {
    const { cardId } = await setupWithCustomer(page)
    await page.goto(`/cards/${cardId}`)
    await expect(page.getByText('Pierre')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('1 client')).toBeVisible()
  })

  test('Ajouter un tampon à un client', async ({ page }) => {
    const { cardId } = await setupWithCustomer(page)
    await page.goto(`/cards/${cardId}`)

    // Le client devrait avoir 0/10 tampons
    await expect(page.getByText('0/10')).toBeVisible()

    // Cliquer sur +1 Tampon
    await page.getByRole('button', { name: /\+1 tampon/i }).click()

    // Le tampon doit passer à 1/10
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 })
  })

  test('La barre de progression avance avec les tampons', async ({ page }) => {
    const { cardId } = await setupWithCustomer(page)
    await page.goto(`/cards/${cardId}`)

    await page.getByRole('button', { name: /\+1 tampon/i }).click()
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 })

    // La progress bar doit exister et être non nulle
    const progressBar = page.locator('.bg-indigo-500').first()
    await expect(progressBar).toBeVisible()
  })

  test('Rechercher un client fonctionne', async ({ page }) => {
    const { cardId } = await setupWithCustomer(page)
    await page.goto(`/cards/${cardId}`)

    // Rechercher par nom
    await page.getByPlaceholder(/rechercher un client/i).fill('Pierre')
    await expect(page.getByText('Pierre')).toBeVisible()

    // Rechercher un nom inexistant
    await page.getByPlaceholder(/rechercher un client/i).fill('Dupont')
    await expect(page.getByText(/aucun client/i)).toBeVisible()
  })

  test('La carte client se met à jour après tampon ajouté', async ({ page }) => {
    const { cardId, customerCardId } = await setupWithCustomer(page)

    // Ajouter tampon depuis le dashboard
    await page.goto(`/cards/${cardId}`)
    await page.getByRole('button', { name: /\+1 tampon/i }).click()
    await expect(page.getByText('1/10')).toBeVisible({ timeout: 5000 })

    // Vérifier sur la carte client
    const customerPage = await page.context().newPage()
    await customerPage.goto(`/card/${customerCardId}`)
    await expect(customerPage.getByText(/1.*10/)).toBeVisible({ timeout: 5000 })
    await customerPage.close()
  })

  test('Le bouton scanner QR est visible dans le dashboard', async ({ page }) => {
    const { cardId } = await setupWithCustomer(page)
    await page.goto(`/cards/${cardId}`)
    await expect(page.getByRole('button', { name: /scanner qr/i })).toBeVisible()
  })

})
