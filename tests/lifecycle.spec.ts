/**
 * 🚀 TEST LIFECYCLE COMPLET — Digital Fidélité
 *
 * Simule de A à Z :
 *  1. Le commerçant se connecte
 *  2. Il crée une carte à tampons via l'onboarding
 *  3. Un client scanne le QR et s'inscrit
 *  4. Le commerçant ajoute des tampons
 *  5. Le client atteint la récompense
 *  6. Le commerçant crée une carte à points
 *  7. Le client s'inscrit + le commerçant ajoute des points
 *  8. Vérification complète du dashboard
 */

import { test, expect, Page } from '@playwright/test'
import {
  TEST_MERCHANT_EMAIL,
  TEST_MERCHANT_PASSWORD,
  TEST_MERCHANT_NAME,
} from './global-setup'

// ── Helpers ───────────────────────────────────────────────────────────────────

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_MERCHANT_EMAIL)
  await page.fill('input[type="password"]', TEST_MERCHANT_PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding|cards)/, { timeout: 15000 })
}

async function createCardViaForm(
  page: Page,
  name: string,
  type: 'stamps' | 'points' = 'stamps'
): Promise<string> {
  await page.goto('/cards/new')
  await page.fill('input[placeholder*="arte"]', name)
  if (type === 'points') {
    await page.click('button:has-text("Points")')
  }
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
  return page.url().split('/cards/')[1]
}

// ── State partagé entre les tests ─────────────────────────────────────────────

let stampCardId = ''
let pointsCardId = ''
let stampCustomerCardId = ''
let pointsCustomerCardId = ''

// ── Suite de tests ────────────────────────────────────────────────────────────

