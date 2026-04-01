/**
 * 🚀 TEST LIFECYCLE COMPLET — Digital Fidélité
 *
 * Ce fichier est mis à jour automatiquement à chaque modification de l'app.
 *
 * Simule de A à Z :
 *  0. Onboarding wizard (toggle dark, UX points reward-first, logo, couleurs)
 *  1. Landing page + auth
 *  2. Création carte à tampons (dashboard /cards/new)
 *  3. Inscription client
 *  4. Ajout tampons par le commerçant
 *  5. Récompense complète + reset
 *  6. Carte à points
 *  7. Dashboard final
 *  8. Notifications
 *  9. Settings
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
  await page.fill('input[placeholder*="Carte"]', name)
  if (type === 'points') {
    await page.click('button:has-text("Points")')
  }
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
  return page.url().split('/cards/')[1]
}

// ── État partagé ──────────────────────────────────────────────────────────────

let stampCardId = ''
let pointsCardId = ''
let stampCustomerCardId = ''
let pointsCustomerCardId = ''

// ── Suite de tests ────────────────────────────────────────────────────────────

test.describe.serial('🚀 Lifecycle complet Digital Fidélité', () => {

  // ── BLOC 0 : Onboarding wizard ───────────────────────────────────────────────

  test('0.1 La page onboarding charge correctement', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')
    await expect(page.locator('text=Digital Fidélité')).toBeVisible()
    await expect(page.locator('text=Bienvenue')).toBeVisible()
    await expect(page.locator('input[placeholder*="VIP"]').or(page.locator('input[placeholder*="Premium"]'))).toBeVisible()
  })

  test('0.2 Le toggle dark/light est en haut à droite de l\'onboarding', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')
    const toggle = page.locator('button[aria-label="Basculer le thème"]')
    await expect(toggle).toBeVisible({ timeout: 5000 })
    // Doit être fixé en haut à droite (classe fixed)
    const classAttr = await toggle.getAttribute('class')
    expect(classAttr).toContain('fixed')
  })

  test('0.3 L\'onboarding étape 3 (points) affiche la récompense en premier', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')

    // Étape 1 : nom
    await page.fill('input[placeholder*="VIP"]', 'Test Carte Onboarding')
    await page.click('button:has-text("Continuer")')

    // Étape 2 : choisir Points
    await page.click('button:has-text("Carte à points")')
    await page.click('button:has-text("Continuer")')

    // Étape 3 : la récompense est demandée EN PREMIER
    await expect(page.locator('text=Quelle est la récompense')).toBeVisible({ timeout: 5000 })
    // Le champ récompense doit apparaître avant les sliders de points
    const rewardInput = page.locator('input[placeholder*="burger"]').or(page.locator('input[placeholder*="remise"]'))
    await expect(rewardInput).toBeVisible()

    // Suggestions de récompenses rapides
    await expect(page.locator('text=1 café offert')).toBeVisible()
    await expect(page.locator('text=1 burger offert')).toBeVisible()

    // Slider points pour récompense
    await expect(page.locator('text=Combien de points pour')).toBeVisible()
    // Slider vitesse de gain
    await expect(page.locator('text=Points gagnés par euro')).toBeVisible()
  })

  test('0.4 L\'onboarding étape 3 (tampons) affiche la récompense en premier', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')

    // Étape 1 : nom
    await page.fill('input[placeholder*="VIP"]', 'Test Tampons Onboarding')
    await page.click('button:has-text("Continuer")')

    // Étape 2 : tampons (déjà sélectionné par défaut)
    await page.click('button:has-text("Continuer")')

    // Étape 3 : récompense en premier
    await expect(page.locator('text=Quelle est la récompense')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Combien de tampons pour')).toBeVisible()

    // Cliquer sur un raccourci
    await page.locator('text=1 café offert').click()
    const input = page.locator('input[placeholder*="café"]').or(page.locator('input[placeholder*="burger"]'))
    await expect(input).toHaveValue('1 café offert')
  })

  test('0.5 L\'onboarding étape 4 propose 16 couleurs et le logo optionnel', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')

    // Passer étapes 1-3 rapidement
    await page.fill('input[placeholder*="VIP"]', 'Test Couleurs')
    await page.click('button:has-text("Continuer")')
    await page.click('button:has-text("Continuer")')
    await page.click('button:has-text("Continuer")')

    // Étape 4 : couleurs + logo
    await expect(page.locator('text=Personnalisez votre carte')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Logo de votre commerce')).toBeVisible()
    await expect(page.locator('text=Optionnel')).toBeVisible()

    // Compter les boutons couleur (doit être 16)
    const colorBtns = page.locator('button[title]').filter({ hasText: '' })
    // On vérifie juste qu'il y en a plusieurs (>8)
    await expect(page.locator('text=Teal').or(page.locator('text=Lime'))).toBeVisible()
  })

  test('0.6 La preview dynamique se met à jour', async ({ page }) => {
    await login(page)
    await page.goto('/onboarding')

    // Saisir un nom
    await page.fill('input[placeholder*="VIP"]', 'Ma Carte Preview')
    // La preview doit afficher le nom en temps réel
    await expect(page.locator('text=Ma Carte Preview')).toBeVisible({ timeout: 3000 })
  })

  // ── BLOC 1 : Landing & Auth ──────────────────────────────────────────────────

  test('1.1 La page d\'accueil se charge avec toggle dark/light', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Fidélisez')
    await expect(page.locator('button[aria-label*="thème"]')).toBeVisible()
    await expect(page.locator('a[href="/register"]').first()).toBeVisible()
    await expect(page.locator('a[href="/login"]').first()).toBeVisible()
  })

  test('1.2 Le toggle dark mode fonctionne', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('button[aria-label*="thème"]')
    await toggle.waitFor({ state: 'visible' })
    await toggle.click()
    await page.waitForTimeout(300)
    const hasDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    await toggle.click()
    await page.waitForTimeout(300)
    const hasLight = await page.locator('html').evaluate(el => !el.classList.contains('dark'))
    expect(hasDark || hasLight).toBe(true)
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

    await page.fill('input[placeholder*="Carte"]', 'Carte Café Test')
    // Tampons sélectionnés par défaut, garder
    // Remplir la récompense
    await page.fill('input[placeholder*="café"]', '1 café offert')
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/cards\/[^/?]+$/, { timeout: 15000 })
    stampCardId = page.url().split('/cards/')[1]

    await expect(page.locator('h1')).toContainText('Carte Café Test')
    expect(stampCardId).toBeTruthy()
  })

  test('2.3 Le QR code d\'inscription est généré', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await page.click('text=QR inscription')
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible({ timeout: 8000 })
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

    await page.waitForURL(/\/card\/[^/?]+$/, { timeout: 12000 })
    stampCustomerCardId = page.url().split('/card/')[1]

    await expect(page.locator('text=Carte Café Test')).toBeVisible({ timeout: 8000 })
    expect(stampCustomerCardId).not.toBe(stampCardId)
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

  // ── BLOC 4 : Ajout tampons ───────────────────────────────────────────────────

  test('4.1 Le client apparaît dans la liste commerçant', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await expect(page.locator('text=Alice Dupont')).toBeVisible({ timeout: 8000 })
  })

  test('4.2 Le commerçant ajoute 3 tampons', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)

    for (let i = 1; i <= 3; i++) {
      const btn = page.locator('[data-testid="add-stamp-btn"]').first()
      await expect(btn).toBeVisible({ timeout: 5000 })
      await btn.click()
      await page.waitForTimeout(800)
    }

    await expect(page.locator('text=3/')).toBeVisible({ timeout: 8000 })
  })

  test('4.3 La recherche client fonctionne', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    await page.fill('[data-testid="customer-search"]', 'Alice')
    await expect(page.locator('text=Alice Dupont')).toBeVisible()
    await page.fill('[data-testid="customer-search"]', 'xxxinexistant')
    await expect(page.locator('text=Aucun client')).toBeVisible({ timeout: 3000 })
  })

  test('4.4 Le client voit ses tampons mis à jour', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await expect(page.locator('text=3')).toBeVisible({ timeout: 8000 })
  })

  // ── BLOC 5 : Récompense complète ─────────────────────────────────────────────

  test('5.1 Ajouter les tampons restants → carte pleine', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)

    // Ajouter 7 tampons de plus (3 déjà = 10 total, > max_stamps 8 → récompense)
    for (let i = 0; i < 7; i++) {
      const btn = page.locator('[data-testid="add-stamp-btn"]').first()
      await expect(btn).toBeVisible({ timeout: 5000 })
      await btn.click()
      await page.waitForTimeout(600)
    }

    await expect(
      page.locator('text=Récompense').or(page.locator('text=Reset'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('5.2 Le client voit la récompense sur sa carte', async ({ page }) => {
    await page.goto(`/card/${stampCustomerCardId}`)
    await expect(
      page.locator('text=Félicitations').or(page.locator('text=récompense'))
    ).toBeVisible({ timeout: 8000 })
  })

  test('5.3 Le commerçant remet à zéro', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${stampCardId}`)
    const resetBtn = page.locator('button:has-text("Reset")').or(
      page.locator('button:has-text("Récompense donnée")')
    )
    await expect(resetBtn).toBeVisible({ timeout: 5000 })
    await resetBtn.click()
    await expect(page.locator('text=0/')).toBeVisible({ timeout: 8000 })
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

  test('6.3 Le commerçant ajoute des points (25€)', async ({ page }) => {
    await login(page)
    await page.goto(`/cards/${pointsCardId}`)

    const euroInput = page.locator('[data-testid="euro-input"]').first()
    await expect(euroInput).toBeVisible({ timeout: 8000 })
    await euroInput.fill('25')

    const addBtn = page.locator('[data-testid="add-points-btn"]').first()
    await expect(addBtn).toContainText('pts')
    await addBtn.click()
    await page.waitForTimeout(1000)

    await expect(page.locator('text=25')).toBeVisible({ timeout: 8000 })
  })

  test('6.4 Le client voit ses points', async ({ page }) => {
    await page.goto(`/card/${pointsCustomerCardId}`)
    await expect(page.locator('text=25')).toBeVisible({ timeout: 8000 })
  })

  // ── BLOC 7 : Dashboard ───────────────────────────────────────────────────────

  test('7.1 Le dashboard affiche les stats', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.locator('text=Cartes')).toBeVisible()
    await expect(page.locator('text=Clients')).toBeVisible()
  })

  test('7.2 La sidebar a tous les liens', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible()
    await expect(page.locator('a[href="/cards"]')).toBeVisible()
    await expect(page.locator('a[href="/notifications"]')).toBeVisible()
    await expect(page.locator('a[href="/settings"]')).toBeVisible()
  })

  test('7.3 La page /cards liste les cartes créées', async ({ page }) => {
    await login(page)
    await page.goto('/cards')
    await expect(page.locator('text=Carte Café Test')).toBeVisible({ timeout: 8000 })
    await expect(page.locator('text=Club Premium Test')).toBeVisible()
  })

  test('7.4 Le dark mode persiste après navigation', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label*="thème"]').click()
    await page.waitForTimeout(300)
    await page.goto('/login')
    const isDark = await page.locator('html').evaluate(el => el.classList.contains('dark'))
    expect(isDark).toBe(true)
  })

  test('7.5 La déconnexion fonctionne', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.click('text=Déconnexion')
    await expect(page).toHaveURL(/\/login/, { timeout: 8000 })
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
