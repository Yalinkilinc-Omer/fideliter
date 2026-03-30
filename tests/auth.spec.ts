import { test, expect } from '@playwright/test'

const TEST_EMAIL = `test+${Date.now()}@fideliter.test`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_BUSINESS = 'Café Test Playwright'

test.describe('Authentification', () => {

  test('La page de login s\'affiche correctement', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Digital Fidélité/)
    await expect(page.getByText('Digital Fidélité')).toBeVisible()
    await expect(page.getByText('Connexion')).toBeVisible()
    await expect(page.getByPlaceholder('votre@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible()
  })

  test('Lien vers inscription visible sur la page login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: /créer un compte/i })).toBeVisible()
  })

  test('La page d\'inscription s\'affiche correctement', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Créer un compte')).toBeVisible()
    await expect(page.getByPlaceholder(/nom de votre établissement/i)).toBeVisible()
    await expect(page.getByPlaceholder('votre@email.com')).toBeVisible()
    await expect(page.getByPlaceholder(/minimum 6/i)).toBeVisible()
  })

  test('Erreur si mauvais identifiants', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('votre@email.com').fill('mauvais@email.com')
    await page.getByPlaceholder('••••••••').fill('mauvaismdp')
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page.locator('.bg-red-50')).toBeVisible({ timeout: 10000 })
  })

  test('Redirect vers dashboard si utilisateur non connecté tente d\'accéder à /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirect vers dashboard si utilisateur non connecté tente d\'accéder à /cards', async ({ page }) => {
    await page.goto('/cards')
    await expect(page).toHaveURL(/\/login/)
  })

  test('Redirect vers dashboard si utilisateur non connecté tente d\'accéder à /notifications', async ({ page }) => {
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/login/)
  })

  test('Inscription réussie avec un nouveau compte', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder(/nom de votre établissement/i).fill(TEST_BUSINESS)
    await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
    await page.getByPlaceholder(/minimum 6/i).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /créer mon compte/i }).click()
    // Après inscription, on doit être redirigé vers le dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByText(TEST_BUSINESS)).toBeVisible()
  })

  test('Connexion réussie avec les identifiants créés', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
  })

  test('Déconnexion redirige vers login', async ({ page }) => {
    // Se connecter d'abord
    await page.goto('/login')
    await page.getByPlaceholder('votre@email.com').fill(TEST_EMAIL)
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /se connecter/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    // Se déconnecter
    await page.getByRole('button', { name: /déconnexion/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

})