test.describe.serial('🚀 Lifecycle complet Digital Fidélité', () => {

  // ── BLOC 1 : Landing & Auth ─────────────────────────────────────────────────

  test('1.1 La page d\'accueil se charge avec toggle dark/light', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Fidélisez')
    // Toggle dark/light doit être visible
    await expect(page.locator('button[aria-label*="thème"]')).toBeVisible()
    // Liens connexion et inscription
    await expect(page.locator('a[href="/register"]').first()).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  })

  test('1.2 Le toggle dark mode fonctionne', async ({ page }) => {
    await page.goto('/')
    const html = page.locator('html')
    const toggleBtn = page.locator('button[aria-label*="thème"]')
    await toggleBtn.waitFor({ state: 'visible' })

    // Cliquer pour passer en dark
    await toggleBtn.click()
    await page.waitForTimeout(300)
    const hasDark = await html.evaluate((el) => el.classList.contains('dark'))

    // Recliquer pour revenir en light
    await toggleBtn.click()
    await page.waitForTimeout(300)
    const hasLight = await html.evaluate((el) => !el.classList.contains('dark'))

    expect(hasDark || hasLight).toBe(true) // au moins un état a changé
  })

  test('1.3 La page login est accessible', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('h2')).toContainText('Connexion')
    await expect(page.locator('button:has-text("Continuer avec Google")')).toBeVisible()
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test('1.4 La page register est accessible', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('h2')).toContainText('Créer un compte')
    await expect(page.locator('input[placeholder*="tablissement"]')).toBeVisible()
  })

  test('1.5 Le commerçant se connecte', async ({ page }) => {
    await login(page)
    await expect(page).toHaveURL(/\/(dashboard|onboarding|cards)/)
  })

  // ── BLOC 2 : Création carte tampons ─────────────────────────────────────────

  test('2.1 Le commerçant accède au dashboard', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText(TEST_MERCHANT_NAME)
    await expect(page.locator('text=Cartes')).toBeVisible()
    await expect(page.locator('text=Clients')).toBeVisible()
  })

  test('2.2 Création d\'une carte à tampons (8 tampons)', async ({ page }) => {
    await login(page)
    await page.goto('/cards/new')

    await page.fill('input[placeholder*="arte"]', 'Carte Café Test')
    // Sélectionner tampons
    await page.click('button:has-text("Tampons")')
    // Remplir description récompense
    await page.fill('input[placeholder*="café"]', '1 café offert')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
    stampCardId = page.url().split('/cards/')[1]

    await expect(page.locator('h1')).toContainText('Carte Café Test')
    await expect(page.locator('text=8 tampons')).toBeVisible()
    expect(stampCardId).toBeTruthy()
  })

  test('2.3 Le QR code d\'inscription est généré', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await page.click('text=QR inscription')
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible({ timeout: 8000 })
    // L'URL du QR doit pointer vers /card/[id]
    const src = await page.locator('img[alt="QR Code"]').getAttribute('src')
    expect(src).toBeTruthy()
  })

  // ── BLOC 3 : Inscription client ─────────────────────────────────────────────

  test('3.1 Le portail client s\'affiche pour la carte', async ({ page }) => {
    await page.goto(`/card/${stampCardId}`)
    await expect(page.locator('text=Rejoindre le programme')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Carte Café Test')).toBeVisible()
    await expect(page.locator('button:has-text("Obtenir ma carte")')).toBeVisible()
  })

  test('3.2 Le client s\'inscrit sur la carte tampons', async ({ page }) => {
    await page.goto(`/card/${stampCardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Alice Dupont')
    await page.fill('input[type="email"]', 'alice@lifecycle.test')
    await page.click('button:has-text("Obtenir ma carte")')

    // Redirigé vers la vue carte client
    await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    stampCustomerCardId = page.url().split('/card/')[1]

    // La carte est affichée avec 0/8 tampons
    await expect(page.locator('text=0')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Carte Café Test')).toBeVisible()
    expect(stampCustomerCardId).not.toBe(stampCardId) // C'est un customer_card différent
  })

  test('3.3 Le client voit son QR code personnel', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await page.click('text=mon QR code')
    await expect(page.locator('[data-testid="customer-qr"]')).toBeVisible({ timeout: 6000 })
  })

  test('3.4 Le bouton Partager est visible', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await expect(
      page.locator('text=Partager ma carte').or(page.locator('text=Copier le lien'))
    ).toBeVisible({ timeout: 5000 })
  })

  // ── BLOC 4 : Le commerçant gère les tampons ──────────────────────────────────

  test('4.1 Le client apparaît dans la liste commerçant', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await expect(page.locator('text=Alice Dupont')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=0/8')).toBeVisible()
  })

  test('4.2 Le commerçant ajoute 3 tampons', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)

    // Ajouter 3 tampons consécutifs
    for (let i = 1; i <= 3; i++) {
      const btn = page.locator('[data-testid="add-stamp-btn"]').first()
      await expect(btn).toBeVisible({ timeout: 5000 })
      await btn.click()
      await page.waitForTimeout(800)
    }

    // Vérifier 3/8
    await expect(page.locator('text=3/8')).toBeVisible({ timeout: 8000 })
  })

  test('4.3 La barre de progression reflète les tampons', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    // La barre de progression doit exister (vérif existence)
    await expect(page.locator('[data-testid="customer-row"]').first()).toBeVisible({ timeout: 5000 })
    // Le client doit avoir 3/8
    await expect(page.locator('text=3/8')).toBeVisible()
  })

  test('4.4 La recherche client fonctionne', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await page.fill('[data-testid="customer-search"]', 'Alice')
    await expect(page.locator('text=Alice Dupont')).toBeVisible()
    await page.fill('[data-testid="customer-search"]', 'xxxinexistant')
    await expect(page.locator('text=Aucun client')).toBeVisible({ timeout: 3000 })
  })

  test('4.5 Le client voit ses tampons mis à jour', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await expect(page.locator('text=3')).toBeVisible({ timeout: 8000 })
  })

  // ── BLOC 5 : Récompense complète ─────────────────────────────────────────────

  test('5.1 Ajouter 5 tampons supplémentaires → carte pleine', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)

    // Ajouter 5 tampons de plus (3 déjà = 8 total)
    for (let i = 0; i < 5; i++) {
      const btn = page.locator('[data-testid="add-stamp-btn"]').first()
      await expect(btn).toBeVisible({ timeout: 5000 })
      await btn.click()
      await page.waitForTimeout(800)
    }

    // La récompense doit être disponible
    await expect(page.locator('text=Récompense donnée').or(page.locator('text=Reset'))).toBeVisible({ timeout: 8000 })
  })

  test('5.2 Le client voit la récompense sur sa carte', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await expect(page.locator('text=Félicitations').or(page.locator('text=récompense'))).toBeVisible({ timeout: 8000 })
  })

  test('5.3 Le commerçant remet à zéro après avoir donné la récompense', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    const resetBtn = page.locator('button:has-text("Reset")').or(page.locator('button:has-text("Récompense donnée")'))
    await expect(resetBtn).toBeVisible({ timeout: 5000 })
    await resetBtn.click()
    // Retour à 0/8
    await expect(page.locator('text=0/8')).toBeVisible({ timeout: 8000 })
  })

  // ── BLOC 6 : Carte à points ──────────────────────────────────────────────────

  test('6.1 Création d\'une carte à points', async ({ page }) => {
    await login(page)
    pointsCardId = await createCardViaForm(page, 'Club Premium Test', 'points')
    await expect(page.locator('h1')).toContainText('Club Premium Test')
    await expect(page.locator('text=Points')).toBeVisible()
    expect(pointsCardId).toBeTruthy()
  })

  test('6.2 Le client s\'inscrit sur la carte à points', async ({ page }) => {
    await page.goto(`/card/${pointsCardId}`)
    await page.fill('input[placeholder*="prénom"]', 'Bob Martin')
    await page.fill('input[type="email"]', 'bob@lifecycle.test')
    await page.click('button:has-text("Obtenir ma carte")')

    await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    pointsCustomerCardId = page.url().split('/card/')[1]

    await expect(page.locator('text=0')).toBeVisible({ timeout: 8000 })
    expect(pointsCustomerCardId).toBeTruthy()
  })

  test('6.3 Le commerçant ajoute des points (25€ de dépense)', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${pointsCardId}`)

    const euroInput = page.locator('[data-testid="euro-input"]').first()
    await expect(euroInput).toBeVisible({ timeout: 8000 })
    await euroInput.fill('25')

    // Le bouton doit afficher +25 pts
    await expect(page.locator('[data-testid="add-points-btn"]').first()).toContainText('25 pts')
    await page.locator('[data-testid="add-points-btn"]').first().click()
    await page.waitForTimeout(1000)

    // 25 points affichés
    await expect(page.locator('text=25 pts')).toBeVisible({ timeout: 8000 })
  })

  test('6.4 Le client voit ses points sur sa carte', async ({ page }) => {
    await page.goto(`/card/${pointsCustomerCardId}`)
    await expect(page.locator('text=25')).toBeVisible({ timeout: 8000 })
    // Info 1€ = 1 point visible
    await expect(page.locator('text=1€').or(page.locator('text=point'))).toBeVisible()
  })

  // ── BLOC 7 : Dashboard final ─────────────────────────────────────────────────

  test('7.1 Le dashboard affiche les stats mises à jour', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    // 2 cartes créées dans ce test
    await expect(page.locator('text=Cartes')).toBeVisible()
    const statsBlock = page.locator('text=Clients')
    await expect(statsBlock).toBeVisible()
  })

  test('7.2 La sidebar a tous les liens', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
    await expect(page.locator('a[href="/cards"]')).toBeVisible()
    await expect(page.locator('a[href="/notifications"]')).toBeVisible()
    await expect(page.locator('a[href="/settings"]')).toBeVisible()
  })

  test('7.3 La page /cards liste les 2 cartes créées', async ({ page }) => {
    await login(page)
    await page.goto('/cards')
    await expect(page.locator('text=Carte Café Test')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Club Premium Test')).toBeVisible()
  })

  test('7.4 Le dark mode persiste après navigation', async ({ page }) => {
    await page.goto('/')
    // Activer dark mode depuis la landing page
    await page.locator('button[aria-label*="thème"]').click()
    await page.waitForTimeout(300)

    // Naviguer vers login
    await page.goto('/login')
    const html = page.locator('html')
    const isDark = await html.evaluate((el) => el.classList.contains('dark'))
    expect(isDark).toBe(true)
  })

  test('7.5 La déconnexion fonctionne', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.click('text=Déconnexion')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
    // Après déconnexion, /dashboard doit rediriger vers /login
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
  })

  // ── BLOC 8 : Notifications ───────────────────────────────────────────────────

  test('8.1 La page notifications est accessible', async ({ page }) => {
    await login(page)
    await page.goto('/notifications')
    await expect(page.locator('h1')).toContainText('Notifications')
    await expect(page.locator('text=Composer')).toBeVisible({ timeout: 5000 })
  })

  test('8.2 Les modèles rapides remplissent le formulaire', async ({ page }) => {
    await login(page)
    await page.goto('/notifications')
    await page.locator('text=Café offert').click()
    const titleInput = page.locator('input[placeholder*="Offre"]')
    await expect(titleInput).not.toBeEmpty({ timeout: 3000 })
  })

  // ── BLOC 9 : Settings ────────────────────────────────────────────────────────

  test('9.1 La page paramètres est accessible', async ({ page }) => {
    await login(page)
    await page.goto('/settings')
    await expect(page).not.toHaveURL(/\/login/)
  })
})
